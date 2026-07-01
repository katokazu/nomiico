import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";

import type { RestaurantRepository } from "@/data/repository";
import type {
  CandidateFilter,
  ListQuery,
  Restaurant,
  SaveRestaurantInput,
} from "@/domain/models";
import { normalizeUrl } from "@/domain/urlNormalize";

import type { db as Database } from "./client";
import { getOwnerId, type OwnerIdProvider } from "./ownerId";
import { restaurantTags, restaurants } from "./schema";
import { toRestaurant, toRestaurantsWithTags, toRestaurantWithTags } from "./mappers";
import { newId, nowIso } from "./util";

/**
 * Drizzle + expo-sqlite実装 (docs/database/schema.md `restaurants`)。
 */
export class SqliteRestaurantRepository implements RestaurantRepository {
  constructor(
    private readonly db: typeof Database,
    private readonly ownerId: OwnerIdProvider = getOwnerId,
  ) {}

  async create(input: SaveRestaurantInput): Promise<Restaurant> {
    const ownerId = await this.ownerId();
    const now = nowIso();
    const id = newId();

    const [row] = await this.db
      .insert(restaurants)
      .values({
        id,
        ownerId,
        name: input.name?.trim() || "名称未設定",
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType,
        normalizedUrl: safeNormalizeUrl(input.sourceUrl),
        desireLevel: input.desireLevel ?? 3,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return toRestaurant(row, []);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const ownerId = await this.ownerId();
    const [row] = await this.db
      .select()
      .from(restaurants)
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, ownerId)));
    if (!row) {
      return null;
    }
    return toRestaurantWithTags(this.db, row);
  }

  async findByNormalizedUrl(normalizedUrl: string): Promise<Restaurant | null> {
    const ownerId = await this.ownerId();
    const [row] = await this.db
      .select()
      .from(restaurants)
      .where(and(eq(restaurants.ownerId, ownerId), eq(restaurants.normalizedUrl, normalizedUrl)));
    if (!row) {
      return null;
    }
    return toRestaurantWithTags(this.db, row);
  }

  async list(query: ListQuery): Promise<Restaurant[]> {
    const ownerId = await this.ownerId();
    const conditions = [eq(restaurants.ownerId, ownerId)];
    if (!query.includeArchived) {
      conditions.push(eq(restaurants.archived, 0));
    }
    if (!query.includeVisited) {
      conditions.push(eq(restaurants.visited, 0));
    }
    if (query.tagIds && query.tagIds.length > 0) {
      conditions.push(inArray(restaurants.id, await this.restaurantIdsWithAnyTag(query.tagIds)));
    }

    const orderColumn =
      query.sortBy === "desireLevel"
        ? restaurants.desireLevel
        : query.sortBy === "lastVisitedAt"
          ? restaurants.lastVisitedAt
          : restaurants.createdAt;

    const rows = await this.db
      .select()
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(desc(orderColumn));

    return toRestaurantsWithTags(this.db, rows);
  }

  async update(id: string, patch: Partial<Restaurant>): Promise<Restaurant> {
    const ownerId = await this.ownerId();
    const values: Partial<typeof restaurants.$inferInsert> = { updatedAt: nowIso() };

    if (patch.name !== undefined) values.name = patch.name;
    if (patch.sourceUrl !== undefined) {
      values.sourceUrl = patch.sourceUrl;
      values.normalizedUrl = safeNormalizeUrl(patch.sourceUrl);
    }
    if (patch.thumbnailUrl !== undefined) values.thumbnailUrl = patch.thumbnailUrl;
    if (patch.genre !== undefined) values.genre = patch.genre;
    if (patch.area !== undefined) values.area = patch.area;
    if (patch.nearestStation !== undefined) values.nearestStation = patch.nearestStation;
    if (patch.address !== undefined) values.address = patch.address;
    if (patch.priceRange !== undefined) values.priceRange = patch.priceRange;
    if (patch.desireLevel !== undefined) values.desireLevel = patch.desireLevel;
    if (patch.visited !== undefined) values.visited = patch.visited ? 1 : 0;
    if (patch.visitCount !== undefined) values.visitCount = patch.visitCount;
    if (patch.archived !== undefined) values.archived = patch.archived ? 1 : 0;
    if (patch.lastSuggestedAt !== undefined) values.lastSuggestedAt = patch.lastSuggestedAt;
    if (patch.lastVisitedAt !== undefined) values.lastVisitedAt = patch.lastVisitedAt;

    await this.db
      .update(restaurants)
      .set(values)
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, ownerId)));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`restaurant not found: ${id}`);
    }
    return updated;
  }

  async setArchived(id: string, archived: boolean): Promise<void> {
    const ownerId = await this.ownerId();
    await this.db
      .update(restaurants)
      .set({ archived: archived ? 1 : 0, updatedAt: nowIso() })
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, ownerId)));
  }

  async delete(id: string): Promise<void> {
    const ownerId = await this.ownerId();
    await this.db
      .delete(restaurants)
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, ownerId)));
  }

  async pickCandidates(filter: CandidateFilter): Promise<Restaurant[]> {
    const ownerId = await this.ownerId();
    const conditions = [eq(restaurants.ownerId, ownerId), eq(restaurants.archived, 0)];
    if (!filter.includeVisited) {
      conditions.push(eq(restaurants.visited, 0));
    }
    if (filter.area) {
      conditions.push(eq(restaurants.area, filter.area));
    }
    if (filter.genre) {
      conditions.push(eq(restaurants.genre, filter.genre));
    }
    if (filter.budgetMax !== undefined) {
      // price_rangeは自由文字列(例"3000円")のため先頭の数値をベストエフォートで抽出する
      // (SQLiteのCASTは先頭の数値以外を無視する)。未入力/数値化できない場合は除外しない
      // (メタデータ欠損を通常ケースとして扱う)。
      conditions.push(
        or(
          isNull(restaurants.priceRange),
          sql`CAST(${restaurants.priceRange} AS INTEGER) <= ${filter.budgetMax}`,
        )!,
      );
    }
    if (filter.tagIds && filter.tagIds.length > 0) {
      conditions.push(inArray(restaurants.id, await this.restaurantIdsWithAnyTag(filter.tagIds)));
    }

    const rows = await this.db
      .select()
      .from(restaurants)
      .where(and(...conditions));

    return toRestaurantsWithTags(this.db, rows);
  }

  private async restaurantIdsWithAnyTag(tagIds: string[]): Promise<string[]> {
    const rows = await this.db
      .select({ restaurantId: restaurantTags.restaurantId })
      .from(restaurantTags)
      .where(inArray(restaurantTags.tagId, tagIds));
    return [...new Set(rows.map((row) => row.restaurantId))];
  }
}

function safeNormalizeUrl(sourceUrl: string | undefined): string | undefined {
  if (!sourceUrl) {
    return undefined;
  }
  try {
    return normalizeUrl(sourceUrl);
  } catch {
    return undefined;
  }
}
