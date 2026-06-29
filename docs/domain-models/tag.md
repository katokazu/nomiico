# Tag

## Meaning

候補の絞り込み・文脈一致に使う分類ラベル。システム定義のプリセットとユーザー定義の混在（[database/schema.md](../database/schema.md)）。

## Categories

| category | 例 |
|---|---|
| `situation` | 家族 / デート / 接待 / 友達 / 一人 |
| `atmosphere` | 静か / カジュアル / 高級 / にぎやか |
| `feature` | 個室 / 駅近 / 禁煙 / 深夜営業 |
| `food` | 焼鳥 / 焼肉 / 寿司 / ラーメン / イタリアン |
| `season` | 春 / 夏 / 秋 / 冬 |

## Fields

[database/schema.md](../database/schema.md) `tags` / `restaurant_tags`。`id`, `owner_id`, `name`, `category`, `is_system`。

## Notes

- プリセットは初回起動でシード（`is_system = 1`）。
- ユーザー追加タグは `(owner_id, category, name)` で一意。
- タグ付けは任意。保存をブロックしない（[product-overview](../domain/product-overview.md) §3）。
- `season` / `situation` は [scoring](../specs/scoring.md) の文脈一致に使う。
