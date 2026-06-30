# 決定セッション（Decision Session）

## 意味

1人以上のユーザーが、どの飲食店に行くかを決めるための一時的なやり取り。

## 候補モード
1 人以上のユーザーがどの店に行くかを決める一時的なインタラクション。本プロダクトの中核価値であり、単なる分析ログではない。

## Modes

MVP 対象（同一端末で完結、[ADR 0005](../adr/0005-decision-engine-scope.md)）:

- `gacha`: 条件 → 重み付き抽選で 1 件提示
- `swipe`: カードを左右に振り分け最終候補集合を作る
- `roulette`: 絞った候補から 1 件をランダム確定
- `vote`（みんなで・投票制）: 1 台のスマホを回し 1 人 1 票。得票（`tally`）順で決定
- `ranking`（みんなで・順位制）: 各自が候補に順位＝点（上位 3/2/1 等）を付け、全員ぶんの合計（`tally`）が最大の店に決定

`vote` / `ranking` は招待リンク・アカウント・同期サーバー不要の**単一端末回し決め**で、サーバーを持たない MVP でも成立する（[home-and-decision-ux](../specs/home-and-decision-ux.md) §経路4、[ADR 0005](../adr/0005-decision-engine-scope.md) 改訂）。

将来（真の複数端末同期が必要、リモート導入後）:

- `draft`: 複数人が順番に候補を指名
- `tournament`: 二択トーナメント（単独実装も可だが MVP は見送り）

enum には将来モードも定義しておき、スキーマ変更なしで追加できるようにする。

## 候補データ

各セッションは、スコア（`score`）・順位（`rank`）・回し決め集計（`tally`）・swipe 結果を持つ複数の候補を持てる。

## Fields

永続化は [database/schema.md](../database/schema.md) `decision_sessions` / `decision_candidates`。

- セッション: `id`, `owner_id`, `mode`, `status`(active/completed/cancelled), `filters`(JSON), `participant_count`(vote/ranking のみ), `decided_restaurant_id`, `record_prompt_dismissed_at`, `created_at`, `completed_at`
- 候補: `id`, `session_id`, `restaurant_id`, `score`, `rank`, `swipe_result`(kept/rejected/pending), `tally`

## Notes

- 決定セッション（Decision Session）は単なる分析データではなく、プロダクトの中核価値の一部である。
- 回し決め（vote/ranking）は参加者個人の識別子を持たず、`tally` の集計のみ保持する。`participant_count` で進行（「3 / 4人目」）と完了を判定する。
- 候補抽出・スコアは [decide-flow](../specs/decide-flow.md) / [scoring](../specs/scoring.md)。
- アクティブセッションは同時 1 つ。中断後はアプリ再起動で復帰提示。
- 決定後の訪問記録は `visits.decision_session_id` で結ぶ（記録うながし・転換計測）。
- 真の複数端末同期を伴うグループ決定（draft/tournament）は単独・回し決め体験が固まった後に着手する。
