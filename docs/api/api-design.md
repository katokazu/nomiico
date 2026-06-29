# API設計案

## 状況

API実装はまだありません。

## 候補リソース

- 店舗（Restaurants）
- タグ（Tags）
- 訪問（Visits）
- 決定セッション（Decision sessions）
- 決定候補（Decision candidates）

## 設計原則

- 保存は部分的なデータでも許容する。
- 決定系エンドポイントは、すぐに役立つ候補を返す。
- APIでは、ユーザー自身の保存レコードと外部の店舗データを区別する。

## 未決事項

- REST、RPC、GraphQL、またはフレームワークネイティブのアクションのどれにするか。
- メタデータ抽出は同期処理にするか非同期処理にするか。
- MVPの決定スコアリングはサーバー側とクライアント側のどちらで行うか。
# Repository / Data-Access Contract

MVP はサーバーを持たない（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）。したがって「API」は HTTP エンドポイントではなく、アプリ内の **Repository インターフェース**である。これがアプリ層と永続化層の唯一の境界であり、将来リモート（Supabase）を差し込む同期シームでもある。

将来 HTTP API を導入する場合も、このインターフェースのメソッド群がそのまま endpoint 設計の土台になる。

## 原則

- 保存は部分データを許容する（メタデータ欠損で失敗しない）。
- 決定系メソッドは即座に有用な候補を返す。
- すべてのメソッドは `owner_id` スコープ内で動作する（呼び出し側は現在の owner を暗黙に持つ）。
- 戻り値は Promise。実装は同期 SQLite でもインターフェースは非同期に統一（将来のリモート実装と一致させる）。
- 型はドメインモデル（[domain-models](../domain-models/INDEX.md)）に対応。

## 型（概略）

```ts
type SourceType =
  | 'instagram' | 'googlemap' | 'tabelog' | 'line' | 'web' | 'screenshot' | 'manual';

type DecisionMode = 'gacha' | 'swipe' | 'roulette' | 'draft' | 'vote' | 'tournament';
type SessionStatus = 'active' | 'completed' | 'cancelled';
type SwipeResult = 'kept' | 'rejected' | 'pending';

interface Restaurant {
  id: string;
  name: string;
  sourceUrl?: string;
  sourceType: SourceType;
  thumbnailUrl?: string;
  genre?: string;
  area?: string;
  nearestStation?: string;
  address?: string;
  priceRange?: string;
  desireLevel: number;      // 1..5
  visited: boolean;
  visitCount: number;
  archived: boolean;
  tags: Tag[];
  createdAt: string;        // UTC ISO8601
  updatedAt: string;
  lastSuggestedAt?: string;
  lastVisitedAt?: string;
}

interface CandidateFilter {
  area?: string;
  genre?: string;
  people?: number;
  scene?: string;
  budgetMax?: number;
  tagIds?: string[];
  includeVisited?: boolean;  // 既定 false
}
```

## RestaurantRepository

| メソッド | 用途 |
|---|---|
| `create(input: SaveRestaurantInput): Promise<Restaurant>` | 保存（部分データ可、重複は呼出側が事前判定 or 返り値で通知） |
| `findById(id): Promise<Restaurant \| null>` | 詳細取得 |
| `findByNormalizedUrl(url): Promise<Restaurant \| null>` | 重複判定 |
| `list(query: ListQuery): Promise<Restaurant[]>` | 一覧（フィルタ/並び替え/ページング） |
| `update(id, patch): Promise<Restaurant>` | 部分更新（手動補完・行きたい度変更等） |
| `setArchived(id, archived): Promise<void>` | アーカイブ切替 |
| `delete(id): Promise<void>` | 物理削除（明示操作のみ） |
| `pickCandidates(filter: CandidateFilter): Promise<Restaurant[]>` | 決定用の候補集合（archived/visited 除外既定） |

## TagRepository

| メソッド | 用途 |
|---|---|
| `listTags(): Promise<Tag[]>` | 全タグ（system + user） |
| `createTag(name, category): Promise<Tag>` | ユーザータグ追加 |
| `setRestaurantTags(restaurantId, tagIds): Promise<void>` | 付け替え |
| `seedSystemTags(): Promise<void>` | 初回プリセット投入 |

## VisitRepository

| メソッド | 用途 |
|---|---|
| `addVisit(input: AddVisitInput): Promise<Visit>` | 訪問記録追加（restaurants.visited/visit_count/last_visited_at も更新） |
| `listByRestaurant(restaurantId): Promise<Visit[]>` | 履歴 |
| `updateVisit(id, patch): Promise<Visit>` | 後から評価・メモ追記 |

## ImportRepository

CSV 一括取り込み（[csv-import](../specs/csv-import.md)）。MVP 直後の初期拡張。

| メソッド | 用途 |
|---|---|
| `parseCsv(file): Promise<ParsedRow[]>` | CSV 解析（BOM/引用対応）と列推定 |
| `importBatch(rows, mapping): Promise<ImportResult>` | 列マッピング適用 → 重複判定 → チャンク INSERT。`{ batchId, created, skipped, failed }` |
| `undoBatch(batchId): Promise<void>` | バッチで新規作成した行のみ削除 |

OGP 補完は同期では行わず、作成行を遅延補完キューへ積む（[save-flow](../specs/save-flow.md) の OGP 経路を再利用）。

## DecisionRepository

| メソッド | 用途 |
|---|---|
| `startSession(mode, filter): Promise<DecisionSession>` | セッション開始（候補をスナップショット保存） |
| `getSession(id): Promise<DecisionSession>` | 取得 |
| `recordSwipe(sessionId, restaurantId, result): Promise<void>` | swipe 結果記録 |
| `keptCandidates(sessionId): Promise<Restaurant[]>` | swipe で残った最終候補集合 |
| `complete(sessionId, decidedRestaurantId): Promise<void>` | 決定確定（restaurants.last_suggested_at 更新） |
| `cancel(sessionId): Promise<void>` | 中断 |

## アプリ層サービス（Repository の上）

Repository を組み合わせる純粋ロジック。ストレージ非依存でテスト可能（[implementation-patterns](../patterns/implementation-patterns.md)）。

- `saveService.saveFromUrl(url, sourceTypeHint?)`: URL 正規化 → 重複判定 → OGP 取得 → `Restaurant` 生成 → `create`。
- `decisionEngine.draw(filter)`: `pickCandidates` → 重み付き抽選 1 件（[scoring](../specs/scoring.md)）。
- `scoring.scoreCandidates(restaurants, context)`: 「今行くべきスコア」算出。
- `resurfacing.scheduleReminders()`: ローカル通知の再スケジュール（[resurfacing](../specs/resurfacing.md)）。

## Open Questions（解消済み）

- ~~REST / RPC / GraphQL / framework-native か~~ → **MVP は HTTP API なし**。アプリ内 Repository インターフェース。将来リモート化時に再検討。
- ~~メタデータ抽出は同期 / 非同期か~~ → **非同期**。保存は即時完了し、OGP 取得はバックグラウンドで後追い更新（[save-flow](../specs/save-flow.md)）。
- ~~スコアリングはサーバー / クライアントか~~ → **クライアント（端末内同期処理）**。
