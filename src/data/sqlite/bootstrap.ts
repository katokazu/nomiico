import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "./client";
import migrations from "./migrations/migrations";
import { getOwnerId } from "./ownerId";
import { localSqliteRepository } from "./index";

/**
 * アプリ起動時の初期化 (docs/database/schema.md #マイグレーション)。
 * 未適用マイグレーションの実行→匿名owner_idの解決→システムタグのシードを順に行う。
 * 冪等なので毎起動呼び出してよい。
 */
export async function bootstrapDatabase(): Promise<void> {
  await migrate(db, migrations);
  await getOwnerId();
  await localSqliteRepository.tags.seedSystemTags();
}
