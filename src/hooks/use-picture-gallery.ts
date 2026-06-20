import { MediaProps } from "@/constants/picture";
import { usePictureDb } from "@/hooks/use-picture-db";
import { randomUUID } from "expo-crypto";
import * as MediaLibrary from "expo-media-library";
import { MediaType, Query } from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const BATCH_LIMIT = 30;

type UseMultiSelectReturn = {
  assets: MediaProps[];
  isLoading: boolean;
  selectedIds: Set<string>;
  isMultiSelectEnabled: boolean;
  hasNextPage: boolean;
  requestPermission: () => Promise<void>;
  toggleSelect: (id: string) => void;
  handleLongPress: (id: string) => void;
  handleAddPress: () => Promise<void>;
  handleCancel: () => void;
  fetchMore: () => Promise<void>;
  handleDelete: () => Promise<void>;
  refreshData: () => Promise<void>;
  permissionGranted: boolean;
};

export function useMultiSelect(): UseMultiSelectReturn {
  const [assets, setAssets] = useState<MediaProps[]>([]);
  const [isDbAssetsLoaded, setIsDbAssetsLoaded] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isMultiSelectEnabled, setIsMultiSelectEnabled] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const { getAllMedias, addMultipleMedia, deleteMedia } = usePictureDb();

  const showToast = (message: string, isError = false) => {
    Toast.show({ type: isError ? "error" : "success", text1: message });
  };

  const fetchMedia = useCallback(async () => {
    if (isLoading || !hasNextPage) return;
    setIsLoading(true);
    try {
      const queriedAssets = await new Query()
        .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaType.IMAGE) // Filter matching images
        .orderBy({ key: MediaLibrary.AssetField.MODIFICATION_TIME, ascending: false }) // Sort ascending
        .limit(BATCH_LIMIT) // Fetch limited bulk record
        .offset(currentOffset) // Progressive page scanning
        .exe(); // Execute the native request

      let uploadedAssest: MediaProps[] = [];

      if (!isDbAssetsLoaded) {
        //@ts-ignore
        uploadedAssest = await getAllMedias();
        setIsDbAssetsLoaded(true);
      }

      const resolved: MediaProps[] = await Promise.all(
        queriedAssets.map(async (a) => {
          const mediaPath = await a.getUri(); // Use the URI as the mediaPath
          const dbAssest = uploadedAssest?.find((u) => u.mediaPath === mediaPath);
          return {
            uniqueId: randomUUID(),
            id: dbAssest?.id,
            mediaPath,
            mediaType: await a.getMediaType(), // Get the media type
            notes: dbAssest?.notes
          };
        }),
      );

      setAssets((prev) => [...prev, ...resolved]);
      setCurrentOffset(currentOffset + queriedAssets.length);
      // If we received fewer assets than the requested limit, we have reached the end
      if (queriedAssets.length < BATCH_LIMIT) {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("fetchMedia error", error);
      showToast("Unable to load media", true);
    } finally {
      setIsLoading(false);
    }
  }, [currentOffset, getAllMedias, hasNextPage, isLoading]);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionGranted(status === "granted");
      if (status === "granted") {
        // Reset state and fetch first page
        setAssets([]);
        setCurrentOffset(0);
        setHasNextPage(true);
        await fetchMedia();
      }
    } catch (err) {
      console.error("permission request failed", err);
      showToast("Permission request failed", true);
    }
  }, [fetchMedia]);

  useEffect(() => {
    // Try to get current permission on mount
    (async () => {
      try {
        const { status } = await MediaLibrary.getPermissionsAsync();
        setPermissionGranted(status === "granted");

        if (status === "granted") {
          await fetchMedia();
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [fetchMedia]);

  const toggleSelect = (mediaPath: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mediaPath)) next.delete(mediaPath);
      else next.add(mediaPath);
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    setIsMultiSelectEnabled(true);
    toggleSelect(id);
  };

  const handleAddPress = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const selectedAssets = assets.filter(
      (a) => selectedIds.has(a.mediaPath) && !a.id,
    );
    if (selectedAssets.length === 0) {
      showToast("No new items to upload", true);
      return;
    }
    try {
      const res = await addMultipleMedia(selectedAssets);
      if (res.length > 0) {
        showToast(`${res.length} media items uploaded successfully`);
        // Mark selected as uploaded in state
        setAssets((prev) =>
          prev.map((p) => {
            const dbRecord = res.find((r) => r.mediaPath === p.mediaPath);
            if (dbRecord) return { ...p, id: dbRecord.id };
            return { ...p };
          }),
        );
      } else {
        showToast(`no media items uploaded`, true);
      }
      setSelectedIds(new Set());
      setIsMultiSelectEnabled(false);
    } catch (err) {
      console.error(err);
      showToast("Upload failed", true);
    }
  }, [addMultipleMedia, assets, selectedIds]);

  const handleCancel = () => {
    setSelectedIds(new Set());
    setIsMultiSelectEnabled(false);
  };

  const fetchMore = async () => {
    await fetchMedia();
  };

  const refreshData = async () => {
    try {
      //@ts-ignore
      const res: MediaProps[] = await getAllMedias();
      setAssets((prev) =>
        prev.map((p) => {
          const dbRecord = res.find((r) => r.mediaPath === p.mediaPath);
          if (dbRecord) return { ...p, id: dbRecord.id, notes: dbRecord.notes };
          return { ...p, id: undefined };
        }),
      );
    } catch (error) {
      showToast("Unable to refresh");
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const selectedAssets = assets.filter((a) => selectedIds.has(a.mediaPath));
    try {
      const uploadedAssets = await getAllMedias();
      const assetsToDelete = selectedAssets.filter((a) =>
        //@ts-ignore
        uploadedAssets.some((u) => u.mediaPath === a.mediaPath),
      );
      if (assetsToDelete.length === 0) {
        showToast("No uploaded items selected for deletion", true);
        return;
      }
      const deletePromises = assetsToDelete.map((a) => deleteMedia(a.id!));
      await Promise.all(deletePromises);
      showToast(`${assetsToDelete.length} media items deleted successfully`);
      // Remove deleted items from state
      setAssets((prev) => prev.filter((a) => !selectedIds.has(a.mediaPath)));

      setAssets((prev) =>
        prev.map((p) => {
          const dbRecord = assetsToDelete.find((r) => r.id === p.id);
          if (dbRecord) return { ...p, id: undefined };
          return { ...p };
        }),
      );
      setSelectedIds(new Set());
      setIsMultiSelectEnabled(false);
    } catch (error) {
      console.error("Error deleting media items", error);
      showToast("Error occurred while deleting items", true);
    }
  };

  return {
    assets,
    isLoading,
    selectedIds,
    isMultiSelectEnabled,
    hasNextPage,
    requestPermission,
    toggleSelect,
    handleLongPress,
    handleAddPress,
    handleCancel,
    fetchMore,
    permissionGranted,
    handleDelete,
    refreshData,
  };
}
