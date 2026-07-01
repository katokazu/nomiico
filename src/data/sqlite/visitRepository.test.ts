import { SqliteRestaurantRepository } from "./restaurantRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "./testDb";
import { SqliteVisitRepository } from "./visitRepository";
import type { db as Database } from "./client";

describe("SqliteVisitRepository", () => {
  async function makeRepos() {
    const db: typeof Database = createTestDb();
    await seedTestOwner(db);
    const owner = async () => TEST_OWNER_ID;
    return {
      restaurants: new SqliteRestaurantRepository(db, owner),
      visits: new SqliteVisitRepository(db, owner),
    };
  }

  it("marks a restaurant visited and updates visit_count/last_visited_at", async () => {
    const { restaurants, visits } = await makeRepos();
    const restaurant = await restaurants.create({ name: "初訪問の店", sourceType: "manual" });
    expect(restaurant.visited).toBe(false);

    await visits.addVisit({ restaurantId: restaurant.id, visitedAt: "2026-01-10T12:00:00.000Z" });
    const afterFirst = await restaurants.findById(restaurant.id);
    expect(afterFirst?.visited).toBe(true);
    expect(afterFirst?.visitCount).toBe(1);
    expect(afterFirst?.lastVisitedAt).toBe("2026-01-10T12:00:00.000Z");

    await visits.addVisit({ restaurantId: restaurant.id, visitedAt: "2026-02-01T12:00:00.000Z" });
    const afterSecond = await restaurants.findById(restaurant.id);
    expect(afterSecond?.visitCount).toBe(2);
    expect(afterSecond?.lastVisitedAt).toBe("2026-02-01T12:00:00.000Z");
  });

  it("adds a visit with only a rating and edits it later", async () => {
    const { restaurants, visits } = await makeRepos();
    const restaurant = await restaurants.create({ name: "星だけ記録", sourceType: "manual" });

    const visit = await visits.addVisit({ restaurantId: restaurant.id, rating: 4 });
    expect(visit.memo).toBeUndefined();

    const updated = await visits.updateVisit(visit.id, { memo: "美味しかった", revisit: "yes" });
    expect(updated.memo).toBe("美味しかった");
    expect(updated.revisit).toBe("yes");
  });

  it("lists visits for a restaurant", async () => {
    const { restaurants, visits } = await makeRepos();
    const restaurant = await restaurants.create({ name: "複数訪問の店", sourceType: "manual" });
    await visits.addVisit({ restaurantId: restaurant.id, visitedAt: "2026-01-01T00:00:00.000Z" });
    await visits.addVisit({ restaurantId: restaurant.id, visitedAt: "2026-01-05T00:00:00.000Z" });

    const list = await visits.listByRestaurant(restaurant.id);
    expect(list).toHaveLength(2);
  });
});
