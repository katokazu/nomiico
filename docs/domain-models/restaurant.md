# 店舗（Restaurant）

## 意味

ユーザーが訪問したいかもしれない保存済みの場所。

このモデルは、網羅的な店舗マスタではなく、ユーザーが保存した候補を表す。

## 初期フィールド

- `id`
- `name`
- `source_url`
- `source_type`
- `genre`
- `area`
- `nearest_station`
- `address`
- `price_range`
- `desire_level`
- `visited`
- `visit_count`
- `archived`
- `created_at`
- `last_suggested_at`
- `last_visited_at`

## 補足

- メタデータ抽出に失敗しても `source_url` は保持する。
- メタデータ不足によって保存を妨げない。
- タグと訪問履歴は別モデルとして扱う。
