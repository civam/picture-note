import { MediaProps } from "@/constants/picture";
import { useMultiSelect } from "@/hooks/use-multi-select";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PictureNavbar from "./picture-navbar";

const WINDOW_WIDTH = Dimensions.get("window").width;
const COLUMNS = 3;
const MARGIN = 2;
const ITEM_SIZE = (WINDOW_WIDTH - MARGIN * (COLUMNS + 1)) / COLUMNS;

export default function MultiSelectMedia() {
  const {
    assets,
    isLoading,
    selectedIds,
    isMultiSelectEnabled,
    requestPermission,
    handleLongPress,
    toggleSelect,
    handleAddPress,
    handleCancel,
    fetchMore,
    permissionGranted,
    handleDelete,
    refreshData,
  } = useMultiSelect();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, []),
  );

  const handleOnItemPress = (item: any) => {
    if (isMultiSelectEnabled) {
      toggleSelect(item.mediaPath);
    } else {
      router.push({
        pathname: "/details",
        params: {
          id: item.id,
          notes: item.notes,
          uniqueId: item.uniqueId,
          mediaPath: item.mediaPath,
        },
      });
    }
  };

  if (!permissionGranted) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Library Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MediaProps }) => {
    const isSelected = selectedIds.has(item.mediaPath);
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleOnItemPress(item)}
        onLongPress={() => handleLongPress(item.mediaPath)}
        activeOpacity={0.75}
      >
        <Image source={{ uri: item.mediaPath }} style={styles.mediaThumbnail} />
        {isSelected && <View style={styles.visualDimmer} />}
        {isMultiSelectEnabled && (
          <View
            style={[
              styles.indicatorBadge,
              isSelected ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            {isSelected && <Text style={styles.glyphCheck}>✓</Text>}
          </View>
        )}
        {item.id && (
          <View style={styles.indicatorUpload}>
            <MaterialCommunityIcons
              name="cloud-check-variant"
              size={18}
              color={"white"}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.canvas}>
      <PictureNavbar
        headerTitle="Picture Note"
        isAddIconVisible={selectedIds.size > 0}
        onAddPress={handleAddPress}
        isCancelTextVisible={selectedIds.size > 0}
        onCancelPress={handleCancel}
        isDeleteIconVisible={selectedIds.size > 0}
        onDeletePress={handleDelete}
      />

      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={(item) => item.uniqueId}
        numColumns={COLUMNS}
        contentContainerStyle={styles.scrollLayout}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.4}
        extraData={selectedIds}
        ListFooterComponent={() =>
          isLoading ? (
            <ActivityIndicator
              style={styles.bottomLoader}
              size="small"
              color="#007AFF"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: "#FAF9F6", height: "100%" },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
  },
  appTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  actionClear: { color: "#FF3B30", fontSize: 15, fontWeight: "600" },
  scrollLayout: { paddingLeft: MARGIN, paddingTop: MARGIN },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: MARGIN,
    marginBottom: MARGIN,
    position: "relative",
    backgroundColor: "#E5E5EA",
  },
  mediaThumbnail: { width: "100%", height: "100%" },
  visualDimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  indicatorBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorUpload: {
    position: "absolute",
    bottom: 0,
    right: 10,
    width: 24,
    height: 24,
    color: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInactive: { backgroundColor: "rgba(0, 0, 0, 0.35)" },
  badgeActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  glyphCheck: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  permissionText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  btnPrimary: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  btnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  bottomLoader: { marginVertical: 20 },
});
