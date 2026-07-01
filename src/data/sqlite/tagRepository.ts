import type { TagRepository } from "@/data/repository";
import type { Tag, TagCategory } from "@/domain/models";

import type { db as Database } from "./client";

/** docs/database/schema.md `tags` / `restaurant_tags`。ひな型段階のため未実装。 */
export class SqliteTagRepository implements TagRepository {
  constructor(private readonly db: typeof Database) {}

  async listTags(): Promise<Tag[]> {
    throw new Error("not implemented: SqliteTagRepository.listTags");
  }

  async createTag(_name: string, _category: TagCategory): Promise<Tag> {
    throw new Error("not implemented: SqliteTagRepository.createTag");
  }

  async setRestaurantTags(_restaurantId: string, _tagIds: string[]): Promise<void> {
    throw new Error("not implemented: SqliteTagRepository.setRestaurantTags");
  }

  async seedSystemTags(): Promise<void> {
    throw new Error("not implemented: SqliteTagRepository.seedSystemTags");
  }
}
