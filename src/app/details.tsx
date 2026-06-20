import PictureNavbar from "@/components/ui/picture-navbar";
import { usePictureDb } from "@/hooks/use-picture-db";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
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

const { width, height } = Dimensions.get("window");

type Params = {
  id: string;
  uniqueId: string;
  mediaPath: string;
  notes?: string;
  isAdded: string;
  assetType: string;
};

const Details = () => {
  const { id, uniqueId, mediaPath, notes, isAdded, assetType } =
    useLocalSearchParams<Params>();
  const [notesModalVisible, setNotesModalVisible] = useState(false);

  const router = useRouter();
  const [mediaNote, setMediaNote] = useState<string>(notes || "");
  const [isEditMode, setIsEditMode] = useState(false);

  const { addMedia, updateMediaNote, deleteMedia } = usePictureDb();

  const handleOnAdd = async () => {
    try {
      await addMedia({
        uniqueId,
        mediaPath,
        notes: mediaNote,
        mediaType: assetType,
      });
      showToast("Record saved", false);
    } catch (error) {
      showToast("Error while saving", true);
    }
  };

  const handleOnEditNotes = () => {
    setNotesModalVisible(true);
    setIsEditMode(true);
  };

  const handleOnCopyNotes = async () => {
    const result = await Clipboard.setStringAsync(notes || mediaNote);
    if (result) {
      showToast("Notes copied to clipboard", false);
    } else {
      showToast("Failed to copy notes", true);
    }
  };

  const handleOnSaveNotes = async () => {
    try {
      if (!!id) {
        await updateMediaNote(+id, mediaNote);
        showToast("Record saved", false);
      } else {
        await addMedia({
          mediaPath,
          uniqueId,
          notes: mediaNote,
          mediaType: assetType,
        });
        showToast("Record saved", false);
      }
    } catch (error) {
      showToast("Error while saving", true);
    } finally {
      setNotesModalVisible(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleOnDelete = async () => {
    try {
      await deleteMedia(+id);
      showToast("Record deleted", false);
      router.back();
    } catch (error) {
      showToast("Error while deleting", true);
    }
  };

  const showToast = (message: string, isError: boolean) => {
    Toast.show({
      type: isError ? "error" : "success",
      text1: message,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <PictureNavbar
        headerTitle={"Image"}
        onAddPress={handleOnAdd}
        isAddIconVisible={isAdded === "false"}
        isEditIconVisible={true}
        onEditNotePress={handleOnEditNotes}
        isDeleteIconVisible={!!id}
        onDeletePress={handleOnDelete}
        onGoBack={handleGoBack}
      />
      {/* Reel area */}
      <ImageBackground
        source={{
          uri: mediaPath,
        }}
        style={styles.reelContainer}
        resizeMode="cover"
      >
        {notes && (
          <View style={styles.overlay}>
            {/* Bottom reel info */}
            <View style={styles.bottomInfo}>
              <View style={styles.notesContainer}>
                <TouchableOpacity
                  style={styles.captionContainer}
                  onPress={() => {
                    setNotesModalVisible(true);
                    setIsEditMode(false);
                  }}
                >
                  <Text style={styles.caption} numberOfLines={3}>
                    {notes}
                  </Text>
                </TouchableOpacity>
                <Pressable onPress={handleOnCopyNotes}>
                  <MaterialIcons name="content-copy" size={24} color={"#ffe"} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>

      {/* Comments bottom sheet */}
      <Modal
        visible={notesModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setNotesModalVisible(false)}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrapper}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Notes</Text>
                <TouchableOpacity onPress={() => setNotesModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                {isEditMode ? (
                  <>
                    <TextInput
                      value={mediaNote}
                      onChangeText={setMediaNote}
                      placeholder="Add a note..."
                      placeholderTextColor="#8e8e93"
                      style={styles.input}
                      multiline
                    />
                    <TouchableOpacity
                      onPress={handleOnSaveNotes}
                      style={[
                        styles.postButton,
                        !mediaNote.trim() && styles.postButtonDisabled,
                      ]}
                      disabled={!mediaNote.trim()}
                    >
                      <Text
                        style={[
                          styles.postButtonText,
                          !mediaNote.trim() && styles.postButtonTextDisabled,
                        ]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text>{notes}</Text>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  reelContainer: {
    width,
    height: height - 52,
    backgroundColor: "#111",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 36,
    left: 12,
  },
  notesContainer: {
    flexDirection: "row",
  },
  captionContainer: {
    alignContent: "flex-end",
    alignItems: "flex-start",
    width: "95%",
  },
  caption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    textOverflow: "ellipsis",
  },

  viewCommentsText: {
    color: "#d1d1d6",
    fontSize: 14,
    fontWeight: "500",
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
    height: 300,
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
  },

  dragHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 10,
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

  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  commentRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  commentContent: {
    flex: 1,
    justifyContent: "center",
  },

  commentUsername: {
    fontWeight: "700",
    color: "#111",
  },

  commentText: {
    color: "#111",
    fontSize: 14,
    lineHeight: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 26 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
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

  postButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  postButtonDisabled: {
    opacity: 0.45,
  },

  postButtonText: {
    color: "#0095f6",
    fontSize: 15,
    fontWeight: "700",
  },

  postButtonTextDisabled: {
    color: "#8ecdf8",
  },
});
