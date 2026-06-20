import PictureNavbar from "@/components/ui/picture-navbar";
import { usePictureDb } from "@/hooks/use-picture-db";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type Params = {
  id?: string;
  uniqueId: string;
  mediaPath: string;
  notes?: string;
};

export default function Details() {
  const { id, uniqueId, mediaPath, notes: initialNotes } = useLocalSearchParams<Params>();

  // savedId tracks DB state — may change if user adds the record from this screen
  const [savedId, setSavedId] = useState<number | undefined>(id ? +id : undefined);
  // mediaNote drives all display and editing; initialised from route param
  const [mediaNote, setMediaNote] = useState(initialNotes ?? "");
  const [notesSheetVisible, setNotesSheetVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const { addMedia, updateMediaNote, deleteMedia } = usePictureDb();

  const showToast = (message: string, isError = false) =>
    Toast.show({ type: isError ? "error" : "success", text1: message });

  const openEditSheet = () => {
    setIsEditMode(true);
    setNotesSheetVisible(true);
  };

  const openReadSheet = () => {
    setIsEditMode(false);
    setNotesSheetVisible(true);
  };

  const handleSaveNotes = async () => {
    try {
      if (savedId) {
        await updateMediaNote(savedId, mediaNote);
      } else {
        const newId = await addMedia({
          uniqueId,
          mediaPath,
          notes: mediaNote,
          mediaType: "",
          modificationTime: 0,
        });
        setSavedId(newId);
      }
      showToast("Notes saved");
    } catch {
      showToast("Failed to save", true);
    } finally {
      setNotesSheetVisible(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const newId = await addMedia({
        uniqueId,
        mediaPath,
        notes: "",
        mediaType: "",
        modificationTime: 0,
      });
      setSavedId(newId);
      showToast("Record saved");
    } catch {
      showToast("Error while saving", true);
    }
  };

  const handleDelete = async () => {
    if (!savedId) return;
    try {
      await deleteMedia(savedId);
      showToast("Record deleted");
      router.back();
    } catch {
      showToast("Failed to delete", true);
    }
  };

  const handleCopyNotes = async () => {
    if (!mediaNote) return;
    const ok = await Clipboard.setStringAsync(mediaNote);
    showToast(ok ? "Notes copied to clipboard" : "Failed to copy", !ok);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PictureNavbar
        headerTitle="Image"
        onGoBack={() => router.back()}
        isAddIconVisible={!savedId}
        onAddPress={handleAddRecord}
        isEditIconVisible
        onEditNotePress={openEditSheet}
        isDeleteIconVisible={!!savedId}
        onDeletePress={handleDelete}
      />

      {/* Full-screen image */}
      <ImageBackground
        source={{ uri: mediaPath }}
        style={styles.imageContainer}
        resizeMode="contain"
      >
        {/* Notes overlay — only shown when there are saved notes */}
        {!!mediaNote && (
          <View style={styles.notesOverlay}>
            <TouchableOpacity style={styles.captionTouchable} onPress={openReadSheet}>
              <Text style={styles.captionText} numberOfLines={3}>
                {mediaNote}
              </Text>
            </TouchableOpacity>
            <Pressable onPress={handleCopyNotes} style={styles.copyButton}>
              <MaterialIcons name="content-copy" size={22} color="#ffe" />
            </Pressable>
          </View>
        )}
      </ImageBackground>

      {/* Notes bottom sheet */}
      <Modal
        visible={notesSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotesSheetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setNotesSheetVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrapper}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Notes</Text>
                <TouchableOpacity onPress={() => setNotesSheetVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                {isEditMode ? (
                  <>
                    <TextInput
                      value={mediaNote}
                      onChangeText={setMediaNote}
                      placeholder="Add a note…"
                      placeholderTextColor="#8e8e93"
                      style={styles.input}
                      multiline
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={handleSaveNotes}
                      style={[styles.saveButton, !mediaNote.trim() && styles.saveButtonDisabled]}
                      disabled={!mediaNote.trim()}
                    >
                      <Text
                        style={[
                          styles.saveButtonText,
                          !mediaNote.trim() && styles.saveButtonTextDisabled,
                        ]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.readNoteText}>{mediaNote}</Text>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#111",
  },
  notesOverlay: {
    position: "absolute",
    bottom: 32,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  captionTouchable: {
    flex: 1,
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  copyButton: {
    paddingLeft: 10,
    paddingBottom: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetWrapper: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d1d6",
    marginBottom: 10,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5ea",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  closeText: {
    color: "#007aff",
    fontSize: 14,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 200,
    backgroundColor: "#f2f2f7",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: "#111",
    fontSize: 14,
    marginRight: 10,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: "#0095f6",
    fontSize: 15,
    fontWeight: "700",
  },
  saveButtonTextDisabled: {
    color: "#8ecdf8",
  },
  readNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#111",
    paddingVertical: 8,
  },
});
