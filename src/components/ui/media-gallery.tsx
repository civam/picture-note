import { MediaProps } from "@/constants/picture";
import { FlatList, StyleSheet, View } from "react-native";
import MediaItem from "./media-item";

// Defining types for our props
interface MediaGalleryProps {
  assets: MediaProps[];
}

// The pure functional component
const MediaGallery: React.FC<MediaGalleryProps> = ({ assets }) => {
  return (
    <View style={styles.container}>
      {assets.length > 0 && (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.mediaPath}
          ItemSeparatorComponent={<View style={{ height: 1 }}></View>}
          numColumns={4}
          columnWrapperStyle={{ gap: 1 }}
          renderItem={({ item }) => <MediaItem item={item} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
});

export default MediaGallery;
