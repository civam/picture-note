import { StyleSheet, View } from "react-native";

import PictureGallery from "@/components/ui/picture-gallery";
import PictureNavbar from "@/components/ui/picture-navbar";

export default function HomeScreen() {
  const handleSearchPress = () => {};

  const handleAddPress = () => {};

  return (
    <View style={styles.container}>
      <PictureNavbar
        headerTitle={"Picture Note"}
        onSearchPress={handleSearchPress}
      />
      <PictureGallery />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // // justifyContent: "center",
    // flexDirection: "row",
  },
});
