import { eq, inArray } from "drizzle-orm";

import type {
  DecisionCandidate,
  DecisionSession,
  Restaurant,
  Tag,
  UserSettings,
  Visit,
} from "@/domain/models";

import type { db as Database } from "./client";
import {
  decisionCandidates,
  decisionSessions,
  restaurantTags,
  restaurants,
  tags,
  userSettings,
  visits,
} from "./schema";

/**
 * DB行(snake_case) ↔ ドメイン型(camelCase)の変換 (docs/standards/coding.md #命名)。
 * 複数Repositoryから使う変換のみここに集約する。
 */

type RestaurantRow = typeof restaurants.$inferSelect;
type TagRow = typeof tags.$inferSelect;
type VisitRow = typeof visits.$inferSelect;
type UserSettingsRow = typeof userSettings.$inferSelect;
type DecisionSessionRow = typeof decisionSessions.$inferSelect;
type DecisionCandidateRow = typeof decisionCandidates.$inferSelect;

export function toTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Tag["category"],
    isSystem: row.isSystem === 1,
  };
}

export function toRestaurant(row: RestaurantRow, restaurantTagsList: Tag[]): Restaurant {
  return {
    id: row.id,
    name: row.name,
    sourceUrl: row.sourceUrl ?? undefined,
    sourceType: row.sourceType as Restaurant["sourceType"],
    normalizedUrl: row.normalizedUrl ?? undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    genre: row.genre ?? undefined,
    area: row.area ?? undefined,
    nearestStation: row.nearestStation ?? undefined,
    address: row.address ?? undefined,
    priceRange: row.priceRange ?? undefined,
    desireLevel: row.desireLevel,
    visited: row.visited === 1,
    visitCount: row.visitCount,
    archived: row.archived === 1,
    tags: restaurantTagsList,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastSuggestedAt: row.lastSuggestedAt ?? undefined,
    lastVisitedAt: row.lastVisitedAt ?? undefined,
  };
}

/** restaurant_tags/tagsを1クエリでまとめて引き、restaurantId毎にグループ化する(N+1回避)。 */
export async function loadTagsByRestaurantId(
  db: typeof Database,
  restaurantIds: string[],
): Promise<Map<string, Tag[]>> {
  const grouped = new Map<string, Tag[]>();
  if (restaurantIds.length === 0) {
    return grouped;
  }
  const rows = await db
    .select({ restaurantId: restaurantTags.restaurantId, tag: tags })
    .from(restaurantTags)
    .innerJoin(tags, eq(restaurantTags.tagId, tags.id))
    .where(inArray(restaurantTags.restaurantId, restaurantIds));

  for (const row of rows) {
    const list = grouped.get(row.restaurantId) ?? [];
    list.push(toTag(row.tag));
    grouped.set(row.restaurantId, list);
  }
  return grouped;
}

export async function toRestaurantsWithTags(
  db: typeof Database,
  rows: RestaurantRow[],
): Promise<Restaurant[]> {
  const tagsByRestaurant = await loadTagsByRestaurantId(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => toRestaurant(row, tagsByRestaurant.get(row.id) ?? []));
}

export async function toRestaurantWithTags(
  db: typeof Database,
  row: RestaurantRow,
): Promise<Restaurant> {
  const tagsByRestaurant = await loadTagsByRestaurantId(db, [row.id]);
  return toRestaurant(row, tagsByRestaurant.get(row.id) ?? []);
}

export function toVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    decisionSessionId: row.decisionSessionId ?? undefined,
    visitedAt: row.visitedAt,
    rating: row.rating ?? undefined,
    memo: row.memo ?? undefined,
    companion: row.companion ?? undefined,
    revisit: (row.revisit as Visit["revisit"]) ?? undefined,
    photoUri: row.photoUri ?? undefined,
    createdAt: row.createdAt,
  };
}

export function toUserSettings(row: UserSettingsRow): UserSettings {
  return {
    notificationsEnabled: row.notificationsEnabled === 1,
    notifyTimes: row.notifyTimes ? (JSON.parse(row.notifyTimes) as string[]) : undefined,
    notifyMaxPerDay: row.notifyMaxPerDay,
    resurfaceAfterDays: row.resurfaceAfterDays,
    notifPermissionStatus: row.notifPermissionStatus as UserSettings["notifPermissionStatus"],
  };
}

export function toDecisionCandidate(row: DecisionCandidateRow): DecisionCandidate {
  return {
    id: row.id,
    sessionId: row.sessionId,
    restaurantId: row.restaurantId,
    score: row.score ?? undefined,
    rank: row.rank ?? undefined,
    swipeResult: (row.swipeResult as DecisionCandidate["swipeResult"]) ?? undefined,
    tally: row.tally,
  };
}

export function toDecisionSession(
  row: DecisionSessionRow,
  candidates: DecisionCandidate[],
): DecisionSession {
  return {
    id: row.id,
    mode: row.mode as DecisionSession["mode"],
    status: row.status as DecisionSession["status"],
    filters: row.filters ? JSON.parse(row.filters) : undefined,
    participantCount: row.participantCount ?? undefined,
    decidedRestaurantId: row.decidedRestaurantId ?? undefined,
    recordPromptDismissedAt: row.recordPromptDismissedAt ?? undefined,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? undefined,
    candidates,
  };
}

export async function loadDecisionSession(
  db: typeof Database,
  row: DecisionSessionRow,
): Promise<DecisionSession> {
  const candidateRows = await db
    .select()
    .from(decisionCandidates)
    .where(eq(decisionCandidates.sessionId, row.id));
  return toDecisionSession(
    row,
    candidateRows.map((candidateRow) => toDecisionCandidate(candidateRow)),
  );
}
