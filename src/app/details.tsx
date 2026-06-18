// app/details.tsx
import { ThemedText } from "@/components/themed-text";
import PictureNavbar from "@/components/ui/picture-navbar";
import { usePictureDb } from "@/hooks/use-picture-db";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

type Params = {
  id: string;
  uniqueId: string;
  mediaPath: string;
  notes?: string;
  isAdded: string;
  assetType: string;
};

export default function Details() {
  const { id, uniqueId, mediaPath, notes, isAdded, assetType } =
    useLocalSearchParams<Params>();

  const router = useRouter();
  const [mediaNote, setMediaNote] = useState<string>(notes || "");
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addMedia, updateMediaNote, deleteMedia } = usePictureDb();

  const handleOnAdd = async () => {
    try {
      setIsLoading(true);
      await addMedia({
        uniqueId,
        mediaPath,
        notes: mediaNote,
        mediaType: assetType,
      });
      showToast("Record saved", false);
    } catch (error) {
      showToast("Error while saving", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnEditNotes = () => {
    setShowEditNotes(true);
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
      setIsLoading(true);
      setShowEditNotes(false);
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
      setShowEditNotes(true);
    } finally {
      setIsLoading(false);
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
    <View>
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
      <View style={styles.container}>
        <Image source={{ uri: mediaPath }} style={styles.image} />
        <View style={styles.iconContainer}>
          {showEditNotes && mediaNote && !isLoading && (
            <Pressable onPress={handleOnSaveNotes}>
              <MaterialIcons name="save" size={24} style={styles.icon} />
            </Pressable>
          )}
          {!showEditNotes && !!notes && (
            <Pressable onPress={handleOnCopyNotes}>
              <MaterialIcons
                name="content-copy"
                size={24}
                style={styles.icon}
              />
            </Pressable>
          )}
          {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
        </View>
        {showEditNotes ? (
          <TextInput
            editable
            multiline
            numberOfLines={4}
            onChangeText={(text) => setMediaNote(text)}
            value={mediaNote}
            style={styles.textInput}
          />
        ) : (
          <ThemedText>{notes || mediaNote}</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  image: {
    height: "auto",
    width: "auto",
    aspectRatio: 1,
  },
  iconContainer: {
    padding: 8,
    flexDirection: "row",
    gap: 16,
    justifyContent: "flex-end",
  },
  icon: {
    color: "#000",
  },
  textInput: {
    padding: 10,
    borderColor: "#000",
    borderWidth: 1,
    margin: 12,
  },
});
