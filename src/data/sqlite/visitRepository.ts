import { and, eq, isNotNull, isNull, notInArray, sql } from "drizzle-orm";

import type { VisitRepository } from "@/data/repository";
import type { AddVisitInput, DecisionSession, Visit } from "@/domain/models";

import type { db as Database } from "./client";
import { loadDecisionSession, toVisit } from "./mappers";
import { getOwnerId, type OwnerIdProvider } from "./ownerId";
import { decisionSessions, restaurants, visits } from "./schema";
import { newId, nowIso } from "./util";

/** docs/database/schema.md `visits`。 */
export class SqliteVisitRepository implements VisitRepository {
  constructor(
    private readonly db: typeof Database,
    private readonly ownerId: OwnerIdProvider = getOwnerId,
  ) {}

  async addVisit(input: AddVisitInput): Promise<Visit> {
    const ownerId = await this.ownerId();
    const visitedAt = input.visitedAt ?? nowIso();

    const [row] = await this.db
      .insert(visits)
      .values({
        id: newId(),
        ownerId,
        restaurantId: input.restaurantId,
        decisionSessionId: input.decisionSessionId,
        visitedAt,
        rating: input.rating,
        memo: input.memo,
        companion: input.companion,
        revisit: input.revisit,
        photoUri: input.photoUri,
        createdAt: nowIso(),
      })
      .returning();

    // 訪問追加時にrestaurants.visited/visit_count/last_visited_atも更新する
    // (docs/api/api-design.md VisitRepository.addVisit)。
    await this.db
      .update(restaurants)
      .set({
        visited: 1,
        visitCount: sql`${restaurants.visitCount} + 1`,
        lastVisitedAt: sql`CASE WHEN ${restaurants.lastVisitedAt} IS NULL OR ${restaurants.lastVisitedAt} < ${visitedAt} THEN ${visitedAt} ELSE ${restaurants.lastVisitedAt} END`,
        updatedAt: nowIso(),
      })
      .where(and(eq(restaurants.id, input.restaurantId), eq(restaurants.ownerId, ownerId)));

    return toVisit(row);
  }

  async listByRestaurant(restaurantId: string): Promise<Visit[]> {
    const rows = await this.db
      .select()
      .from(visits)
      .where(eq(visits.restaurantId, restaurantId))
      .orderBy(sql`${visits.visitedAt} DESC`);
    return rows.map(toVisit);
  }

  async updateVisit(id: string, patch: Partial<Visit>): Promise<Visit> {
    const values: Partial<typeof visits.$inferInsert> = {};
    if (patch.rating !== undefined) values.rating = patch.rating;
    if (patch.memo !== undefined) values.memo = patch.memo;
    if (patch.companion !== undefined) values.companion = patch.companion;
    if (patch.revisit !== undefined) values.revisit = patch.revisit;
    if (patch.photoUri !== undefined) values.photoUri = patch.photoUri;
    if (patch.visitedAt !== undefined) values.visitedAt = patch.visitedAt;

    await this.db.update(visits).set(values).where(eq(visits.id, id));

    const [row] = await this.db.select().from(visits).where(eq(visits.id, id));
    if (!row) {
      throw new Error(`visit not found: ${id}`);
    }
    return toVisit(row);
  }

  async findPendingRecordPrompt(): Promise<DecisionSession | null> {
    const ownerId = await this.ownerId();

    const recordedSessionIds = this.db
      .select({ id: visits.decisionSessionId })
      .from(visits)
      .where(isNotNull(visits.decisionSessionId));

    const [row] = await this.db
      .select()
      .from(decisionSessions)
      .where(
        and(
          eq(decisionSessions.ownerId, ownerId),
          eq(decisionSessions.status, "completed"),
          isNotNull(decisionSessions.decidedRestaurantId),
          isNull(decisionSessions.recordPromptDismissedAt),
          notInArray(decisionSessions.id, recordedSessionIds),
        ),
      );

    if (!row) {
      return null;
    }
    return loadDecisionSession(this.db, row);
  }
}
