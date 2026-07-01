import { db } from "./client";
import { SqliteDecisionRepository } from "./decisionRepository";
import { SqliteImportRepository } from "./importRepository";
import { SqliteRestaurantRepository } from "./restaurantRepository";
import { SqliteSettingsRepository } from "./settingsRepository";
import { SqliteTagRepository } from "./tagRepository";
import { SqliteVisitRepository } from "./visitRepository";

/**
 * 端末ローカルSQLite実装のまとめ (docs/architecture/overview.md #Layers `LocalSqliteRepository`)。
 * 画面/サービス層はこれ経由でのみ永続化に触れる。
 */
const restaurantRepository = new SqliteRestaurantRepository(db);

export const localSqliteRepository = {
  restaurants: restaurantRepository,
  tags: new SqliteTagRepository(db),
  visits: new SqliteVisitRepository(db),
  settings: new SqliteSettingsRepository(db),
  imports: new SqliteImportRepository(db),
  decisions: new SqliteDecisionRepository(db, restaurantRepository),
};
