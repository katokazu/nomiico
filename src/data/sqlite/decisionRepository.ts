import { and, eq, inArray } from "drizzle-orm";

import type { DecisionRepository, RestaurantRepository } from "@/data/repository";
import type {
  CandidateFilter,
  DecisionMode,
  DecisionSession,
  Restaurant,
  StartSessionOptions,
  SwipeResult,
} from "@/domain/models";
import { rankingPoints } from "@/domain/decisionEngine";
import { scoreCandidates } from "@/domain/scoring";

import type { db as Database } from "./client";
import { loadDecisionSession, toRestaurantsWithTags } from "./mappers";
import { getOwnerId, type OwnerIdProvider } from "./ownerId";
import { decisionCandidates, decisionSessions, restaurants } from "./schema";
import { newId, nowIso } from "./util";

/** docs/database/schema.md `decision_sessions` / `decision_candidates`。 */
export class SqliteDecisionRepository implements DecisionRepository {
  constructor(
    private readonly db: typeof Database,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly ownerId: OwnerIdProvider = getOwnerId,
  ) {}

  async startSession(
    mode: DecisionMode,
    filter: CandidateFilter,
    opts?: StartSessionOptions,
  ): Promise<DecisionSession> {
    const ownerId = await this.ownerId();

    // アクティブセッションは同時1つ (docs/specs/decide-flow.md #Functional Requirements)。
    await this.db
      .update(decisionSessions)
      .set({ status: "cancelled" })
      .where(and(eq(decisionSessions.ownerId, ownerId), eq(decisionSessions.status, "active")));

    const candidates = await this.restaurantRepository.pickCandidates(filter);
    const scored = scoreCandidates(candidates, { now: new Date(), selectedTagIds: filter.tagIds });

    const now = nowIso();
    const sessionId = newId();
    const [sessionRow] = await this.db
      .insert(decisionSessions)
      .values({
        id: sessionId,
        ownerId,
        mode,
        status: "active",
        filters: JSON.stringify(filter),
        participantCount: opts?.participantCount,
        createdAt: now,
      })
      .returning();

    if (scored.length > 0) {
      await this.db.insert(decisionCandidates).values(
        scored.map(({ restaurant, score }) => ({
          id: newId(),
          sessionId,
          restaurantId: restaurant.id,
          score: Math.round(score),
          swipeResult: mode === "swipe" ? ("pending" as const) : undefined,
        })),
      );
    }

    return loadDecisionSession(this.db, sessionRow);
  }

  async getSession(id: string): Promise<DecisionSession> {
    const ownerId = await this.ownerId();
    const [row] = await this.db
      .select()
      .from(decisionSessions)
      .where(and(eq(decisionSessions.id, id), eq(decisionSessions.ownerId, ownerId)));
    if (!row) {
      throw new Error(`decision session not found: ${id}`);
    }
    return loadDecisionSession(this.db, row);
  }

  async recordSwipe(sessionId: string, restaurantId: string, result: SwipeResult): Promise<void> {
    await this.db
      .update(decisionCandidates)
      .set({ swipeResult: result })
      .where(
        and(
          eq(decisionCandidates.sessionId, sessionId),
          eq(decisionCandidates.restaurantId, restaurantId),
        ),
      );
  }

  async keptCandidates(sessionId: string): Promise<Restaurant[]> {
    const rows = await this.db
      .select({ restaurant: restaurants })
      .from(decisionCandidates)
      .innerJoin(restaurants, eq(decisionCandidates.restaurantId, restaurants.id))
      .where(
        and(
          eq(decisionCandidates.sessionId, sessionId),
          eq(decisionCandidates.swipeResult, "kept"),
        ),
      );
    return toRestaurantsWithTags(
      this.db,
      rows.map((row) => row.restaurant),
    );
  }

  async castVote(sessionId: string, restaurantId: string): Promise<void> {
    const [row] = await this.db
      .select()
      .from(decisionCandidates)
      .where(
        and(
          eq(decisionCandidates.sessionId, sessionId),
          eq(decisionCandidates.restaurantId, restaurantId),
        ),
      );
    if (!row) {
      return;
    }
    await this.db
      .update(decisionCandidates)
      .set({ tally: row.tally + 1 })
      .where(eq(decisionCandidates.id, row.id));
  }

  async castRanking(sessionId: string, ranked: string[]): Promise<void> {
    const rows = await this.db
      .select()
      .from(decisionCandidates)
      .where(
        and(
          eq(decisionCandidates.sessionId, sessionId),
          inArray(decisionCandidates.restaurantId, ranked),
        ),
      );
    const rowByRestaurantId = new Map(rows.map((row) => [row.restaurantId, row]));

    for (const [index, restaurantId] of ranked.entries()) {
      const points = rankingPoints(index);
      if (points <= 0) continue;
      const row = rowByRestaurantId.get(restaurantId);
      if (!row) continue;
      await this.db
        .update(decisionCandidates)
        .set({ tally: row.tally + points })
        .where(eq(decisionCandidates.id, row.id));
    }
  }

  async dismissRecordPrompt(sessionId: string): Promise<void> {
    await this.db
      .update(decisionSessions)
      .set({ recordPromptDismissedAt: nowIso() })
      .where(eq(decisionSessions.id, sessionId));
  }

  async complete(sessionId: string, decidedRestaurantId: string): Promise<void> {
    const ownerId = await this.ownerId();
    const now = nowIso();
    await this.db
      .update(decisionSessions)
      .set({ status: "completed", decidedRestaurantId, completedAt: now })
      .where(eq(decisionSessions.id, sessionId));

    await this.db
      .update(restaurants)
      .set({ lastSuggestedAt: now, updatedAt: now })
      .where(and(eq(restaurants.id, decidedRestaurantId), eq(restaurants.ownerId, ownerId)));
  }

  async cancel(sessionId: string): Promise<void> {
    await this.db
      .update(decisionSessions)
      .set({ status: "cancelled" })
      .where(eq(decisionSessions.id, sessionId));
  }
}
