import { SqliteSettingsRepository } from "./settingsRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "./testDb";
import type { db as Database } from "./client";

describe("SqliteSettingsRepository", () => {
  async function makeRepo(): Promise<SqliteSettingsRepository> {
    const db: typeof Database = createTestDb();
    await seedTestOwner(db);
    return new SqliteSettingsRepository(db, async () => TEST_OWNER_ID);
  }

  it("seeds default settings on first access", async () => {
    const repo = await makeRepo();
    const settings = await repo.getSettings();

    expect(settings.notificationsEnabled).toBe(true);
    expect(settings.notifyMaxPerDay).toBe(1);
    expect(settings.resurfaceAfterDays).toBe(90);
    expect(settings.notifPermissionStatus).toBe("unasked");
  });

  it("updates notification preferences", async () => {
    const repo = await makeRepo();
    const updated = await repo.updateSettings({
      notificationsEnabled: false,
      notifyTimes: ["11:00", "17:00"],
    });

    expect(updated.notificationsEnabled).toBe(false);
    expect(updated.notifyTimes).toEqual(["11:00", "17:00"]);
  });

  it("records the notification permission result", async () => {
    const repo = await makeRepo();
    await repo.setNotifPermission("granted");

    expect((await repo.getSettings()).notifPermissionStatus).toBe("granted");
  });
});
