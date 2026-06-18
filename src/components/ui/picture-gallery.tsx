import { MediaProps } from "@/constants/picture";
import { usePictureDb } from "@/hooks/use-picture-db";
import {
  AssetField,
  MediaType,
  Query,
  requestPermissionsAsync,
} from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import MediaListItem from "./media-list-item";

//@ts-ignore
const renderItem = ({ item }) => <MediaListItem item={item} />;

// The pure functional component
const PictureGallery = () => {
  const [assets, setAssets] = useState<MediaProps[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { getAllMedias } = usePictureDb();

  useEffect(() => {
    queryAssets();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true); // Start showing the loading spinner

    try {
      const dbAssets = await getAllMedias();

      // Use functional setState to avoid capturing a stale `assets` value
      setAssets((prevAssets) => {
        // Deep-clone previous assets to avoid mutating state directly
        const clonnedAssets: MediaProps[] = JSON.parse(
          JSON.stringify(prevAssets),
        );

        clonnedAssets.forEach((element: MediaProps) => {
          const index = dbAssets.findIndex(
            //@ts-ignore
            (dbEle: MediaProps) => dbEle.mediaPath == element.mediaPath,
          );

          if (index > -1) {
            //@ts-ignore
            element.id = dbAssets[index].id;
            //@ts-ignore
            element.notes = dbAssets[index].notes;
          }
        });

        return clonnedAssets;
      });
    } catch (error) {
      console.error("Failed to fetch new data", error);
    } finally {
      setRefreshing(false); // Stop showing the loading spinner
    }
  }, [getAllMedias]);

  const queryAssets = async () => {
    const start = Date.now();
    try {
      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const queryResult = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .exe();

      const allMedia: MediaProps[] = [];
      if (queryResult?.length > 0) {
        for (let index = 0; index < queryResult?.length; index++) {
          const asset = queryResult[index];
          const mediaType = (await asset.getMediaType()).toString();
          const mediaPath = await asset.getUri();
          // allMedia.push({
          //   uniqueId: randomUUID(),
          //   mediaPath: mediaPath,
          //   mediaType,
          //   isAdded: false,
          // });
        }
        // const dbAssets = await getAllMedias();
        // allMedia.forEach((element) => {
        //   const index = dbAssets.findIndex(
        //     //@ts-ignore
        //     (dbEle: MediaProps) => dbEle.mediaPath == element.mediaPath,
        //   );

        //   if (index > -1) {
        //     element.isAdded = true;
        //     //@ts-ignore
        //     element.id = dbAssets[index].id;
        //     //@ts-ignore
        //     element.notes = dbAssets[index].notes;
        //   }
        // });
        // setAssets(allMedia);
      } else {
        console.log("No assets found in the media library.");
      }
    } catch (error) {
      console.log(error);
    }
    console.log("Time taken to fetch assets:", Date.now() - start, "ms");
  };

  return (
    <View style={styles.container}>
      {assets?.length > 0 && (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.uniqueId}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#4f4de2", "#1100ff"]} // Android spinner colors
              tintColor="#0000ff" // iOS spinner color
            />
          }
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

export default PictureGallery;
