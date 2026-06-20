import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { randomUUID } from "expo-crypto";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAlbumDb } from "@/hooks/use-album-db";

const WINDOW_WIDTH = Dimensions.get("window").width;
const COLUMNS = 3;
const MARGIN = 2;
const ITEM_SIZE = (WINDOW_WIDTH - MARGIN * (COLUMNS + 1)) / COLUMNS;

type AlbumImage = { uniqueId: string; mediaPath: string; dbId?: number; dbNotes?: string };

type Params = { albumId: string; albumName: string };

export default function AlbumDetail() {
  const { albumId, albumName } = useLocalSearchParams<Params>();
  const [images, setImages] = useState<AlbumImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const { getAlbumMediaPaths, removeMediaFromAlbum } = useAlbumDb();
  const router = useRouter();

  const loadImages = useCallback(async () => {
    try {
      const items = await getAlbumMediaPaths(Number(albumId));
      setImages(items.map((p) => ({
        uniqueId: randomUUID(),
        mediaPath: p.mediaPath,
        dbId: p.id ?? undefined,
        dbNotes: p.notes ?? undefined,
      })));
    } catch {
      Toast.show({ type: "error", text1: "Failed to load album" });
    } finally {
      setIsLoading(false);
    }
  }, [albumId, getAlbumMediaPaths]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [loadImages]),
  );

  const toggleSelect = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleLongPress = (path: string) => {
    setIsMultiSelect(true);
    setSelectedPaths(new Set([path]));
  };

  const handleRemove = async () => {
    if (selectedPaths.size === 0) return;
    try {
      await removeMediaFromAlbum(Number(albumId), Array.from(selectedPaths));
      setImages((prev) => prev.filter((img) => !selectedPaths.has(img.mediaPath)));
      Toast.show({ type: "success", text1: `${selectedPaths.size} photo${selectedPaths.size !== 1 ? "s" : ""} removed` });
    } catch {
      Toast.show({ type: "error", text1: "Failed to remove photos" });
    } finally {
      setSelectedPaths(new Set());
      setIsMultiSelect(false);
    }
  };

  const handleCancel = () => {
    setSelectedPaths(new Set());
    setIsMultiSelect(false);
  };

  const handlePress = useCallback(
    (item: AlbumImage) => {
      if (isMultiSelect) {
        toggleSelect(item.mediaPath);
      } else {
        router.push({
          pathname: "/details",
          params: {
            id: item.dbId,
            notes: item.dbNotes,
            uniqueId: item.uniqueId,
            mediaPath: item.mediaPath,
          },
        });
      }
    },
    [isMultiSelect, router, toggleSelect],
  );

  const renderItem = ({ item }: { item: AlbumImage }) => {
    const isSelected = selectedPaths.has(item.mediaPath);
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item.mediaPath)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.mediaPath }} style={styles.thumbnail} />
        {isSelected && <View style={styles.dimmer} />}
        {isMultiSelect && (
          <View style={[styles.badge, isSelected ? styles.badgeActive : styles.badgeInactive]}>
            {isSelected && <Text style={styles.check}>✓</Text>}
          </View>
        )}
        {!!item.dbNotes && (
          <View style={styles.indicatorNotes}>
            <MaterialCommunityIcons name="note" size={18} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Pressable onPress={router.back} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <Text style={styles.navTitle} numberOfLines={1}>
            {albumName}
          </Text>
        </View>
        <View style={styles.navRight}>
          {isMultiSelect && selectedPaths.size > 0 && (
            <Pressable onPress={handleRemove} style={styles.navAction}>
              <MaterialCommunityIcons name="folder-remove" size={22} color="#FF3B30" />
            </Pressable>
          )}
          {isMultiSelect && (
            <Pressable onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : images.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="image-multiple-outline" size={56} color="#C7C7CC" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Add photos to this album from the Gallery</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.uniqueId}
          renderItem={renderItem}
          numColumns={COLUMNS}
          contentContainerStyle={styles.grid}
          extraData={selectedPaths}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  navbar: {
    height: 48,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  navLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 6 },
  backButton: { padding: 4 },
  navTitle: { fontSize: 17, fontWeight: "600", flex: 1 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  navAction: { padding: 4 },
  cancelText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#3C3C43", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#8E8E93", marginTop: 4, textAlign: "center", paddingHorizontal: 24 },
  grid: { paddingLeft: MARGIN, paddingTop: MARGIN },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: MARGIN,
    marginBottom: MARGIN,
    backgroundColor: "#E5E5EA",
    position: "relative",
  },
  thumbnail: { width: "100%", height: "100%" },
  dimmer: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.25)" },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInactive: { backgroundColor: "rgba(0,0,0,0.35)" },
  badgeActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  check: { color: "#fff", fontSize: 11, fontWeight: "900" },
  indicatorNotes: { position: "absolute", bottom: 4, left: 6 },
});
