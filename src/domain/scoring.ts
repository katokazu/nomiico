import { AGE_SATURATION_DAYS, SCORING_WEIGHTS, UNSEEN_SATURATION_DAYS } from "@/config/scoring";
import type { Restaurant } from "./models";

/**
 * 「今行くべき」スコア算出 (docs/specs/scoring.md)。
 * 座標が無いため物理距離は含めない。I/Oを持たない純関数、Repositoryが渡すデータのみで動く
 * (docs/patterns/implementation-patterns.md #ドメインロジックの純粋性)。
 */

export interface ScoringContext {
  now: Date;
  selectedTagIds?: string[];
  currentSeasonTagName?: string;
}

export interface ScoredRestaurant {
  restaurant: Restaurant;
  score: number;
  contributions: Record<keyof typeof SCORING_WEIGHTS, number>;
}

function daysSince(iso: string, now: Date): number {
  const diffMs = now.getTime() - new Date(iso).getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

export function fDesire(restaurant: Restaurant): number {
  return (restaurant.desireLevel - 1) / 4;
}

export function fAge(restaurant: Restaurant, now: Date): number {
  return Math.min(daysSince(restaurant.createdAt, now) / AGE_SATURATION_DAYS, 1);
}

export function fUnseen(restaurant: Restaurant, now: Date): number {
  if (!restaurant.lastSuggestedAt) {
    return 1;
  }
  return Math.min(daysSince(restaurant.lastSuggestedAt, now) / UNSEEN_SATURATION_DAYS, 1);
}

/** タグ一致度(Jaccard係数の簡易版) + 季節タグ一致。文脈指定が無ければ中立値0.5。 */
export function fContext(restaurant: Restaurant, context: ScoringContext): number {
  const selected = context.selectedTagIds;
  if (!selected || selected.length === 0) {
    return 0.5;
  }
  const restaurantTagIds = new Set(restaurant.tags.map((tag) => tag.id));
  const overlap = selected.filter((id) => restaurantTagIds.has(id)).length;
  const union = new Set([...selected, ...restaurantTagIds]).size;
  return union === 0 ? 0.5 : overlap / union;
}

export function fNovelty(restaurant: Restaurant): number {
  return restaurant.visited ? 1 / (restaurant.visitCount + 1) : 1;
}

export function scoreCandidates(
  restaurants: Restaurant[],
  context: ScoringContext,
): ScoredRestaurant[] {
  return restaurants.map((restaurant) => {
    const contributions = {
      desire: fDesire(restaurant),
      age: fAge(restaurant, context.now),
      unseen: fUnseen(restaurant, context.now),
      context: fContext(restaurant, context),
      novelty: fNovelty(restaurant),
    };
    const score =
      100 *
      (SCORING_WEIGHTS.desire * contributions.desire +
        SCORING_WEIGHTS.age * contributions.age +
        SCORING_WEIGHTS.unseen * contributions.unseen +
        SCORING_WEIGHTS.context * contributions.context +
        SCORING_WEIGHTS.novelty * contributions.novelty);
    return { restaurant, score, contributions };
  });
}
