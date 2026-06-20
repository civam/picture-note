import { ALBUM_MEDIA_TABLE_NAME, ALBUM_TABLE_NAME } from "@/constants/app-contants";
import { AlbumWithStats } from "@/constants/picture";
import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";

export function useAlbumDb() {
  const db = useSQLiteContext();

  const createAlbum = useCallback(async (name: string): Promise<number> => {
    const stmt = await db.prepareAsync(
      `INSERT INTO ${ALBUM_TABLE_NAME} (name, createdOn) VALUES ($name, $createdOn);`,
    );
    try {
      const result = await stmt.executeAsync({ $name: name.trim(), $createdOn: Date.now() });
      return result.lastInsertRowId;
    } finally {
      await stmt.finalizeAsync();
    }
  };

  const getAllAlbumsWithStats = async (): Promise<AlbumWithStats[]> => {
    return db.getAllAsync<AlbumWithStats>(`
      SELECT
        a.id,
        a.name,
        a.createdOn,
        COUNT(am.mediaPath) as mediaCount,
        (SELECT am2.mediaPath FROM ${ALBUM_MEDIA_TABLE_NAME} am2
         WHERE am2.albumId = a.id
         ORDER BY am2.addedOn DESC LIMIT 1) as coverPath
      FROM ${ALBUM_TABLE_NAME} a
      LEFT JOIN ${ALBUM_MEDIA_TABLE_NAME} am ON a.id = am.albumId
      GROUP BY a.id
      ORDER BY a.createdOn DESC
    `);
  };

  const addMediaToAlbum = async (albumId: number, mediaPaths: string[]): Promise<void> => {
    if (mediaPaths.length === 0) return;
    const stmt = await db.prepareAsync(
      `INSERT OR IGNORE INTO ${ALBUM_MEDIA_TABLE_NAME} (albumId, mediaPath, addedOn)
       VALUES ($albumId, $mediaPath, $addedOn);`,
    );
    try {
      for (const path of mediaPaths) {
        await stmt.executeAsync({ $albumId: albumId, $mediaPath: path, $addedOn: Date.now() });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  };

  const getAlbumMediaPaths = async (albumId: number): Promise<string[]> => {
    const rows = await db.getAllAsync<{ mediaPath: string }>(
      `SELECT mediaPath FROM ${ALBUM_MEDIA_TABLE_NAME} WHERE albumId = ? ORDER BY addedOn DESC`,
      albumId,
    );
    return rows.map((r) => r.mediaPath);
  };

  const removeMediaFromAlbum = async (albumId: number, mediaPaths: string[]): Promise<void> => {
    if (mediaPaths.length === 0) return;
    const stmt = await db.prepareAsync(
      `DELETE FROM ${ALBUM_MEDIA_TABLE_NAME} WHERE albumId = $albumId AND mediaPath = $mediaPath;`,
    );
    try {
      for (const path of mediaPaths) {
        await stmt.executeAsync({ $albumId: albumId, $mediaPath: path });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  };

  const deleteAlbum = async (albumId: number): Promise<void> => {
    const stmt = await db.prepareAsync(
      `DELETE FROM ${ALBUM_TABLE_NAME} WHERE id = $id;`,
    );
    try {
      await stmt.executeAsync({ $id: albumId });
    } finally {
      await stmt.finalizeAsync();
    }
  };

  return {
    createAlbum,
    getAllAlbumsWithStats,
    addMediaToAlbum,
    getAlbumMediaPaths,
    removeMediaFromAlbum,
    deleteAlbum,
  };
}
