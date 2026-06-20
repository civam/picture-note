import AlbumPickerModal from "@/components/ui/album-picker-modal";
import { MediaProps } from "@/constants/picture";
import { GALLERY_COLUMNS, GallerySection, useGallery } from "@/hooks/use-picture-gallery";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import PictureNavbar from "./picture-navbar";

const WINDOW_WIDTH = Dimensions.get("window").width;
const MARGIN = 2;
const ITEM_SIZE = (WINDOW_WIDTH - MARGIN * (GALLERY_COLUMNS + 1)) / GALLERY_COLUMNS;

// ─── GalleryItem ────────────────────────────────────────────────────────────

type GalleryItemProps = {
  item: MediaProps;
  isSelected: boolean;
  isMultiSelectEnabled: boolean;
  onPress: (item: MediaProps) => void;
  onLongPress: (mediaPath: string) => void;
};

const GalleryItem = React.memo(
  ({ item, isSelected, isMultiSelectEnabled, onPress, onLongPress }: GalleryItemProps) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item.mediaPath)}
      activeOpacity={0.75}
    >
      <Image source={{ uri: item.mediaPath }} style={styles.mediaThumbnail} />
      {isSelected && <View style={styles.visualDimmer} />}
      {isMultiSelectEnabled && (
        <View style={[styles.indicatorBadge, isSelected ? styles.badgeActive : styles.badgeInactive]}>
          {isSelected && <Text style={styles.glyphCheck}>✓</Text>}
        </View>
      )}
      {!!item.id && (
        <View style={styles.indicatorUpload}>
          <MaterialCommunityIcons name="cloud-check-variant" size={18} color="white" />
        </View>
      )}
      {!!item.notes && (
        <View style={styles.indicatorNotes}>
          <MaterialCommunityIcons name="note" size={18} color="white" />
        </View>
      )}
    </TouchableOpacity>
  ),
);

// ─── GalleryRow ─────────────────────────────────────────────────────────────

type GalleryRowProps = {
  row: MediaProps[];
  selectedIds: Set<string>;
  isMultiSelectEnabled: boolean;
  onPress: (item: MediaProps) => void;
  onLongPress: (mediaPath: string) => void;
};

function rowsEqual(prev: GalleryRowProps, next: GalleryRowProps): boolean {
  if (
    prev.row !== next.row ||
    prev.isMultiSelectEnabled !== next.isMultiSelectEnabled ||
    prev.onPress !== next.onPress ||
    prev.onLongPress !== next.onLongPress
  )
    return false;
  for (const item of next.row) {
    if (prev.selectedIds.has(item.mediaPath) !== next.selectedIds.has(item.mediaPath))
      return false;
  }
  return true;
}

const GalleryRow = React.memo(
  ({ row, selectedIds, isMultiSelectEnabled, onPress, onLongPress }: GalleryRowProps) => (
    <View style={styles.row}>
      {row.map((item) => (
        <GalleryItem
          key={item.uniqueId}
          item={item}
          isSelected={selectedIds.has(item.mediaPath)}
          isMultiSelectEnabled={isMultiSelectEnabled}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      ))}
      {/* Fill empty slots in the last row of a section */}
      {row.length < GALLERY_COLUMNS &&
        Array.from({ length: GALLERY_COLUMNS - row.length }).map((_, i) => (
          <View key={`spacer-${i}`} style={styles.gridItem} />
        ))}
    </View>
  ),
  rowsEqual,
);

// ─── Static helpers (no component state) ────────────────────────────────────

const renderSectionHeader = ({ section }: { section: GallerySection }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{section.title}</Text>
  </View>
);

const GalleryFooter = () => (
  <ActivityIndicator style={styles.bottomLoader} size="small" color="#007AFF" />
);

// ─── PictureGallery ──────────────────────────────────────────────────────────

export default function PictureGallery() {
  const {
    sections,
    isLoading,
    isRefreshing,
    selectedIds,
    isMultiSelectEnabled,
    hasNextPage,
    permissionGranted,
    requestPermission,
    handleLongPress,
    toggleSelect,
    handleAddSelected,
    handleCancel,
    fetchMore,
    handleDeleteSelected,
    refreshData,
    refreshFromLibrary,
  } = useGallery();

  const [albumPickerVisible, setAlbumPickerVisible] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData]),
  );

  const handleItemPress = useCallback(
    (item: MediaProps) => {
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
    },
    [isMultiSelectEnabled, router, toggleSelect],
  );

  if (!permissionGranted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Allow access to your photo library to get started.
        </Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Library Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderRow = useCallback(
    ({ item: row }: { item: MediaProps[] }) => (
      <GalleryRow
        row={row}
        selectedIds={selectedIds}
        isMultiSelectEnabled={isMultiSelectEnabled}
        onPress={handleItemPress}
        onLongPress={handleLongPress}
      />
    ),
    [selectedIds, isMultiSelectEnabled, handleItemPress, handleLongPress],
  );

  const selectedPaths = Array.from(selectedIds);

  return (
    <View style={styles.canvas}>
      <PictureNavbar
        headerTitle="Picture Note"
        isAddIconVisible={selectedIds.size > 0}
        onAddPress={handleAddSelected}
        isAlbumIconVisible={selectedIds.size > 0}
        onAlbumPress={() => setAlbumPickerVisible(true)}
        isCancelTextVisible={selectedIds.size > 0}
        onCancelPress={handleCancel}
        isDeleteIconVisible={selectedIds.size > 0}
        onDeletePress={handleDeleteSelected}
      />

      <SectionList<MediaProps[], GallerySection>
        sections={sections}
        keyExtractor={(row, index) => row[0]?.uniqueId ?? String(index)}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderRow}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.scrollLayout}
        refreshing={isRefreshing}
        onRefresh={refreshFromLibrary}
        onEndReached={hasNextPage ? fetchMore : undefined}
        onEndReachedThreshold={0.4}
        extraData={selectedIds}
        ListFooterComponent={isLoading ? GalleryFooter : null}
      />

      <AlbumPickerModal
        visible={albumPickerVisible}
        selectedMediaPaths={selectedPaths}
        onClose={() => setAlbumPickerVisible(false)}
        onAdded={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: "#FAF9F6" },
  scrollLayout: { paddingLeft: MARGIN, paddingTop: MARGIN },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: "#FAF9F6",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3C3C43",
    letterSpacing: 0.1,
  },
  row: {
    flexDirection: "row",
  },
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
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  indicatorBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInactive: { backgroundColor: "rgba(0,0,0,0.35)" },
  badgeActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  glyphCheck: { color: "#fff", fontSize: 11, fontWeight: "900" },
  indicatorUpload: {
    position: "absolute",
    bottom: 4,
    right: 6,
  },
  indicatorNotes: {
    position: "absolute",
    bottom: 4,
    left: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
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
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  bottomLoader: { marginVertical: 20 },
});
