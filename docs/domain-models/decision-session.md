# 決定セッション（Decision Session）

## 意味

1人以上のユーザーが、どの飲食店に行くかを決めるための一時的なやり取り。

## 候補モード
1 人以上のユーザーがどの店に行くかを決める一時的なインタラクション。本プロダクトの中核価値であり、単なる分析ログではない。

## Modes

MVP 対象（単独・同一端末、[ADR 0005](../adr/0005-decision-engine-scope.md)）:

## 初期フィールド
- `gacha`: 条件 → 重み付き抽選で 1 件提示
- `swipe`: カードを左右に振り分け最終候補集合を作る
- `roulette`: 絞った候補から 1 件をランダム確定

将来（リモート導入後）:

## 候補データ

各セッションは、スコアと順位を持つ複数の候補を持てる。

## 補足

- 決定セッション（Decision Session）は単なる分析データではなく、プロダクトの中核価値の一部である。
- 複数人で決める機能は、1人で決める体験が十分に機能してからでもよい。
- `draft` / `vote` / `tournament`: 複数人・複数端末の同期が必要

enum には将来モードも定義しておき、スキーマ変更なしで追加できるようにする。

## Fields

永続化は [database/schema.md](../database/schema.md) `decision_sessions` / `decision_candidates`。

- セッション: `id`, `owner_id`, `mode`, `status`(active/completed/cancelled), `filters`(JSON), `decided_restaurant_id`, `created_at`, `completed_at`
- 候補: `id`, `session_id`, `restaurant_id`, `score`, `rank`, `swipe_result`(kept/rejected/pending)

## Notes

- 候補抽出・スコアは [decide-flow](../specs/decide-flow.md) / [scoring](../specs/scoring.md)。
- アクティブセッションは同時 1 つ。中断後はアプリ再起動で復帰提示。
- グループ決定は単独決定体験が固まった後に着手する。
