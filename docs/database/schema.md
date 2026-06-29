# データベーススキーマ案

## テーブル

初期候補となるテーブル:

- `restaurants`
- `tags`
- `restaurant_tags`
- `visits`
- `decision_sessions`
- `decision_candidates`

## 店舗データ

[../domain-models/restaurant.md](../domain-models/restaurant.md) を参照してください。

## 決定データ

[../domain-models/decision-session.md](../domain-models/decision-session.md) を参照してください。

## 未決事項

- ソースメタデータは構造化カラム、raw JSON、またはその両方のどれで保存するか。
- タグはユーザー定義、システム定義、または混在のどれにするか。
- アーカイブ済み候補を決定セッションでどう扱うか。
