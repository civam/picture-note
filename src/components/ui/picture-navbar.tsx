// components/Navbar.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PictureNavbarProps {
  headerTitle: string;
  isAddIconVisible?: boolean;
  isEditIconVisible?: boolean;
  showSearchIcon?: boolean;
  onGoBack?: (event: GestureResponderEvent) => void;
  onAddPress?: (event: GestureResponderEvent) => void;
  onSearchPress?: (event: GestureResponderEvent) => void;
  onEditNotePress?: (event: GestureResponderEvent) => void;
  onCopyNotePress?: (event: GestureResponderEvent) => void;
}

const PictureNavbar: React.FC<PictureNavbarProps> = ({
  headerTitle,
  onGoBack,
  onSearchPress,
  onAddPress,
  onEditNotePress,
  onCopyNotePress,
  isAddIconVisible,
  isEditIconVisible,
  showSearchIcon,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Title */}
      <View style={styles.iconContainer}>
        {!!onGoBack && (
          <Pressable onPress={onGoBack}>
            <Ionicons name="arrow-back-outline" size={22} style={styles.icon} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title}>{headerTitle}</Text>

      {/* Right Icons */}
      <View style={styles.iconContainer}>
        {!!onSearchPress && (
          <Pressable onPress={onSearchPress}>
            <Ionicons name="search" size={22} style={styles.icon} />
          </Pressable>
        )}

        {!!onAddPress && isAddIconVisible && (
          <Pressable onPress={onAddPress}>
            <Ionicons name="add-outline" size={24} style={styles.icon} />
          </Pressable>
        )}
        {!!onEditNotePress && isEditIconVisible && (
          <Pressable onPress={onEditNotePress}>
            <Ionicons name="pencil" size={24} style={styles.icon} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    paddingTop: 20, // for status bar spacing
    paddingHorizontal: 16,
    backgroundColor: "#f7f7f7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  icon: {
    color: "#000",
  },
});

export default PictureNavbar;
