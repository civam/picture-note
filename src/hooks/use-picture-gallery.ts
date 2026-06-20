import { MediaProps } from "@/constants/picture";
import { usePictureDb } from "@/hooks/use-picture-db";
import { randomUUID } from "expo-crypto";
import { AssetField, MediaType, Query } from "expo-media-library";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const BATCH_SIZE = 30;
export const GALLERY_COLUMNS = 3;

// Each section groups assets by calendar day; data is pre-chunked into rows for SectionList.
export type GallerySection = {
  title: string;   // e.g. "June 20, 2026"
  dateKey: string; // e.g. "2026-06-20" — used for stable descending sort
  data: MediaProps[][];
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function buildSections(assets: MediaProps[]): GallerySection[] {
  const grouped = new Map<string, { title: string; items: MediaProps[] }>();
  for (const asset of assets) {
    // modificationTime is in milliseconds; fall back to epoch if absent
    const date = new Date(asset.modificationTime ?? 0);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;
    const title = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped.has(dateKey)) grouped.set(dateKey, { title, items: [] });
    grouped.get(dateKey)!.items.push(asset);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, { title, items }]) => ({
      title,
      dateKey,
      data: chunkArray(items, GALLERY_COLUMNS),
    }));
}

export type UseGalleryReturn = {
  sections: GallerySection[];
  isLoading: boolean;
  isRefreshing: boolean;
  selectedIds: Set<string>;
  isMultiSelectEnabled: boolean;
  hasNextPage: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
  toggleSelect: (mediaPath: string) => void;
  handleLongPress: (mediaPath: string) => void;
  handleAddSelected: () => Promise<void>;
  handleDeleteSelected: () => Promise<void>;
  handleCancel: () => void;
  fetchMore: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshFromLibrary: () => Promise<void>;
};

