import { MediaProps } from "@/constants/picture";
import { usePictureDb } from "@/hooks/use-picture-db";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { randomUUID } from "expo-crypto";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WINDOW_WIDTH = Dimensions.get("window").width;
const COLUMNS = 3;
const MARGIN = 2;
const ITEM_SIZE = (WINDOW_WIDTH - MARGIN * (COLUMNS + 1)) / COLUMNS;

type SearchResult = MediaProps & { uniqueId: string };

export default function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { searchByNotes } = usePictureDb();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      try {
        const rows = await searchByNotes(text);
        setResults(rows.map((r) => ({ ...r, uniqueId: randomUUID() })));
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchByNotes],
  );

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/details",
          params: {
            id: item.id,
            notes: item.notes,
            uniqueId: item.uniqueId,
            mediaPath: item.mediaPath,
          },
        })
      }
    >
      <Image source={{ uri: item.mediaPath }} style={styles.thumbnail} />
      {!!item.notes && (
        <View style={styles.notesBadge}>
          <MaterialCommunityIcons name="note-text" size={12} color="#fff" />
        </View>
      )}
      {item.notes ? (
        <View style={styles.notesSnippet}>
          <Text style={styles.notesSnippetText} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search by notes…"
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <MaterialIcons name="cancel" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : !query.trim() ? (
        <View style={styles.empty}>
          <MaterialIcons name="search" size={56} color="#C7C7CC" />
          <Text style={styles.emptyText}>Search your notes</Text>
          <Text style={styles.emptySubtext}>Find photos by their saved notes</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="image-search-outline" size={56} color="#C7C7CC" />
          <Text style={styles.emptyText}>No results</Text>
          <Text style={styles.emptySubtext}>No photos match "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uniqueId}
          renderItem={renderItem}
          numColumns={COLUMNS}
          contentContainerStyle={styles.grid}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 10,
    backgroundColor: "#EFEFF4",
    borderRadius: 12,
    height: 40,
  },
  searchIcon: { marginRight: 6 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
  },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#3C3C43", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#8E8E93", marginTop: 4, textAlign: "center" },
  grid: { paddingLeft: MARGIN, paddingTop: MARGIN },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 50,
    marginRight: MARGIN,
    marginBottom: MARGIN,
    backgroundColor: "#E5E5EA",
  },
  thumbnail: { width: "100%", height: ITEM_SIZE },
  notesBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    padding: 3,
  },
  notesSnippet: {
    paddingHorizontal: 6,
    paddingTop: 4,
    backgroundColor: "#fff",
    flex: 1,
  },
  notesSnippetText: { fontSize: 11, color: "#3C3C43", lineHeight: 15 },
});
