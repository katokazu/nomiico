import { SqliteDecisionRepository } from "./decisionRepository";
import { SqliteRestaurantRepository } from "./restaurantRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "./testDb";
import type { db as Database } from "./client";

describe("SqliteDecisionRepository", () => {
  async function makeRepos() {
    const db: typeof Database = createTestDb();
    await seedTestOwner(db);
    const owner = async () => TEST_OWNER_ID;
    const restaurants = new SqliteRestaurantRepository(db, owner);
    const decisions = new SqliteDecisionRepository(db, restaurants, owner);
    return { restaurants, decisions };
  }

  it("starts a gacha session with scored candidates from the saved pool", async () => {
    const { restaurants, decisions } = await makeRepos();
    await restaurants.create({ name: "候補1", sourceType: "manual", desireLevel: 5 });
    await restaurants.create({ name: "候補2", sourceType: "manual", desireLevel: 1 });

    const session = await decisions.startSession("gacha", {});
    expect(session.status).toBe("active");
    expect(session.candidates).toHaveLength(2);
    expect(session.candidates.every((c) => typeof c.score === "number")).toBe(true);
  });

  it("cancels the previous active session when a new one starts", async () => {
    const { restaurants, decisions } = await makeRepos();
    await restaurants.create({ name: "候補1", sourceType: "manual" });

    const first = await decisions.startSession("gacha", {});
    await decisions.startSession("gacha", {});

    const reloadedFirst = await decisions.getSession(first.id);
    expect(reloadedFirst.status).toBe("cancelled");
  });

  it("records swipe results and returns the kept set", async () => {
    const { restaurants, decisions } = await makeRepos();
    const a = await restaurants.create({ name: "スワイプA", sourceType: "manual" });
    const b = await restaurants.create({ name: "スワイプB", sourceType: "manual" });

    const session = await decisions.startSession("swipe", {});
    await decisions.recordSwipe(session.id, a.id, "kept");
    await decisions.recordSwipe(session.id, b.id, "rejected");

    const kept = await decisions.keptCandidates(session.id);
    expect(kept.map((r) => r.id)).toEqual([a.id]);
  });

  it("tallies votes for みんなで・投票制", async () => {
    const { restaurants, decisions } = await makeRepos();
    const a = await restaurants.create({ name: "投票A", sourceType: "manual" });

    const session = await decisions.startSession("vote", {}, { participantCount: 3 });
    await decisions.castVote(session.id, a.id);
    await decisions.castVote(session.id, a.id);

    const reloaded = await decisions.getSession(session.id);
    expect(reloaded.candidates.find((c) => c.restaurantId === a.id)?.tally).toBe(2);
  });

  it("completes a session and updates last_suggested_at on the decided restaurant", async () => {
    const { restaurants, decisions } = await makeRepos();
    const a = await restaurants.create({ name: "決定される店", sourceType: "manual" });
    const session = await decisions.startSession("gacha", {});

    await decisions.complete(session.id, a.id);

    const completedSession = await decisions.getSession(session.id);
    expect(completedSession.status).toBe("completed");
    expect(completedSession.decidedRestaurantId).toBe(a.id);

    const updatedRestaurant = await restaurants.findById(a.id);
    expect(updatedRestaurant?.lastSuggestedAt).toBeTruthy();
  });
});