export function useGallery(): UseGalleryReturn {
  const [assets, setAssets] = useState<MediaProps[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isMultiSelectEnabled, setIsMultiSelectEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs hold mutable pagination state so fetchMedia never captures stale values
  const currentOffsetRef = useRef(0);
  const hasNextPageRef = useRef(true);
  const isLoadingRef = useRef(false);
  // DB records cached per session; refreshData() updates it
  const dbCacheRef = useRef<MediaProps[]>([]);
  const dbCacheLoadedRef = useRef(false);

  const { getAllMedias, addMultipleMedia, deleteMedia } = usePictureDb();

  const sections = useMemo(() => buildSections(assets), [assets]);

  const showToast = (message: string, isError = false) =>
    Toast.show({ type: isError ? "error" : "success", text1: message });

  const fetchMedia = useCallback(async () => {
    if (isLoadingRef.current || !hasNextPageRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // Load DB records once per session
      if (!dbCacheLoadedRef.current) {
        dbCacheRef.current = await getAllMedias();
        dbCacheLoadedRef.current = true;
      }

      const queriedAssets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .orderBy({ key: AssetField.MODIFICATION_TIME, ascending: false })
        .limit(BATCH_SIZE)
        .offset(currentOffsetRef.current)
        .exe();

      // Fetch all asset metadata in parallel using getInfo() — one call per asset
      // instead of separate getUri() + getMediaType() + getModificationTime()
      const newAssets: MediaProps[] = await Promise.all(
        queriedAssets.map(async (a) => {
          const info = await a.getInfo();
          const rec = dbCacheRef.current.find((r) => r.mediaPath === info.uri);
          return {
            uniqueId: randomUUID(),
            id: rec?.id,
            mediaPath: info.uri,
            mediaType: info.mediaType,
            notes: rec?.notes,
            addedOn: rec?.addedOn,
            // modificationTime in ms; fall back to current time if null
            modificationTime: info.modificationTime ?? Date.now(),
          };
        }),
      );

      currentOffsetRef.current += queriedAssets.length;
      const reachedEnd = queriedAssets.length < BATCH_SIZE;
      hasNextPageRef.current = !reachedEnd;
      setHasNextPage(!reachedEnd);
      setAssets((prev) => [...prev, ...newAssets]);
    } catch (error) {
      console.error("fetchMedia error", error);
      showToast("Unable to load media", true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [getAllMedias]);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionGranted(status === "granted");
      if (status === "granted") await fetchMedia();
    } catch {
      showToast("Permission request failed", true);
    }
  }, [fetchMedia]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await MediaLibrary.getPermissionsAsync();
        setPermissionGranted(status === "granted");
        if (status === "granted") await fetchMedia();
      } catch (err) {
        console.error(err);
      }
    })();
    // Run once on mount — fetchMedia ref is stable for first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = useCallback((mediaPath: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mediaPath)) next.delete(mediaPath);
      else next.add(mediaPath);
      return next;
    });
  }, []);

  const handleLongPress = useCallback((mediaPath: string) => {
    setIsMultiSelectEnabled(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(mediaPath);
      return next;
    });
  }, []);

  const handleAddSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const toAdd = assets.filter((a) => selectedIds.has(a.mediaPath) && !a.id);
    if (toAdd.length === 0) {
      showToast("Selected items are already saved", true);
      return;
    }
    try {
      const results = await addMultipleMedia(toAdd);
      setAssets((prev) =>
        prev.map((a) => {
          const r = results.find((r) => r.mediaPath === a.mediaPath);
          return r ? { ...a, id: r.id } : a;
        }),
      );
      dbCacheRef.current = await getAllMedias();
      showToast(`${results.length} item${results.length !== 1 ? "s" : ""} saved`);
    } catch {
      showToast("Failed to save items", true);
    } finally {
      setSelectedIds(new Set());
      setIsMultiSelectEnabled(false);
    }
  }, [addMultipleMedia, assets, getAllMedias, selectedIds]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const toDelete = assets.filter((a) => selectedIds.has(a.mediaPath) && !!a.id);
    if (toDelete.length === 0) {
      showToast("No saved items selected", true);
      return;
    }
    try {
      await Promise.all(toDelete.map((a) => deleteMedia(a.id!)));
      // Keep items visible in the gallery — just clear their DB id/notes
      setAssets((prev) =>
        prev.map((a) =>
          selectedIds.has(a.mediaPath) && a.id
            ? { ...a, id: undefined, notes: undefined }
            : a,
        ),
      );
      dbCacheRef.current = await getAllMedias();
      showToast(
        `${toDelete.length} item${toDelete.length !== 1 ? "s" : ""} removed from records`,
      );
    } catch {
      showToast("Failed to delete items", true);
    } finally {
      setSelectedIds(new Set());
      setIsMultiSelectEnabled(false);
    }
  }, [assets, deleteMedia, getAllMedias, selectedIds]);

  const handleCancel = useCallback(() => {
    setSelectedIds(new Set());
    setIsMultiSelectEnabled(false);
  }, []);

  const fetchMore = useCallback(async () => {
    await fetchMedia();
  }, [fetchMedia]);

  // Called on screen focus to sync DB state into current asset list
  const refreshData = useCallback(async () => {
    try {
      const dbRecords = await getAllMedias();
      dbCacheRef.current = dbRecords;
      setAssets((prev) =>
        prev.map((a) => {
          const r = dbRecords.find((r) => r.mediaPath === a.mediaPath);
          return r
            ? { ...a, id: r.id, notes: r.notes }
            : { ...a, id: undefined, notes: undefined };
        }),
      );
    } catch {
      showToast("Failed to refresh", true);
    }
  }, [getAllMedias]);

  // Pull-to-refresh: wipes local state and re-queries the media library from scratch
  const refreshFromLibrary = useCallback(async () => {
    setIsRefreshing(true);
    currentOffsetRef.current = 0;
    hasNextPageRef.current = true;
    isLoadingRef.current = false;
    dbCacheLoadedRef.current = false;
    setAssets([]);
    await fetchMedia();
    setIsRefreshing(false);
  }, [fetchMedia]);

  return {
    sections,
    isLoading,
    isRefreshing,
    selectedIds,
    isMultiSelectEnabled,
    hasNextPage,
    permissionGranted,
    requestPermission,
    toggleSelect,
    handleLongPress,
    handleAddSelected,
    handleDeleteSelected,
    handleCancel,
    fetchMore,
    refreshData,
    refreshFromLibrary,
  };
}
