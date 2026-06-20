import { DB_NAME, PICTURE_TABLE_NAME } from "@/constants/app-contants";
import { MediaProps } from "@/constants/picture";
import * as SQLite from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export function usePictureDb() {
  const db = useSQLiteContext();

  const addMultipleMedia = async (medias: MediaProps[]) => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    let results = [];
    const statement = await db.prepareAsync(
      `INSERT INTO ${PICTURE_TABLE_NAME} (mediaPath, addedOn, notes) VALUES ($mediaPath, $addedOn, $notes);`,
    );
    try {
      for (const media of medias) {
        let result = await statement.executeAsync({
          $mediaPath: media.mediaPath,
          $addedOn: Date.now(),
          $notes: null,
        });
        
        results.push({
          status: 'success',
          id: result.lastInsertRowId,
          mediaPath: media.mediaPath,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      await statement.finalizeAsync();
    }
    return results;
  };

  const addMedia = async (media: MediaProps) => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const statement = await db.prepareAsync(
      `INSERT INTO ${PICTURE_TABLE_NAME} (mediaPath, addedOn, notes) VALUES ($mediaPath, $addedOn, $notes);`,
    );
    try {
      const data = await statement.executeAsync({
        $mediaPath: media.mediaPath,
        $addedOn: Date.now(),
        $notes: media.notes || null,
      });
      return data.lastInsertRowId;

    } catch (error) {
      console.log(error);
    } finally {
      await statement.finalizeAsync();
    }
  };

  const updateMediaNote = async (id: number, picNotes: string) => {

    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const statement = await db.prepareAsync(
      `UPDATE ${PICTURE_TABLE_NAME} SET notes = $picNotes WHERE id = $id;`,
    );
    try {
      return await statement.executeAsync({
        $picNotes: picNotes,
        $id: id,
      });
    } catch (error) {
      console.log(error);
    } finally {
      await statement.finalizeAsync();
    }
  };

  const getAllMedias = async () => {
    return await db.getAllAsync(`SELECT * FROM ${PICTURE_TABLE_NAME}`);
  };

  const deleteMedia = async (id: number) => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const statement = await db.prepareAsync(
      `DELETE FROM ${PICTURE_TABLE_NAME} WHERE id = $id;`,
    );
    try {
      return await statement.executeAsync({
        $id: id,
      });
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  };

  return {
    addMedia,
    addMultipleMedia,
    getAllMedias,
    updateMediaNote,
    deleteMedia,
  };
}
