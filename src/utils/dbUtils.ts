import { PICTURE_TABLE_NAME } from "@/constants/app-contants";
import { type SQLiteDatabase } from "expo-sqlite";

export async function initDb(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${PICTURE_TABLE_NAME}
     (id INTEGER PRIMARY KEY NOT NULL, mediaPath TEXT NOT NULL, addedOn INTEGER, notes TEXT);
`);
    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
}
