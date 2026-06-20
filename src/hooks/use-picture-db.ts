import { PICTURE_TABLE_NAME } from "@/constants/app-contants";
import { MediaProps } from "@/constants/picture";
import { useSQLiteContext } from "expo-sqlite";

export function usePictureDb() {
  const db = useSQLiteContext();

  const addMultipleMedia = async (medias: MediaProps[]) => {
    const results: { status: string; id: number; mediaPath: string }[] = [];
    const statement = await db.prepareAsync(
      `INSERT INTO ${PICTURE_TABLE_NAME} (mediaPath, addedOn, notes) VALUES ($mediaPath, $addedOn, $notes);`,
    );
    try {
      for (const media of medias) {
        const result = await statement.executeAsync({
          $mediaPath: media.mediaPath,
          $addedOn: Date.now(),
          $notes: null,
        });
        results.push({ status: "success", id: result.lastInsertRowId, mediaPath: media.mediaPath });
      }
    } finally {
      await statement.finalizeAsync();
    }
    return results;
  };

  const addMedia = async (media: MediaProps): Promise<number> => {
    const statement = await db.prepareAsync(
      `INSERT INTO ${PICTURE_TABLE_NAME} (mediaPath, addedOn, notes) VALUES ($mediaPath, $addedOn, $notes);`,
    );
    try {
      const result = await statement.executeAsync({
        $mediaPath: media.mediaPath,
        $addedOn: Date.now(),
        $notes: media.notes ?? null,
      });
      return result.lastInsertRowId;
    } finally {
      await statement.finalizeAsync();
    }
  };

  const updateMediaNote = async (id: number, notes: string) => {
    const statement = await db.prepareAsync(
      `UPDATE ${PICTURE_TABLE_NAME} SET notes = $notes WHERE id = $id;`,
    );
    try {
      return await statement.executeAsync({ $notes: notes, $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  };

  const getAllMedias = async (): Promise<MediaProps[]> => {
    return db.getAllAsync<MediaProps>(`SELECT * FROM ${PICTURE_TABLE_NAME}`);
  };

  const searchByNotes = async (query: string): Promise<MediaProps[]> => {
    if (!query.trim()) return [];
    return db.getAllAsync<MediaProps>(
      `SELECT * FROM ${PICTURE_TABLE_NAME} WHERE notes IS NOT NULL AND notes LIKE ? ORDER BY addedOn DESC`,
      `%${query.trim()}%`,
    );
  };

  const deleteMedia = async (id: number) => {
    const statement = await db.prepareAsync(
      `DELETE FROM ${PICTURE_TABLE_NAME} WHERE id = $id;`,
    );
    try {
      return await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  };

  return { addMedia, addMultipleMedia, getAllMedias, searchByNotes, updateMediaNote, deleteMedia };
}
