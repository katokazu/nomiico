import { eq } from "drizzle-orm";

import type { SettingsRepository } from "@/data/repository";
import type { NotifPermission, UserSettings } from "@/domain/models";

import type { db as Database } from "./client";
import { toUserSettings } from "./mappers";
import { getOwnerId, type OwnerIdProvider } from "./ownerId";
import { userSettings } from "./schema";
import { nowIso } from "./util";

/** docs/database/schema.md `user_settings`。 */
export class SqliteSettingsRepository implements SettingsRepository {
  constructor(
    private readonly db: typeof Database,
    private readonly ownerId: OwnerIdProvider = getOwnerId,
  ) {}

  async getSettings(): Promise<UserSettings> {
    const ownerId = await this.ownerId();
    const [row] = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.ownerId, ownerId));

    if (row) {
      return toUserSettings(row);
    }

    // ownerId解決時にensureOwnerRowsで既定行を作成済みのはずだが、
    // 未作成の場合はここでシードする(取得時に既定値を必ず返す契約)。
    const [seeded] = await this.db
      .insert(userSettings)
      .values({ ownerId, updatedAt: nowIso() })
      .onConflictDoNothing()
      .returning();
    if (seeded) {
      return toUserSettings(seeded);
    }
    const [existing] = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.ownerId, ownerId));
    return toUserSettings(existing);
  }

  async updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
    await this.getSettings(); // 既定行が無ければ先にシードする
    const ownerId = await this.ownerId();
    const values: Partial<typeof userSettings.$inferInsert> = { updatedAt: nowIso() };

    if (patch.notificationsEnabled !== undefined) {
      values.notificationsEnabled = patch.notificationsEnabled ? 1 : 0;
    }
    if (patch.notifyTimes !== undefined) {
      values.notifyTimes = JSON.stringify(patch.notifyTimes);
    }
    if (patch.notifyMaxPerDay !== undefined) values.notifyMaxPerDay = patch.notifyMaxPerDay;
    if (patch.resurfaceAfterDays !== undefined) {
      values.resurfaceAfterDays = patch.resurfaceAfterDays;
    }
    if (patch.notifPermissionStatus !== undefined) {
      values.notifPermissionStatus = patch.notifPermissionStatus;
    }

    await this.db.update(userSettings).set(values).where(eq(userSettings.ownerId, ownerId));
    return this.getSettings();
  }

  async setNotifPermission(status: NotifPermission): Promise<void> {
    await this.getSettings(); // 既定行が無ければ先にシードする
    const ownerId = await this.ownerId();
    await this.db
      .update(userSettings)
      .set({ notifPermissionStatus: status, updatedAt: nowIso() })
      .where(eq(userSettings.ownerId, ownerId));
  }
}
