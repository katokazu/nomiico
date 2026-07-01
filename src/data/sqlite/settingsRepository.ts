import type { SettingsRepository } from "@/data/repository";
import type { NotifPermission, UserSettings } from "@/domain/models";

import type { db as Database } from "./client";

/** docs/database/schema.md `user_settings`。ひな型段階のため未実装。 */
export class SqliteSettingsRepository implements SettingsRepository {
  constructor(private readonly db: typeof Database) {}

  async getSettings(): Promise<UserSettings> {
    throw new Error("not implemented: SqliteSettingsRepository.getSettings");
  }

  async updateSettings(_patch: Partial<UserSettings>): Promise<UserSettings> {
    throw new Error("not implemented: SqliteSettingsRepository.updateSettings");
  }

  async setNotifPermission(_status: NotifPermission): Promise<void> {
    throw new Error("not implemented: SqliteSettingsRepository.setNotifPermission");
  }
}
