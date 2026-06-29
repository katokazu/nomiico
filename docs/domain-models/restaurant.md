# Restaurant

## Meaning

ユーザーが保存した「行きたい候補」。グローバルに完全な店舗マスタではなく、**ユーザー所有の候補レコード**である。

## Fields

永続化定義は [database/schema.md](../database/schema.md) `restaurants`、型は [repository-contract](../api/api-design.md) `Restaurant` を正とする。要点:

| 種別 | フィールド |
|---|---|
| 識別 | `id`, `owner_id` |
| 一次情報 | `name`(暫定可), `source_url`, `source_type`, `normalized_url` |
| 補完メタ | `thumbnail_url`, `genre`, `area`, `nearest_station`, `address`, `price_range`, `raw_metadata` |
| 状態 | `desire_level`(1..5), `visited`, `visit_count`, `archived` |
| 日時 | `created_at`, `updated_at`, `last_suggested_at`, `last_visited_at` |

## source_type

`instagram` / `googlemap` / `tabelog` / `line` / `web` / `screenshot` / `manual`。判定規則は [save-flow](../specs/save-flow.md)。

## Notes

- `source_url` はメタデータ取得失敗時も必ず保持する一次情報。
- メタデータ欠損は保存をブロックしない（正常系）。
- タグ・訪問履歴は別モデル（[tag](tag.md) / [visit](visit.md)）。
- `normalized_url` は重複判定キー（[save-flow](../specs/save-flow.md)）。
- アーカイブ済みは決定候補から除外（[database/schema.md](../database/schema.md)）。
