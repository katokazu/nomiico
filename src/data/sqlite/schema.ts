import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Drizzleスキーマ (docs/database/schema.md)。
 *
 * 規約:
 * - 全ユーザーデータ行にowner_id (docs/adr/0003-anonymous-auth-upgrade.md)。
 * - IDはUUID v4文字列(TEXT)。
 * - 日時はUTC ISO8601文字列(TEXT)。
 * - 真偽値はINTEGER(0/1)。
 */

export const appUser = sqliteTable("app_user", {
  id: text("id").primaryKey(),
  displayName: text("display_name"),
  createdAt: text("created_at").notNull(),
  remoteUserId: text("remote_user_id"),
});

export const userSettings = sqliteTable("user_settings", {
  ownerId: text("owner_id")
    .primaryKey()
    .references(() => appUser.id),
  notificationsEnabled: integer("notifications_enabled").notNull().default(1),
  notifyTimes: text("notify_times"), // JSON配列 例 ["11:00","17:00"]
  notifyMaxPerDay: integer("notify_max_per_day").notNull().default(1),
  resurfaceAfterDays: integer("resurface_after_days").notNull().default(90),
  notifPermissionStatus: text("notif_permission_status").notNull().default("unasked"),
  updatedAt: text("updated_at").notNull(),
});

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => appUser.id),
    sourceLabel: text("source_label"),
    fileName: text("file_name"),
    createdCount: integer("created_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_import_batches_owner").on(table.ownerId)],
);

export const restaurants = sqliteTable(
  "restaurants",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => appUser.id),
    name: text("name").notNull(),
    sourceUrl: text("source_url"),
    sourceType: text("source_type").notNull(),
    normalizedUrl: text("normalized_url"),
    thumbnailUrl: text("thumbnail_url"),
    genre: text("genre"),
    area: text("area"),
    nearestStation: text("nearest_station"),
    address: text("address"),
    priceRange: text("price_range"),
    desireLevel: integer("desire_level").notNull().default(3),
    visited: integer("visited").notNull().default(0),
    visitCount: integer("visit_count").notNull().default(0),
    archived: integer("archived").notNull().default(0),
    rawMetadata: text("raw_metadata"), // OGP生取得結果(JSON文字列)
    importBatchId: text("import_batch_id").references(() => importBatches.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    lastSuggestedAt: text("last_suggested_at"),
    lastVisitedAt: text("last_visited_at"),
  },
  (table) => [
    index("idx_restaurants_owner").on(table.ownerId),
    index("idx_restaurants_owner_archived_visited").on(
      table.ownerId,
      table.archived,
      table.visited,
    ),
    index("idx_restaurants_normalized_url").on(table.ownerId, table.normalizedUrl),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => appUser.id),
    name: text("name").notNull(),
    category: text("category").notNull(),
    isSystem: integer("is_system").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("uq_tags_owner_category_name").on(table.ownerId, table.category, table.name)],
);

export const restaurantTags = sqliteTable(
  "restaurant_tags",
  {
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.restaurantId, table.tagId] }),
    index("idx_restaurant_tags_tag").on(table.tagId),
  ],
);

export const decisionSessions = sqliteTable(
  "decision_sessions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => appUser.id),
    mode: text("mode").notNull(),
    status: text("status").notNull(),
    filters: text("filters"), // JSON: area/genre/people/scene/budget/tagIds
    participantCount: integer("participant_count"),
    decidedRestaurantId: text("decided_restaurant_id").references(() => restaurants.id),
    recordPromptDismissedAt: text("record_prompt_dismissed_at"),
    createdAt: text("created_at").notNull(),
    completedAt: text("completed_at"),
  },
  (table) => [index("idx_sessions_owner_status").on(table.ownerId, table.status)],
);

export const decisionCandidates = sqliteTable(
  "decision_candidates",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => decisionSessions.id, { onDelete: "cascade" }),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    score: integer("score"),
    rank: integer("rank"),
    swipeResult: text("swipe_result"),
    tally: integer("tally").notNull().default(0),
  },
  (table) => [index("idx_candidates_session").on(table.sessionId)],
);

export const visits = sqliteTable(
  "visits",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => appUser.id),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    decisionSessionId: text("decision_session_id").references(() => decisionSessions.id, {
      onDelete: "set null",
    }),
    visitedAt: text("visited_at").notNull(),
    rating: integer("rating"),
    memo: text("memo"),
    companion: text("companion"),
    revisit: text("revisit"),
    photoUri: text("photo_uri"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_visits_restaurant").on(table.restaurantId),
    index("idx_visits_session").on(table.decisionSessionId),
  ],
);
