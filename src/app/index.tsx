import { StyleSheet } from "react-native";

import PictureGallery from "@/components/ui/picture-gallery";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PictureGallery />
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
