import { MediaProps } from "@/constants/picture";
import { memo } from "react";
import { Image, StyleSheet } from "react-native";

// Defining types for our props
interface MediaItemProps {
  item: MediaProps;
}

// The pure functional component
const MediaItem: React.FC<MediaItemProps> = ({ item }) => {
  return (
    <Image
      source={{ uri: item.mediaPath }}
      style={{ width: "25%", aspectRatio: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
});

export default memo(MediaItem);
