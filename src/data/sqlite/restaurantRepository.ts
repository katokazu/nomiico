import type { RestaurantRepository } from "@/data/repository";
import type {
  CandidateFilter,
  ListQuery,
  Restaurant,
  SaveRestaurantInput,
} from "@/domain/models";

import type { db as Database } from "./client";

/**
 * Drizzle + expo-sqlite実装 (docs/database/schema.md `restaurants`)。
 * ひな型段階のため未実装。実装時はcreate/find/list/update/setArchived/delete/pickCandidatesの
 * 順に、docs/testing/strategy.md #MVPで必ずカバーするケース に沿ってテストしながら埋める。
 */
export class SqliteRestaurantRepository implements RestaurantRepository {
  constructor(private readonly db: typeof Database) {}

  async create(_input: SaveRestaurantInput): Promise<Restaurant> {
    throw new Error("not implemented: SqliteRestaurantRepository.create");
  }

  async findById(_id: string): Promise<Restaurant | null> {
    throw new Error("not implemented: SqliteRestaurantRepository.findById");
  }

  async findByNormalizedUrl(_normalizedUrl: string): Promise<Restaurant | null> {
    throw new Error("not implemented: SqliteRestaurantRepository.findByNormalizedUrl");
  }

  async list(_query: ListQuery): Promise<Restaurant[]> {
    throw new Error("not implemented: SqliteRestaurantRepository.list");
  }

  async update(_id: string, _patch: Partial<Restaurant>): Promise<Restaurant> {
    throw new Error("not implemented: SqliteRestaurantRepository.update");
  }

  async setArchived(_id: string, _archived: boolean): Promise<void> {
    throw new Error("not implemented: SqliteRestaurantRepository.setArchived");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("not implemented: SqliteRestaurantRepository.delete");
  }

  async pickCandidates(_filter: CandidateFilter): Promise<Restaurant[]> {
    throw new Error("not implemented: SqliteRestaurantRepository.pickCandidates");
  }
}
