# データベーススキーマ案

対象: 端末ローカル SQLite（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）。ORM は Drizzle。将来の Postgres / Supabase 移行を見据え、型・命名は両対応で素直なものにする。

## 設計方針

- 全ユーザーデータ行に `owner_id` を持たせる（[ADR 0003](../adr/0003-anonymous-auth-upgrade.md)）。MVP では単一ローカルユーザーだが、将来の同期で所有境界を壊さないため最初から付与する。
- ID は UUID v4 文字列（`TEXT`）。SQLite に自然で、リモート同期時に衝突しない。
- 日時は **UTC の ISO8601 文字列**（`TEXT`）で統一保存し、表示時にローカルへ変換する。
- メタデータは「構造化カラム + 生データ JSON」の両方を持つ（open question への回答）。構造化カラムは検索・フィルタ用、`raw_metadata` は OGP の生取得結果を将来再解析できるよう保全する。
- 真偽値は SQLite に boolean が無いため `INTEGER`（0/1）。

## 命名 / 規約

- テーブル: snake_case 複数形。カラム: snake_case。
- 外部キーは `<entity>_id`。
- ソフトデリートは使わず、`archived`（店舗）/ セッション `status` で状態を表現する。

## テーブル

初期候補となるテーブル:
### app_user

ローカル匿名ユーザー（通常 1 行）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | owner_id（UUID） |
| display_name | TEXT | NULL可 | 任意の表示名 |
| created_at | TEXT | NOT NULL | 生成日時(UTC ISO8601) |
| remote_user_id | TEXT | NULL可 | 将来のリモート ID（昇格時にマッピング） |

### restaurants

ユーザーが保存した「行きたい候補」。完全な店舗マスタではない（[restaurant model](../domain-models/restaurant.md)）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| owner_id | TEXT | NOT NULL, FK app_user.id | 所有者 |
| name | TEXT | NOT NULL | 店名（未取得時は仮名 or URL ホスト名で暫定） |
| source_url | TEXT | NULL可 | 連携元 URL（手動登録時は NULL 可） |
| source_type | TEXT | NOT NULL | enum: `instagram`/`googlemap`/`tabelog`/`line`/`web`/`screenshot`/`manual` |
| normalized_url | TEXT | NULL可 | 重複判定用に正規化した URL |
| thumbnail_url | TEXT | NULL可 | og:image 等 |
| genre | TEXT | NULL可 | ジャンル |
| area | TEXT | NULL可 | エリア（文字列） |
| nearest_station | TEXT | NULL可 | 最寄駅 |
| address | TEXT | NULL可 | 住所 |
| price_range | TEXT | NULL可 | 価格帯（文字列、例 "3000円") |
| desire_level | INTEGER | NOT NULL, default 3 | 行きたい度 1..5 |
| visited | INTEGER | NOT NULL, default 0 | 0/1 |
| visit_count | INTEGER | NOT NULL, default 0 | 訪問回数 |
| archived | INTEGER | NOT NULL, default 0 | 0/1 |
| raw_metadata | TEXT | NULL可 | OGP 生取得結果 / インポート補助情報(JSON 文字列) |
| import_batch_id | TEXT | NULL可, FK import_batches.id ON DELETE SET NULL | CSV 取り込み元（[csv-import](../specs/csv-import.md)、Undo 用） |
| created_at | TEXT | NOT NULL | 保存日時(UTC) |
| updated_at | TEXT | NOT NULL | 更新日時(UTC) |
| last_suggested_at | TEXT | NULL可 | 最後に提案した日時 |
| last_visited_at | TEXT | NULL可 | 最終訪問日時 |

インデックス:

- `idx_restaurants_owner` (owner_id)
- `idx_restaurants_owner_archived_visited` (owner_id, archived, visited) — 候補抽出の主クエリ用
- `idx_restaurants_normalized_url` (owner_id, normalized_url) — 重複判定用

### tags

システム定義 + ユーザー定義の混在（open question への回答）。プリセットはシードで投入し、`is_system` で区別。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| owner_id | TEXT | NOT NULL, FK | 所有者（システムタグも owner にコピー or owner_id を特別値にする。MVP では owner ごとに複製） |
| name | TEXT | NOT NULL | タグ名 |
| category | TEXT | NOT NULL | enum: `situation`/`atmosphere`/`feature`/`food`/`season` |
| is_system | INTEGER | NOT NULL, default 0 | プリセットか |
| created_at | TEXT | NOT NULL | |

制約: UNIQUE (owner_id, category, name)

### restaurant_tags

