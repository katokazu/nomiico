# Visit

## Meaning

訪問の記録。1 店舗に複数訪問が紐づく。記録は「思い出として自然に残る」設計で、最初は星評価だけでも成立する（[product-overview](../domain/product-overview.md) §4）。

## Fields

[database/schema.md](../database/schema.md) `visits`。`id`, `owner_id`, `restaurant_id`, `visited_at`, `rating`(1..5), `memo`, `companion`, `revisit`, `created_at`。

## Notes

- `rating` 以外はすべて任意。後から追記できる（[user-flows](../specs/user-flows.md) post-visit）。
- 訪問追加時に `restaurants.visited` / `visit_count` / `last_visited_at` を更新する（[repository-contract](../api/api-design.md) `addVisit`）。
- `revisit`（また行きたいか）は将来のスコア・再浮上判断に活用余地。
