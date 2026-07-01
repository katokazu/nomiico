import { SqliteRestaurantRepository } from "./restaurantRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "./testDb";
import type { db as Database } from "./client";

/**
 * docs/testing/strategy.md #MVPで必ずカバーするケース の restaurants まわりを検証する。
 */

async function makeRepo(): Promise<SqliteRestaurantRepository> {
  const db: typeof Database = createTestDb();
  await seedTestOwner(db);
  return new SqliteRestaurantRepository(db, async () => TEST_OWNER_ID);
}

describe("SqliteRestaurantRepository", () => {
  it("saves a restaurant with minimal data (manual)", async () => {
    const repo = await makeRepo();
    const created = await repo.create({ name: "焼鳥や", sourceType: "manual" });

    expect(created.name).toBe("焼鳥や");
    expect(created.desireLevel).toBe(3);
    expect(created.archived).toBe(false);
    expect(created.visited).toBe(false);
    expect(created.tags).toEqual([]);
  });

  it("keeps the source url even when the name is missing (OGP failure)", async () => {
    const repo = await makeRepo();
    const created = await repo.create({
      sourceUrl: "https://example.com/shop",
      sourceType: "web",
    });

    expect(created.sourceUrl).toBe("https://example.com/shop");
    expect(created.name).toBe("名称未設定");
  });

  it("finds an existing restaurant by normalized url instead of creating a duplicate", async () => {
    const repo = await makeRepo();
    const created = await repo.create({
      sourceUrl: "https://example.com/shop/?utm_source=ig",
      sourceType: "web",
    });

    const found = await repo.findByNormalizedUrl("https://example.com/shop");
    expect(found?.id).toBe(created.id);
  });

  it("lists saved restaurants excluding archived/visited by default", async () => {
    const repo = await makeRepo();
    const kept = await repo.create({ name: "残る店", sourceType: "manual" });
    const archived = await repo.create({ name: "アーカイブ店", sourceType: "manual" });
    await repo.setArchived(archived.id, true);

    const list = await repo.list({});
    expect(list.map((r) => r.id)).toEqual([kept.id]);
  });

  it("filters candidates and does not return an empty set when unrelated fields are missing", async () => {
    const repo = await makeRepo();
    await repo.create({ name: "渋谷の店", sourceType: "manual" });
    const shibuya = await repo.update(
      (await repo.list({})).find((r) => r.name === "渋谷の店")!.id,
      { area: "渋谷" },
    );

    const results = await repo.pickCandidates({ area: "渋谷" });
    expect(results.map((r) => r.id)).toContain(shibuya.id);
  });

  it("excludes archived restaurants from decision candidates", async () => {
    const repo = await makeRepo();
    const restaurant = await repo.create({ name: "行かない店", sourceType: "manual" });
    await repo.setArchived(restaurant.id, true);

    const candidates = await repo.pickCandidates({});
    expect(candidates.map((r) => r.id)).not.toContain(restaurant.id);
  });

  it("updates desire level and other fields", async () => {
    const repo = await makeRepo();
    const created = await repo.create({ name: "更新テスト", sourceType: "manual" });
    const updated = await repo.update(created.id, { desireLevel: 5, genre: "焼肉" });

    expect(updated.desireLevel).toBe(5);
    expect(updated.genre).toBe("焼肉");
  });

  it("deletes a restaurant", async () => {
    const repo = await makeRepo();
    const created = await repo.create({ name: "削除テスト", sourceType: "manual" });
    await repo.delete(created.id);

    expect(await repo.findById(created.id)).toBeNull();
  });
});
