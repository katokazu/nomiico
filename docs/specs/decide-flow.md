# 決定フロー (Decide Flow)

関連: [ADR 0005](../adr/0005-decision-engine-scope.md) / [scoring](scoring.md) / [decision-session model](../domain-models/decision-session.md)。

## Goal

保存済み候補から「今日どこに行くか」を 1 件に確定する。MVP は単独利用の gacha / swipe / roulette（[ADR 0005](../adr/0005-decision-engine-scope.md)）。

## Non-Goals

- グループ決定（draft / vote / tournament）。リモート導入後。
- 検索・一覧管理を主役にすること。

## 共通: 候補抽出

全モードの起点は `pickCandidates(filter)`（[repository-contract](../api/api-design.md)）。

- 既定で `archived = 1` と `visited = 1` を除外（フィルタ `includeVisited` で訪問済みも対象化可能）。
- フィルタ条件（任意・AND）: `area` / `genre` / `people` / `scene` / `budgetMax` / `tagIds`。
- 候補ゼロ時のフォールバック（後述 Edge Cases）。

## モード 1: ガチャ (gacha)

### UX

```text
条件: エリア / ジャンル / 人数 / シーン / 予算   ← すべて任意
[決める]
  ↓
結果カード
〇〇酒場 / 徒歩8分(*) / 保存から143日 / 行きたい度★★★★★
理由: 友達タグ・しばらく出ていない候補
[ここにする]   [もう一回]
```
(*) 距離は座標が無い MVP では非表示 or 「最寄駅」表示（[ADR 0004](../adr/0004-metadata-extraction-strategy.md)）。

### ロジック

1. `pickCandidates(filter)` で母集合取得。
2. `scoring.scoreCandidates` で各候補にスコア付与（[scoring](scoring.md)）。
3. **重み付きランダム抽選**（スコアを重みに）で 1 件選出。決定的トップ提示ではなく、毎回少し違う楽しさを担保。
4. 「もう一回」: 直前に出た候補の重みを一時的に下げて再抽選（連続同一回避）。
5. 「ここにする」: セッションを `complete`、`decided_restaurant_id` 設定、`last_suggested_at` 更新、外部地図への導線提示。

## モード 2: スワイプ (swipe)

### UX

```text
〇〇食堂 / 焼鳥 / 3000円 / 友達・駅近
[今回は違う]  [候補にする]
  ↓ 5〜10 件さばく
最終候補: 3 件 → [ルーレットで決める] / 一覧から選ぶ
```

### ロジック

1. `startSession('swipe', filter)` で候補をスコア順（or シャッフル）に提示キュー化。
2. 各カードで `recordSwipe(sessionId, restaurantId, 'kept'|'rejected')`。
3. 一定枚数（既定 10、母集合が少なければ全件）さばくか、ユーザーが終了。
4. `keptCandidates(sessionId)` が最終候補集合。
5. 1 件なら即確定提示。複数ならルーレットへ。
6. **取り消し（Undo）**: 直前のスワイプを 1 回戻せる（誤操作対策、[security/usability 改善案](../standards/security.md)）。

## モード 3: ルーレット / 最終決定 (roulette)

- swipe の `kept` 集合、または任意の手動選択集合から 1 件をランダム確定。
- gacha の抽選ロジックを再利用（スコア重み or 等確率を選択可、MVP は等確率で十分）。
- 確定後は gacha と同じ完了処理。

## 完了後（Go）

- 確定店の `source_url` を外部で開く（Googleマップ URL ならマップアプリ、それ以外はブラウザ）。
- 「行ってきた」導線 → [post-visit フロー](user-flows.md#post-visit-flow)（軽い星評価）。

## Functional Requirements

- セッションは [schema](../database/schema.md) `decision_sessions` / `decision_candidates` に永続化（中断復帰可能）。
- 同時にアクティブなセッションは 1 つ（新規開始時に既存 active を cancel）。

## Edge Cases

- **候補ゼロ**: フィルタを段階的に緩める提案（「ジャンル条件を外すと 5 件」）。それでもゼロなら保存導線へ。
- **候補 1 件**: 抽選せず即提示。
- **全候補が訪問済み**: 「訪問済みも含める？」を提示。
- **アプリ再起動でセッション中断**: `active` セッションを復帰提示。

## Open Questions

- gacha の重み付き抽選とスコア順提示のどちらをスワイプ初期順にするか（A/B 余地）。
- 「もう一回」の重み減衰の強さ（チューニング、[scoring](scoring.md) と連動）。
