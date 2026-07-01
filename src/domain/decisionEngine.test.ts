import { rerollPick, uniformPick, weightedRandomPick } from "./decisionEngine";
import type { ScoredRestaurant } from "./scoring";
import type { Restaurant } from "./models";

function makeRestaurant(id: string): Restaurant {
  return {
    id,
    name: id,
    sourceType: "manual",
    desireLevel: 3,
    visited: false,
    visitCount: 0,
    archived: false,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeScored(id: string, score: number): ScoredRestaurant {
  return {
    restaurant: makeRestaurant(id),
    score,
    contributions: { desire: 0, age: 0, unseen: 0, context: 0, novelty: 0 },
  };
}

describe("weightedRandomPick", () => {
  it("picks proportionally to score using the injected rng", () => {
    const scored = [makeScored("low", 10), makeScored("high", 90)];

    expect(weightedRandomPick(scored, () => 0.05).restaurant.id).toBe("low");
    expect(weightedRandomPick(scored, () => 0.5).restaurant.id).toBe("high");
  });

  it("falls back to uniform selection when all scores are zero", () => {
    const scored = [makeScored("a", 0), makeScored("b", 0)];
    expect(weightedRandomPick(scored, () => 0.9).restaurant.id).toBe("b");
  });
});

describe("rerollPick", () => {
  it("decays the previous pick so it is less likely to repeat", () => {
    const scored = [makeScored("previous", 50), makeScored("other", 50)];
    // 減衰後: previous=10, other=50 → 合計60。rng=0.2 → threshold=12 → previousを消費しきれず次へ。
    expect(rerollPick(scored, "previous", () => 0.2).restaurant.id).toBe("other");
  });
});

describe("uniformPick", () => {
  it("selects by index proportional to rng", () => {
    const restaurants = [makeRestaurant("a"), makeRestaurant("b"), makeRestaurant("c")];
    expect(uniformPick(restaurants, () => 0.9).id).toBe("c");
  });
});
