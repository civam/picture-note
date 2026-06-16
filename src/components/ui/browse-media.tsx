import { MediaProps } from "@/constants/picture";
import { usePictureDb } from "@/hooks/use-picture-db";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import PictureNoteHeader from "./header";
import MediaGallery from "./media-gallery";

export default function BrowseMedia() {
  const [images, setImages] = useState<MediaProps[]>([]);
  const { addMedia, getAllMedias } = usePictureDb();

  useEffect(() => {
    getMedias();
  }, []);

  const getMedias = async () => {
    try {
      const result = await getAllMedias();
      //@ts-ignore
      setImages(result);
    } catch (error) {
      console.log("Error while fetching record.");
    }
  };

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library.
      // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
      // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
      // so the app users aren't surprised by a system dialog after picking a video.
      // See "Invoke permissions for videos" sub section for more details.
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access the media library is required.",
        );
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uniques = result.assets.filter(
          (o) => !images.find((o2) => o.uri === o2.mediaPath),
        );
        // console.log("uniques -->", uniques);
        uniques.map((md) => {
          console.log(md);
        });
        // const insertedRecords = await addMedia(result.assets);
        // if(insertedRecords > 0) {
        //   getAllMedias();
        // }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchPress = () => {};

  return (
    <View style={styles.container}>
      <PictureNoteHeader
        onAddPress={pickImage}
        onSearchPress={handleSearchPress}
      />
      <MediaGallery assets={images} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "red",
    borderWidth: 1,
    width: "100%",
  },
});
