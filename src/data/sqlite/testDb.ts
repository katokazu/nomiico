import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";
import type { db as Database } from "./client";

/**
 * Repository結合テスト用のインメモリSQLite (docs/testing/strategy.md #レイヤー別方針)。
 * expo-sqliteはJest上で動かないため、同じDrizzleスキーマをbetter-sqlite3へ適用する。
 * マイグレーションSQLは生成済みファイルをそのまま再生し、スキーマの乖離を防ぐ。
 */
export function createTestDb(): typeof Database {
  const sqlite = new BetterSqlite3(":memory:");
  sqlite.pragma("foreign_keys = ON");

  const migrationSql = fs.readFileSync(
    path.join(__dirname, "migrations", "0000_init.sql"),
    "utf-8",
  );
  for (const statement of migrationSql.split("--> statement-breakpoint")) {
    const trimmed = statement.trim();
    if (trimmed) {
      sqlite.exec(trimmed);
    }
  }

  return drizzle(sqlite, { schema }) as unknown as typeof Database;
}

export const TEST_OWNER_ID = "test-owner";

/** restaurants等のFK(owner_id → app_user.id)を満たすためのテスト用ownerシード。 */
export async function seedTestOwner(
  db: typeof Database,
  ownerId: string = TEST_OWNER_ID,
): Promise<void> {
  await db.insert(schema.appUser).values({ id: ownerId, createdAt: new Date().toISOString() });
}
