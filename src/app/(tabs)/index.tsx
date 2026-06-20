import PictureGallery from "@/components/ui/picture-gallery";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GalleryTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <PictureGallery />
    </SafeAreaView>
  );
}
