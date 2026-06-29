# 「今行くべき」スコア (Scoring)

関連: [product-overview](../domain/product-overview.md) §8 / [ADR 0004](../adr/0004-metadata-extraction-strategy.md) / [decide-flow](decide-flow.md)。

## Goal

「なんとなくおすすめ」ではなく「今日はここにしよう」と納得できる根拠付きの提案を出す。スコアは gacha の抽選重みと swipe の初期並びに使う。

## 制約

- 端末内で同期計算（[repository-contract](../api/api-design.md)）。
- 座標が無いため**物理距離は MVP のスコア要素に含めない**（[ADR 0004](../adr/0004-metadata-extraction-strategy.md)）。エリア/最寄駅の文字列一致のみ弱く扱う。

## スコア式（v1）

各候補 `r` に対し、正規化済みの要素を重み付き加算する。

```text
score(r) = 100 * (
    w_desire   * f_desire(r)
  + w_age      * f_age(r)
  + w_unseen   * f_unseen(r)
  + w_context  * f_context(r, ctx)
  + w_novelty  * f_novelty(r)
)
```

各 `f_*` は 0..1 に正規化。既定重み（合計 1.0、`config/scoring.ts` で調整可能）:

| 重み | 既定 | 要素 |
|---|---|---|
| w_desire | 0.30 | 行きたい度 |
| w_age | 0.25 | 保存からの経過（寝かせ候補の再浮上） |
| w_unseen | 0.20 | 最近提案に出ていない |
| w_context | 0.15 | 今日の文脈（フィルタ/シーン/季節）一致 |
| w_novelty | 0.10 | 未訪問優遇 |

### 各要素

- **f_desire** = `(desire_level - 1) / 4` （1..5 → 0..1）。
- **f_age** = `min(days_since_created / 180, 1)`。保存後 180 日で最大。古い候補ほど高い（=思い出させる）。
- **f_unseen** = `last_suggested_at` が無ければ 1。あれば `min(days_since_last_suggested / 30, 1)`。直近提案を抑制し多様性を出す。
- **f_context** = フィルタ/シーン/季節タグとの一致度。例: 選択タグと候補タグの Jaccard 係数、季節タグが現在季節と一致で加点。文脈指定が無ければ中立値 0.5。
- **f_novelty** = `visited` が false なら 1、true なら `1 / (visit_count + 1)`。

## 提案理由の生成

スコアへの寄与が大きい上位 2〜3 要素を自然文に変換する（[product-overview](../domain/product-overview.md) §8 の提案例）。

```text
今日のおすすめ: 〇〇酒場
・保存してから143日経っています        ← f_age 寄与大
・行きたい度が高い候補です              ← f_desire 寄与大
・友達タグ付きです                     ← f_context 寄与
```

文言テンプレートは要素 → メッセージのマップで管理。

## gacha 抽選への適用

- 各候補の選出確率 = `score(r) / Σ score`。
- 「もう一回」直後は直前候補の重みを係数 0.2 倍に一時減衰（[decide-flow](decide-flow.md)）。

## 将来拡張

- 座標導入後に距離要素 `f_distance`（現在地から近いほど加点）を追加（リモート or 端末 GPS）。
- 天気 API 連携で「雨だから駅近」等の文脈強化。
- 行動ログからの重み自動学習。

## Open Questions

- f_age の上限日数（180 日）と重みは実データで要調整。
- 文脈一致の算出（Jaccard か単純包含か）は実装時に簡素版から開始。
