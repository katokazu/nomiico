# 決定セッション（Decision Session）

## 意味

1人以上のユーザーが、どの飲食店に行くかを決めるための一時的なやり取り。

## 候補モード

- `gacha`
- `swipe`
- `draft`
- `vote`
- `tournament`
- `roulette`

## 初期フィールド

- `id`
- `mode`
- `status`
- `decided_restaurant_id`
- `created_at`
- `completed_at`

## 候補データ

各セッションは、スコアと順位を持つ複数の候補を持てる。

## 補足

- 決定セッション（Decision Session）は単なる分析データではなく、プロダクトの中核価値の一部である。
- 複数人で決める機能は、1人で決める体験が十分に機能してからでもよい。
