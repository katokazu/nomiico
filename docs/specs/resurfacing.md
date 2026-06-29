# 思い出す / リサーフェシング (Resurfacing)

関連: [product-overview](../domain/product-overview.md) §4「思い出す」/ [ADR 0002](../adr/0002-local-first-with-sync-seam.md) / [scoring](scoring.md)。

## Goal

アプリを開かなくても、保存したまま埋もれた候補を行動につながる形で思い出させる。

## 制約

- サーバーを持たないため、**端末ローカルのスケジュール通知**（`expo-notifications`）のみを使う（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）。サーバー Push はリモート導入後。
- 通知は「整理して/入力して」ではなく「行こう」のきっかけにする（[product-overview](../domain/product-overview.md) §4）。

## 通知の種類（MVP）

| 種類 | トリガ | 例文 |
|---|---|---|
| 寝かせ候補の再浮上 | 保存から N 日経過 & 未訪問 & 未提案 | 「143日前に保存した焼鳥屋、まだ行きたい？」 |
| 今週の未消化候補 | 週次定期 + スコア上位 | 「今週まだ行けていない人気候補があります」 |
| 「まだ行きたい？」確認 | 長期未訪問（例 180 日超） | 「この店、まだ行きたい？ [行きたい] [アーカイブ]」 |

MVP で見送り（座標/天気が必要）:

- 現在地付近通知（GPS、将来）。
- 天気・気温連動（API、将来）。

## スケジューリング

- 端末ローカル通知は OS の保留枠に限りがあるため、**直近 N 件のみ先行スケジュール**し、アプリ起動・フォアグラウンド復帰時に再評価して入れ替える。
- 1 日あたりの通知上限（既定 1 件）と時間帯（既定 11:00 / 17:00 など食事前）を設定で持つ。
- 候補選定は [scoring](scoring.md) のスコア上位から、`last_suggested_at` を考慮して多様性を確保。

## 通知タップ後の遷移

- 通知から直接「決める」体験へ入る（一覧を経由しない、[product-overview](../domain/product-overview.md) §6）。
- 「まだ行きたい？」通知はアクションボタンで `行きたい`（desire 据え置き / last_suggested 更新）/ `アーカイブ`（archived=1）を即実行。

## Functional Requirements

- 通知許可は初回保存より後の適切なタイミングで要求（初回起動でいきなり求めない＝入力/許可を求めない思想）。具体UXは初回保存後の文脈付きシート（[home-and-decision-ux](home-and-decision-ux.md) §設定、[mockups/detail-input-settings.html](../../mockups/detail-input-settings.html)）。
- 通知設定（頻度・時間帯・ON/OFF）を設定画面に置く。設定はホーム右上の歯車から入る（[home-and-decision-ux](home-and-decision-ux.md) §設定とその入口）。
- 通知発火時に `last_suggested_at` を更新し、短期間の重複提案を防ぐ。

## Edge Cases

- **通知未許可**: アプリ内ホームの「今日のおすすめ」枠でのみ再浮上（通知に依存しない）。
- **候補が少ない/全訪問済み**: 通知を出さない（空振り通知を避ける）。
- **OS の保留枠超過**: 先行スケジュール数を絞り、起動時に再投入。

## Open Questions

- 寝かせ再浮上の N 日（初期値 90 日想定）と週次のタイミングは実データで調整。
- アプリ未起動が長期間続く場合の再スケジュール限界（ローカル通知の宿命）をどう案内するか。
