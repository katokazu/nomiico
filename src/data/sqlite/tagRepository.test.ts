import { SqliteRestaurantRepository } from "./restaurantRepository";
import { SqliteTagRepository } from "./tagRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "./testDb";
import type { db as Database } from "./client";

describe("SqliteTagRepository", () => {
  async function makeRepos() {
    const db: typeof Database = createTestDb();
    await seedTestOwner(db);
    const owner = async () => TEST_OWNER_ID;
    return {
      tags: new SqliteTagRepository(db, owner),
      restaurants: new SqliteRestaurantRepository(db, owner),
    };
  }

  it("seeds system tag presets and is idempotent", async () => {
    const { tags } = await makeRepos();
    await tags.seedSystemTags();
    await tags.seedSystemTags();

    const all = await tags.listTags();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((tag) => tag.isSystem)).toBe(true);
    const names = all.map((tag) => tag.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("creates a user tag and attaches it to a restaurant", async () => {
    const { tags, restaurants } = await makeRepos();
    const tag = await tags.createTag("駅近", "feature");
    const restaurant = await restaurants.create({ name: "タグ付けテスト", sourceType: "manual" });

    await tags.setRestaurantTags(restaurant.id, [tag.id]);

    const found = await restaurants.findById(restaurant.id);
    expect(found?.tags.map((t) => t.id)).toEqual([tag.id]);
  });

  it("replaces restaurant tags on subsequent calls", async () => {
    const { tags, restaurants } = await makeRepos();
    const tagA = await tags.createTag("個室", "feature");
    const tagB = await tags.createTag("駅近", "feature");
    const restaurant = await restaurants.create({ name: "付け替えテスト", sourceType: "manual" });

    await tags.setRestaurantTags(restaurant.id, [tagA.id]);
    await tags.setRestaurantTags(restaurant.id, [tagB.id]);

    const found = await restaurants.findById(restaurant.id);
    expect(found?.tags.map((t) => t.id)).toEqual([tagB.id]);
  });
});
