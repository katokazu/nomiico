# MVP仕様

## 目的

飲食店を保存し、保存済み候補の中から今日行く1店舗を決められるようにする。

## 対象範囲

- 共有URLまたは手動入力から飲食店を保存する
- 基本的な店舗情報を保存する
- 保存済み店舗を表示する
- 訪問済み / 未訪問を管理する
- 行きたい度を設定する
- 基本条件でフィルタする
- ガチャモードで決める
- スワイプモードで候補を絞る

## 対象外

- Googleマップの完全インポート
- Instagramの完全インポート
- 予約フロー
- ソーシャルフィード
- 高度なAIコンシェルジュ
- 複雑な自動タグ付け
- 大規模なレコメンド基盤

## 成功基準

- ユーザーが候補を素早く保存できる。
- ユーザーがアプリを開き、先に一覧管理をしなくても決定に到達できる。
- ユーザーが訪問後に最低限の評価を記録できる。

## 未決事項
## Decisions (旧 Open Questions)

- **Which platform first?** → モバイル（Expo / React Native）([ADR 0001](../adr/0001-platform-expo-react-native.md))。
- **Which source URL types?** → instagram / googlemap / tabelog / line / web / screenshot / manual を `source_type` として受理。判定規則は [save-flow](save-flow.md)。
- **How much metadata extraction for MVP?** → OGP ベストエフォート + 連携元 URL 保存 + 手動補完。Google API 不使用、失敗しても URL は保存([ADR 0004](../adr/0004-metadata-extraction-strategy.md))。

## Architecture Summary

- データ: 端末ローカル SQLite ファースト、将来 Supabase 同期シーム([ADR 0002](../adr/0002-local-first-with-sync-seam.md))。
- 認証: 匿名ローカル → 任意昇格([ADR 0003](../adr/0003-anonymous-auth-upgrade.md))。
- 決定モード: gacha / swipe / roulette（グループ系は後続、[ADR 0005](../adr/0005-decision-engine-scope.md)）。

## 詳細仕様

- [save-flow.md](save-flow.md): 保存（共有/手動/OGP/重複）
- [decide-flow.md](decide-flow.md): 決定モード
- [scoring.md](scoring.md): 「今行くべき」スコア
- [resurfacing.md](resurfacing.md): 思い出す通知
- [csv-import.md](csv-import.md): CSV 一括取り込み（MVP 直後の初期拡張）

- 最初にどのプラットフォームで実装するか。
- 初期バージョンでどの種類のURLをサポートするか。
- MVPに必要なメタデータ抽出はどの程度か。
