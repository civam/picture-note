import { PICTURE_TABLE_NAME } from "@/constants/app-contants";
import * as SQLite from "expo-sqlite";

/**
 * Initialize the media notes database and create table if needed
 */
export async function initDb(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Create mediadata table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${PICTURE_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mediaPath TEXT NOT NULL UNIQUE,
        addedOn INTEGER NOT NULL,
        notes TEXT
      );
    `);

    console.log(`✓ Database initialized and ${PICTURE_TABLE_NAME} table ready`);
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}
