# Visit

## Meaning

訪問の記録。1 店舗に複数訪問が紐づく。記録は「思い出として自然に残る」設計で、最初は星評価だけでも成立する（[product-overview](../domain/product-overview.md) §4）。

## Fields

[database/schema.md](../database/schema.md) `visits`。`id`, `owner_id`, `restaurant_id`, `decision_session_id`(任意), `visited_at`, `rating`(1..5), `memo`, `companion`, `revisit`, `photo_uri`, `created_at`。

## Notes

- `rating` 以外はすべて任意。後から追記できる（[user-flows](../specs/user-flows.md) post-visit）。
- 訪問追加時に `restaurants.visited` / `visit_count` / `last_visited_at` を更新する（[repository-contract](../api/api-design.md) `addVisit`）。
- `revisit` は **3 値 enum**（`yes`=また行きたい / `meh`=うーん / `no`=もういい）。記録画面の3セグメント（[mockups/home-flow.html](../../mockups/home-flow.html)）に対応。将来のスコア・再浮上判断に活用余地。`no` はアーカイブ提案のトリガにできる。
- `photo_uri` はユーザー撮影/添付写真のローカル URI。思い出カードのヒーロー画像（[mockups/saved-record-skip.html](../../mockups/saved-record-skip.html) 記録タブ）。MVP は 1 訪問 1 枚。店舗の `thumbnail_url`（OGP）とは別物。
- `decision_session_id` は決定セッションから記録した訪問を結ぶ。記録うながし（決定→未記録）検出と「決めて→行った」の転換計測に使う。手動記録では NULL。