多対多。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| restaurant_id | TEXT | NOT NULL, FK restaurants.id ON DELETE CASCADE | |
| tag_id | TEXT | NOT NULL, FK tags.id ON DELETE CASCADE | |

PK (restaurant_id, tag_id)。インデックス `idx_restaurant_tags_tag` (tag_id)。

### visits

訪問記録（[visit model](../domain-models/visit.md)）。1 店舗に複数訪問。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| owner_id | TEXT | NOT NULL, FK | |
| restaurant_id | TEXT | NOT NULL, FK restaurants.id ON DELETE CASCADE | |
| visited_at | TEXT | NOT NULL | 訪問日時(UTC) |
| rating | INTEGER | NULL可 | 1..5 |
| memo | TEXT | NULL可 | |
| companion | TEXT | NULL可 | 同行者 |
| revisit | INTEGER | NULL可 | 0/1 また行きたいか |
| created_at | TEXT | NOT NULL | |

インデックス `idx_visits_restaurant` (restaurant_id)。

### import_batches

CSV 一括取り込みの単位（[csv-import](../specs/csv-import.md)）。Undo（取り込み取り消し）の境界。MVP 直後の初期拡張で追加。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| owner_id | TEXT | NOT NULL, FK | |
| source_label | TEXT | NULL可 | 取り込み元種別（例 `google_takeout`） |
| file_name | TEXT | NULL可 | 取り込んだファイル名 |
| created_count | INTEGER | NOT NULL, default 0 | 新規作成件数 |
| skipped_count | INTEGER | NOT NULL, default 0 | 重複等スキップ件数 |
| created_at | TEXT | NOT NULL | |

インデックス `idx_import_batches_owner` (owner_id)。Undo は `restaurants.import_batch_id = ?` の新規行を削除。

### decision_sessions

決定セッション（[decision-session model](../domain-models/decision-session.md)、[ADR 0005](../adr/0005-decision-engine-scope.md)）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| owner_id | TEXT | NOT NULL, FK | |
| mode | TEXT | NOT NULL | enum: `gacha`/`swipe`/`roulette`/`draft`/`vote`/`tournament`（後 3 つは将来） |
| status | TEXT | NOT NULL | enum: `active`/`completed`/`cancelled` |
| filters | TEXT | NULL可 | 適用フィルタ(JSON: area/genre/people/scene/budget/tags) |
| decided_restaurant_id | TEXT | NULL可, FK restaurants.id | 決定した店 |
| created_at | TEXT | NOT NULL | |
| completed_at | TEXT | NULL可 | |

インデックス `idx_sessions_owner_status` (owner_id, status)。

### decision_candidates

セッション内の候補とスワイプ結果。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | TEXT | PK | UUID |
| session_id | TEXT | NOT NULL, FK decision_sessions.id ON DELETE CASCADE | |
| restaurant_id | TEXT | NOT NULL, FK restaurants.id ON DELETE CASCADE | |
| score | INTEGER | NULL可 | スコア（[scoring](../specs/scoring.md)） |
| rank | INTEGER | NULL可 | 順位 |
| swipe_result | TEXT | NULL可 | enum: `kept`/`rejected`/`pending`（swipe モード用） |

## 店舗データ

[../domain-models/restaurant.md](../domain-models/restaurant.md) を参照してください。

## 決定データ

[../domain-models/decision-session.md](../domain-models/decision-session.md) を参照してください。

## 未決事項

- ソースメタデータは構造化カラム、raw JSON、またはその両方のどれで保存するか。
- タグはユーザー定義、システム定義、または混在のどれにするか。
- アーカイブ済み候補を決定セッションでどう扱うか。
インデックス `idx_candidates_session` (session_id)。

## 削除規則

- 店舗削除は物理削除（CASCADE で tags 関連・visits・candidates も削除）。ただし UI からの通常操作は `archived=1` を優先し、物理削除は明示操作のみ。
- アーカイブ済み店舗は決定セッションの候補抽出から除外する（open question への回答）。

## マイグレーション

- Drizzle のマイグレーションファイルで管理。スキーマ変更は必ずマイグレーションを追加。
- アプリ起動時に未適用マイグレーションを実行し、初回はプリセットタグをシードする。

## Open Questions（解消済み）

- ~~ソースメタデータは構造化 / JSON / 両方か~~ → **両方**（構造化カラム + `raw_metadata`）。
- ~~タグはユーザー定義 / システム定義 / 混在か~~ → **混在**（`is_system`）。
- ~~アーカイブ済み候補は決定セッションへどう影響するか~~ → **候補抽出から除外**。
