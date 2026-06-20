import { ALBUM_MEDIA_TABLE_NAME, ALBUM_TABLE_NAME, PICTURE_TABLE_NAME } from "@/constants/app-contants";
import * as SQLite from "expo-sqlite";

export async function initDb(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${PICTURE_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mediaPath TEXT NOT NULL UNIQUE,
        addedOn INTEGER NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS ${ALBUM_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        createdOn INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${ALBUM_MEDIA_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        albumId INTEGER NOT NULL,
        mediaPath TEXT NOT NULL,
        addedOn INTEGER NOT NULL,
        UNIQUE(albumId, mediaPath),
        FOREIGN KEY (albumId) REFERENCES ${ALBUM_TABLE_NAME}(id) ON DELETE CASCADE
      );
    `);
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}
