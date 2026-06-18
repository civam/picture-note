// components/Navbar.tsx
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PictureNavbarProps {
  headerTitle: string;
  isAddIconVisible?: boolean;
  isDeleteIconVisible?: boolean;
  isEditIconVisible?: boolean;
  showSearchIcon?: boolean;
  isCancelTextVisible?: boolean;
  onGoBack?: (event: GestureResponderEvent) => void;
  onAddPress?: (event: GestureResponderEvent) => void;
  onDeletePress?: (event: GestureResponderEvent) => void;
  onSearchPress?: (event: GestureResponderEvent) => void;
  onEditNotePress?: (event: GestureResponderEvent) => void;
  onCopyNotePress?: (event: GestureResponderEvent) => void;
  onCancelPress?: (event: GestureResponderEvent) => void;
}

const PictureNavbar: React.FC<PictureNavbarProps> = ({
  headerTitle,
  onGoBack,
  onSearchPress,
  onAddPress,
  onDeletePress,
  onEditNotePress,
  onCopyNotePress,
  isCancelTextVisible,
  isAddIconVisible,
  isDeleteIconVisible,
  isEditIconVisible,
  showSearchIcon,
  onCancelPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Title */}
      <View style={styles.iconContainer}>
        {!!onGoBack && (
          <Pressable onPress={onGoBack}>
            <MaterialIcons name="arrow-back" size={24} style={styles.icon} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title}>{headerTitle}</Text>

      {/* Right Icons */}
      <View style={styles.iconContainer}>
        {!!onSearchPress && (
          <Pressable onPress={onSearchPress}>
            <MaterialIcons name="search" size={24} color="black" />
          </Pressable>
        )}

        {isDeleteIconVisible && !!onDeletePress && (
          <Pressable onPress={onDeletePress}>
            <MaterialIcons name="delete" size={24} style={styles.icon} />
          </Pressable>
        )}

        {!!onAddPress && isAddIconVisible && (
          <Pressable onPress={onAddPress}>
            <MaterialIcons name="cloud-upload" size={24} style={styles.icon} />
          </Pressable>
        )}
        {!!onEditNotePress && isEditIconVisible && (
          <Pressable onPress={onEditNotePress}>
            <MaterialIcons name="edit" size={24} style={styles.icon} />
          </Pressable>
        )}
        {!!onCancelPress && isCancelTextVisible && (
          <TouchableOpacity onPress={onCancelPress}>
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
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
  actionText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 18,
  },
});

export default PictureNavbar;
