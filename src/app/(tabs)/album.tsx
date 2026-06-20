import { AlbumWithStats } from "@/constants/picture";
import { useAlbumDb } from "@/hooks/use-album-db";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const COVER_SIZE = 160;

export default function AlbumTab() {
  const [albums, setAlbums] = useState<AlbumWithStats[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const { getAllAlbumsWithStats, createAlbum, deleteAlbum } = useAlbumDb();
  const router = useRouter();

  const loadAlbums = useCallback(async () => {
    try {
      setAlbums(await getAllAlbumsWithStats());
    } catch {
      Toast.show({ type: "error", text1: "Failed to load albums" });
    }
  }, [getAllAlbumsWithStats]);

  useFocusEffect(
    useCallback(() => {
      loadAlbums();
    }, [loadAlbums]),
  );

  const handleCreate = async () => {
    if (!newAlbumName.trim()) return;
    try {
      await createAlbum(newAlbumName);
      setNewAlbumName("");
      setCreateModalVisible(false);
      await loadAlbums();
      Toast.show({ type: "success", text1: "Album created" });
    } catch {
      Toast.show({ type: "error", text1: "Album name already taken" });
    }
  };

  const confirmDelete = (album: AlbumWithStats) => {
    Alert.alert(
      "Delete Album",
      `Delete "${album.name}"? Photos will not be removed from your library.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAlbum(album.id);
              await loadAlbums();
              Toast.show({ type: "success", text1: "Album deleted" });
            } catch {
              Toast.show({ type: "error", text1: "Failed to delete album" });
            }
          },
        },
      ],
    );
  };

  const renderAlbum = ({ item }: { item: AlbumWithStats }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() =>
        router.push({ pathname: "/album-detail", params: { albumId: String(item.id), albumName: item.name } })
      }
      onLongPress={() => confirmDelete(item)}
      activeOpacity={0.8}
    >
      <View style={styles.coverWrapper}>
        {item.coverPath ? (
          <Image source={{ uri: item.coverPath }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <MaterialCommunityIcons name="image-multiple-outline" size={36} color="#C7C7CC" />
          </View>
        )}
      </View>
      <Text style={styles.albumName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.albumCount}>{item.mediaCount} photo{item.mediaCount !== 1 ? "s" : ""}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Albums</Text>
        <Pressable onPress={() => setCreateModalVisible(true)} style={styles.addButton}>
          <MaterialIcons name="add" size={26} color="#007AFF" />
        </Pressable>
      </View>

      <FlatList
        data={albums}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlbum}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="folder-multiple-image" size={56} color="#C7C7CC" />
            <Text style={styles.emptyText}>No albums yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first album</Text>
          </View>
        }
      />

      {/* Create album modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New Album</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Album name"
              placeholderTextColor="#8E8E93"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity
              style={[styles.createButton, !newAlbumName.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!newAlbumName.trim()}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  addButton: { padding: 4 },
  list: { padding: 12 },
  columnWrapper: { gap: 12 },
  albumCard: { flex: 1, marginBottom: 12 },
  coverWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E5E5EA",
    height: COVER_SIZE,
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  albumName: { marginTop: 6, fontSize: 13, fontWeight: "600", color: "#1C1C1E" },
  albumCount: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  empty: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#3C3C43", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", marginBottom: 16 },
  nameInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1C1C1E",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonDisabled: { opacity: 0.4 },
  createButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
