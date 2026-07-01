/**
 * ドメイン型定義。
 *
 * 参照元:
 * - docs/api/api-design.md (Repository契約の型)
 * - docs/database/schema.md (永続化スキーマ)
 * - docs/domain-models/*.md
 *
 * TS層はcamelCase、DB層(snake_case)との変換はdata/sqlite層の境界で行う
 * (docs/standards/coding.md)。
 */

export type SourceType =
  | "instagram"
  | "googlemap"
  | "tabelog"
  | "line"
  | "web"
  | "screenshot"
  | "manual";

// MVP: gacha/swipe/roulette + 単一端末回し決め vote/ranking。draft/tournamentは将来
// (docs/adr/0005-decision-engine-scope.md)。
export type DecisionMode =
  | "gacha"
  | "swipe"
  | "roulette"
  | "vote"
  | "ranking"
  | "draft"
  | "tournament";

export type SessionStatus = "active" | "completed" | "cancelled";
export type SwipeResult = "kept" | "rejected" | "pending";
export type Revisit = "yes" | "meh" | "no"; // また行きたい / うーん / もういい
export type NotifPermission = "unasked" | "granted" | "denied" | "deferred";
export type TagCategory = "situation" | "atmosphere" | "feature" | "food" | "season";

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  isSystem: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  sourceUrl?: string;
  sourceType: SourceType;
  normalizedUrl?: string;
  thumbnailUrl?: string;
  genre?: string;
  area?: string;
  nearestStation?: string;
  address?: string;
  priceRange?: string;
  desireLevel: number; // 1..5
  visited: boolean;
  visitCount: number;
  archived: boolean;
  tags: Tag[];
  createdAt: string; // UTC ISO8601
  updatedAt: string;
  lastSuggestedAt?: string;
  lastVisitedAt?: string;
}

/** 保存時の入力。メタデータ欠損を通常ケースとして扱う (docs/specs/save-flow.md)。 */
export interface SaveRestaurantInput {
  name?: string; // URLありは暫定名を生成できるため任意、手動保存は必須(呼出側で検証)
  sourceUrl?: string;
  sourceType: SourceType;
  desireLevel?: number; // 既定3
}

export interface ListQuery {
  includeArchived?: boolean; // 既定false
  includeVisited?: boolean; // 既定false
  tagIds?: string[];
  sortBy?: "createdAt" | "desireLevel" | "lastVisitedAt";
}

export interface CandidateFilter {
  area?: string;
  genre?: string;
  people?: number;
  scene?: string;
  budgetMax?: number;
  tagIds?: string[];
  includeVisited?: boolean; // 既定false
}

export interface Visit {
  id: string;
  restaurantId: string;
  decisionSessionId?: string; // 決定セッションから記録した場合
  visitedAt: string; // UTC ISO8601
  rating?: number; // 1..5
  memo?: string;
  companion?: string;
  revisit?: Revisit;
  photoUri?: string; // ローカル写真URI(MVP 1枚)
  createdAt: string;
}

export interface AddVisitInput {
  restaurantId: string;
  decisionSessionId?: string;
  visitedAt?: string; // 省略時は現在時刻
  rating?: number;
  memo?: string;
  companion?: string;
  revisit?: Revisit;
  photoUri?: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  notifyTimes?: string[]; // 例 ["11:00","17:00"]
  notifyMaxPerDay: number; // 既定1
  resurfaceAfterDays: number; // 既定90
  notifPermissionStatus: NotifPermission;
}

export interface DecisionCandidate {
  id: string;
  sessionId: string;
  restaurantId: string;
  score?: number; // 「今行くべき」スコア (docs/specs/scoring.md)
  rank?: number;
  swipeResult?: SwipeResult;
  tally: number; // vote/rankingの集計値
}

export interface DecisionSession {
  id: string;
  mode: DecisionMode;
  status: SessionStatus;
  filters?: CandidateFilter;
  participantCount?: number; // vote/rankingのみ
  decidedRestaurantId?: string;
  recordPromptDismissedAt?: string;
  createdAt: string;
  completedAt?: string;
  candidates: DecisionCandidate[];
}

export interface StartSessionOptions {
  participantCount?: number; // vote/ranking用
}

export interface ImportBatch {
  id: string;
  sourceLabel?: string;
  fileName?: string;
  createdCount: number;
  skippedCount: number;
  createdAt: string;
}

export interface ParsedRow {
  raw: Record<string, string>;
}

export interface ImportResult {
  batchId: string;
  created: number;
  skipped: number;
  failed: number;
}
