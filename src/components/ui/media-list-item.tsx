import { MediaProps } from "@/constants/picture";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../themed-text";

interface MediaItemProps {
  item: MediaProps;
}

// The pure functional component
const MediaListItem: React.FC<MediaItemProps> = ({ item }) => {
  const router = useRouter();
  const handleOnImagePress = () => {
    router.push({
      pathname: "/details",
      params: {
        id: item.id,
        notes: item.notes,
        mediaPath: item.mediaPath,
        isAdded: item.isAdded?.toString(),
      },
    });
  };

  console.log("Notes", item.notes);
  return (
    <TouchableOpacity style={styles.container} onPress={handleOnImagePress}>
      <Image source={{ uri: item.mediaPath }} style={styles.image} />
      <ThemedText style={styles.notes} numberOfLines={3} ellipsizeMode={"tail"}>
        {item.notes}
      </ThemedText>
      <ThemedText type="small">
        {item.addedOn ? new Date(item.addedOn).toDateString() : "-"}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
  },
  image: {
    width: "25%",
    aspectRatio: 1,
  },
  notes: {
    height: "auto",
    width: "75%",
    paddingLeft: 4,
    textOverflow: "ellipsis",
  },
});

export default memo(MediaListItem);
