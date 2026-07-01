import type { DecisionRepository } from "@/data/repository";
import type {
  CandidateFilter,
  DecisionMode,
  DecisionSession,
  Restaurant,
  StartSessionOptions,
  SwipeResult,
} from "@/domain/models";

import type { db as Database } from "./client";

/** docs/database/schema.md `decision_sessions` / `decision_candidates`。ひな型段階のため未実装。 */
export class SqliteDecisionRepository implements DecisionRepository {
  constructor(private readonly db: typeof Database) {}

  async startSession(
    _mode: DecisionMode,
    _filter: CandidateFilter,
    _opts?: StartSessionOptions,
  ): Promise<DecisionSession> {
    throw new Error("not implemented: SqliteDecisionRepository.startSession");
  }

  async getSession(_id: string): Promise<DecisionSession> {
    throw new Error("not implemented: SqliteDecisionRepository.getSession");
  }

  async recordSwipe(
    _sessionId: string,
    _restaurantId: string,
    _result: SwipeResult,
  ): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.recordSwipe");
  }

  async keptCandidates(_sessionId: string): Promise<Restaurant[]> {
    throw new Error("not implemented: SqliteDecisionRepository.keptCandidates");
  }

  async castVote(_sessionId: string, _restaurantId: string): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.castVote");
  }

  async castRanking(_sessionId: string, _ranked: string[]): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.castRanking");
  }

  async dismissRecordPrompt(_sessionId: string): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.dismissRecordPrompt");
  }

  async complete(_sessionId: string, _decidedRestaurantId: string): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.complete");
  }

  async cancel(_sessionId: string): Promise<void> {
    throw new Error("not implemented: SqliteDecisionRepository.cancel");
  }
}
