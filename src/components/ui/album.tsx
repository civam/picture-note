import { Album, Asset, AssetField, MediaType, Query } from "expo-media-library";
import { useState } from "react";
import { Button, FlatList, Image, Text, View } from "react-native";

export default function CreateAlbum() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [albumTitle, setAlbumTitle] = useState<string>("");

  const createAlbumWithAsset = async () => {
    // await requestPermissionsAsync();

    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .lte(AssetField.HEIGHT, 1080)
      .orderBy(AssetField.CREATION_TIME)
      .limit(20)
      .exe();

    if (!assets) {
      console.log("No assets found in the media library.");
      return;
    }

    // const newAlbum = await Album.create("MyNewAlbum", [assets]);

    // setAlbum(newAlbum);
    // setAlbumTitle(await newAlbum.getTitle());
    // const albumAssets = await newAlbum.getAssets();
    // setAssets(albumAssets);
  };

  const browseImages = async () => {
    // await requestPermissionsAsync();

    const assets = await new Query()
      // .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .lte(AssetField.HEIGHT, 1080)
      .orderBy(AssetField.CREATION_TIME)
      .limit(20)
      .exe();

    if (assets?.length === 0) {
      console.log("No assets found in the media library.");
      return;
    }

    console.log("Assest", await assets[0]?.getFilename());
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button
        title="Create Album and Add Asset"
        onPress={createAlbumWithAsset}
      />

      <Button title="Add Asset" onPress={browseImages} />

      {assets.length > 0 ? (
        <>
          <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
            Assets in {albumTitle}:
          </Text>
          <FlatList
            data={assets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 10 }}>
                <Image
                  source={{ uri: item.id }}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
              </View>
            )}
          />
        </>
      ) : (
        <Text style={{ marginTop: 20 }}>
          {album ? "Album is empty." : "No album created yet."}
        </Text>
      )}
    </View>
  );
}
