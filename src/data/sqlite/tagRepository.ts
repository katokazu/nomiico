import { eq } from "drizzle-orm";

import type { TagRepository } from "@/data/repository";
import type { Tag, TagCategory } from "@/domain/models";

import type { db as Database } from "./client";
import { toTag } from "./mappers";
import { getOwnerId, type OwnerIdProvider } from "./ownerId";
import { restaurantTags, tags } from "./schema";
import { newId, nowIso } from "./util";

/** プリセットタグ (docs/domain-models/tag.md #Categories)。初回起動でシードする。 */
const SYSTEM_TAG_PRESETS: { category: TagCategory; name: string }[] = [
  { category: "situation", name: "家族" },
  { category: "situation", name: "デート" },
  { category: "situation", name: "接待" },
  { category: "situation", name: "友達" },
  { category: "situation", name: "一人" },
  { category: "atmosphere", name: "静か" },
  { category: "atmosphere", name: "カジュアル" },
  { category: "atmosphere", name: "高級" },
  { category: "atmosphere", name: "にぎやか" },
  { category: "feature", name: "個室" },
  { category: "feature", name: "駅近" },
  { category: "feature", name: "禁煙" },
  { category: "feature", name: "深夜営業" },
  { category: "food", name: "焼鳥" },
  { category: "food", name: "焼肉" },
  { category: "food", name: "寿司" },
  { category: "food", name: "ラーメン" },
  { category: "food", name: "イタリアン" },
  { category: "season", name: "春" },
  { category: "season", name: "夏" },
  { category: "season", name: "秋" },
  { category: "season", name: "冬" },
];

/** docs/database/schema.md `tags` / `restaurant_tags`。 */
export class SqliteTagRepository implements TagRepository {
  constructor(
    private readonly db: typeof Database,
    private readonly ownerId: OwnerIdProvider = getOwnerId,
  ) {}

  async listTags(): Promise<Tag[]> {
    const ownerId = await this.ownerId();
    const rows = await this.db.select().from(tags).where(eq(tags.ownerId, ownerId));
    return rows.map(toTag);
  }

  async createTag(name: string, category: TagCategory): Promise<Tag> {
    const ownerId = await this.ownerId();
    const [row] = await this.db
      .insert(tags)
      .values({ id: newId(), ownerId, name, category, createdAt: nowIso() })
      .returning();
    return toTag(row);
  }

  async setRestaurantTags(restaurantId: string, tagIds: string[]): Promise<void> {
    await this.db.delete(restaurantTags).where(eq(restaurantTags.restaurantId, restaurantId));
    if (tagIds.length === 0) {
      return;
    }
    await this.db
      .insert(restaurantTags)
      .values(tagIds.map((tagId) => ({ restaurantId, tagId })));
  }

  async seedSystemTags(): Promise<void> {
    const ownerId = await this.ownerId();
    const now = nowIso();
    for (const preset of SYSTEM_TAG_PRESETS) {
      await this.db
        .insert(tags)
        .values({
          id: newId(),
          ownerId,
          name: preset.name,
          category: preset.category,
          isSystem: 1,
          createdAt: now,
        })
        .onConflictDoNothing({
          target: [tags.ownerId, tags.category, tags.name],
        });
    }
  }
}
