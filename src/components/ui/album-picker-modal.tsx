import { AlbumWithStats } from "@/constants/picture";
import { useAlbumDb } from "@/hooks/use-album-db";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  visible: boolean;
  selectedMediaPaths: string[];
  onClose: () => void;
  onAdded: () => void;
};

export default function AlbumPickerModal({ visible, selectedMediaPaths, onClose, onAdded }: Props) {
  const [albums, setAlbums] = useState<AlbumWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { getAllAlbumsWithStats, createAlbum, addMediaToAlbum } = useAlbumDb();

  useEffect(() => {
    if (!visible) return;
    setCreatingNew(false);
    setNewName("");
    setIsLoading(true);
    getAllAlbumsWithStats()
      .then(setAlbums)
      .catch(() => Toast.show({ type: "error", text1: "Failed to load albums" }))
      .finally(() => setIsLoading(false));
  }, [visible, getAllAlbumsWithStats]);

  const handleSelectAlbum = async (album: AlbumWithStats) => {
    setIsSaving(true);
    try {
      await addMediaToAlbum(album.id, selectedMediaPaths);
      Toast.show({
        type: "success",
        text1: `${selectedMediaPaths.length} photo${selectedMediaPaths.length !== 1 ? "s" : ""} added to "${album.name}"`,
      });
      onAdded();
      onClose();
    } catch {
      Toast.show({ type: "error", text1: "Failed to add to album" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const albumId = await createAlbum(newName);
      await addMediaToAlbum(albumId, selectedMediaPaths);
      Toast.show({
        type: "success",
        text1: `Album "${newName.trim()}" created`,
      });
      onAdded();
      onClose();
    } catch {
      Toast.show({ type: "error", text1: "Album name already taken" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderAlbum = ({ item }: { item: AlbumWithStats }) => (
    <TouchableOpacity style={styles.albumRow} onPress={() => handleSelectAlbum(item)} activeOpacity={0.7}>
      <View style={styles.albumThumb}>
        {item.coverPath ? (
          <Image source={{ uri: item.coverPath }} style={styles.thumbImage} />
        ) : (
          <MaterialCommunityIcons name="folder-image" size={28} color="#C7C7CC" />
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName}>{item.name}</Text>
        <Text style={styles.albumCount}>{item.mediaCount} photo{item.mediaCount !== 1 ? "s" : ""}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {creatingNew ? "New Album" : "Add to Album"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {creatingNew ? (
            <View style={styles.newAlbumSection}>
              <TextInput
                style={styles.nameInput}
                placeholder="Album name"
                placeholderTextColor="#8E8E93"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateAndAdd}
              />
              <View style={styles.newAlbumActions}>
                <TouchableOpacity style={styles.backLink} onPress={() => setCreatingNew(false)}>
                  <Text style={styles.backLinkText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, (!newName.trim() || isSaving) && styles.saveButtonDisabled]}
                  onPress={handleCreateAndAdd}
                  disabled={!newName.trim() || isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Create & Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* New Album row */}
              <TouchableOpacity style={styles.newAlbumRow} onPress={() => setCreatingNew(true)}>
                <View style={styles.newAlbumIcon}>
                  <MaterialIcons name="add" size={22} color="#007AFF" />
                </View>
                <Text style={styles.newAlbumText}>New Album</Text>
              </TouchableOpacity>

              {isLoading ? (
                <ActivityIndicator style={styles.loader} color="#007AFF" />
              ) : albums.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No albums yet — create one above</Text>
                </View>
              ) : (
                <FlatList
                  data={albums}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderAlbum}
                  style={styles.list}
                  scrollEnabled={albums.length > 4}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    maxHeight: "70%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  closeText: { color: "#007AFF", fontSize: 14, fontWeight: "600" },
  newAlbumRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F2F2F7",
  },
  newAlbumIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newAlbumText: { fontSize: 15, fontWeight: "600", color: "#007AFF" },
  list: { maxHeight: 320 },
  albumRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F2F2F7",
  },
  albumThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 12,
  },
  thumbImage: { width: "100%", height: "100%" },
  albumInfo: { flex: 1 },
  albumName: { fontSize: 15, fontWeight: "600", color: "#1C1C1E" },
  albumCount: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  loader: { paddingVertical: 24 },
  empty: { paddingVertical: 24, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#8E8E93" },
  newAlbumSection: { padding: 16 },
  nameInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1C1C1E",
    marginBottom: 16,
  },
  newAlbumActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backLink: { padding: 4 },
  backLinkText: { color: "#007AFF", fontSize: 15, fontWeight: "600" },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
