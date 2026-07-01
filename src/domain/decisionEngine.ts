import { REROLL_DECAY_FACTOR } from "@/config/scoring";
import type { Restaurant } from "./models";
import type { ScoredRestaurant } from "./scoring";

/**
 * gacha/roulette用の抽選ロジック (docs/specs/decide-flow.md #モード1 #モード3)。
 * I/Oを持たない純関数。乱数源はrngとして注入しテスト容易にする。
 */

/** スコアを重みにした加重ランダム抽選。スコア合計が0以下なら等確率にフォールバック。 */
export function weightedRandomPick(
  scored: ScoredRestaurant[],
  rng: () => number = Math.random,
): ScoredRestaurant {
  if (scored.length === 0) {
    throw new Error("scored candidates must not be empty");
  }
  const total = scored.reduce((sum, item) => sum + Math.max(item.score, 0), 0);
  if (total <= 0) {
    return scored[Math.floor(rng() * scored.length)];
  }
  let threshold = rng() * total;
  for (const item of scored) {
    threshold -= Math.max(item.score, 0);
    if (threshold <= 0) {
      return item;
    }
  }
  return scored[scored.length - 1];
}

/**
 * 「もう一回」用の再抽選。直前候補の重みを一時的に減衰させ連続同一を避ける
 * (docs/specs/decide-flow.md #モード1)。
 */
export function rerollPick(
  scored: ScoredRestaurant[],
  previousRestaurantId: string,
  rng: () => number = Math.random,
): ScoredRestaurant {
  const decayed = scored.map((item) =>
    item.restaurant.id === previousRestaurantId
      ? { ...item, score: item.score * REROLL_DECAY_FACTOR }
      : item,
  );
  return weightedRandomPick(decayed, rng);
}

/** roulette用の等確率抽選 (docs/specs/decide-flow.md #モード3)。 */
export function uniformPick(restaurants: Restaurant[], rng: () => number = Math.random): Restaurant {
  if (restaurants.length === 0) {
    throw new Error("restaurants must not be empty");
  }
  return restaurants[Math.floor(rng() * restaurants.length)];
}

/** ranking集計の加点配分。上位3件に3/2/1点、以降0点 (docs/specs/decide-flow.md 未決事項、v1暫定)。 */
export function rankingPoints(rank: number): number {
  const points = [3, 2, 1];
  return points[rank] ?? 0;
}
