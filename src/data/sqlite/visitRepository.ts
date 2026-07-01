import type { VisitRepository } from "@/data/repository";
import type { AddVisitInput, DecisionSession, Visit } from "@/domain/models";

import type { db as Database } from "./client";

/** docs/database/schema.md `visits`。ひな型段階のため未実装。 */
export class SqliteVisitRepository implements VisitRepository {
  constructor(private readonly db: typeof Database) {}

  async addVisit(_input: AddVisitInput): Promise<Visit> {
    throw new Error("not implemented: SqliteVisitRepository.addVisit");
  }

  async listByRestaurant(_restaurantId: string): Promise<Visit[]> {
    throw new Error("not implemented: SqliteVisitRepository.listByRestaurant");
  }

  async updateVisit(_id: string, _patch: Partial<Visit>): Promise<Visit> {
    throw new Error("not implemented: SqliteVisitRepository.updateVisit");
  }

  async findPendingRecordPrompt(): Promise<DecisionSession | null> {
    throw new Error("not implemented: SqliteVisitRepository.findPendingRecordPrompt");
  }
}
