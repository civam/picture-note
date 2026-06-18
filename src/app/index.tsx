import { StyleSheet } from "react-native";

import MultiSelectMedia from "@/components/ui/multi-select";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const handleSearchPress = () => {};

  const handleAddPress = () => {};

  return (
    <SafeAreaView style={styles.container}>
      {/* <PictureNavbar
        headerTitle={"Picture Note"}
        onSearchPress={handleSearchPress}
      /> */}
      {/* <PictureGallery />
      <BrowseMedia /> */}
      <MultiSelectMedia />
      {/* </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // // justifyContent: "center",
    // flexDirection: "row",
  },
});
