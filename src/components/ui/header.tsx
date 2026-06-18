import Ionicons from "@expo/vector-icons/Ionicons";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PictureNoteHeaderProps {
  onAddPress: (event: GestureResponderEvent) => void;
  onSearchPress: (event: GestureResponderEvent) => void;
}

const PictureNoteHeader: React.FC<PictureNoteHeaderProps> = ({
  onSearchPress,
  onAddPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Center - Title */}
      <View style={styles.center}>
        <Text style={styles.title}>Picture Note</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.right}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconSpacing}>
          <Ionicons name="search-outline" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onAddPress}>
          <Ionicons name="add-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    // backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  left: {
    width: 50,
    alignItems: "flex-start",
  },
  center: {
    // flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  right: {
    width: 80,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 15,
  },
});

export default PictureNoteHeader;
