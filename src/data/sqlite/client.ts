import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

/**
 * 端末ローカルSQLite接続 (docs/architecture/overview.md #Layers)。
 * アプリ全体で単一インスタンスを共有する。
 */
export const sqliteDatabase = openDatabaseSync("nomiico.db");
// CASCADE削除・FK制約を有効化する(SQLiteは既定でFK制約を無視するため)。
sqliteDatabase.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqliteDatabase, { schema });
