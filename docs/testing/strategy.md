# Testing Strategy

スタックは [tech-stack](../architecture/tech-stack.md)（Jest + React Native Testing Library、E2E は後続で Maestro）。

## レイヤー別方針

- **ドメイン純関数（最重要・最優先）**: `scoring` / `decisionEngine` / `urlNormalize` は I/O を持たないため網羅的に単体テスト。
- **Repository（結合）**: インメモリ or テスト用 SQLite に対して CRUD・重複判定・CASCADE を検証。
- **services**: OGP 取得はネットワークをモックし、成功/失敗/タイムアウト/不正URLの分岐を検証。
- **UI**: 主要決定画面（gacha 結果 / swipe）の表示と操作を RTL で検証。
- **E2E（後続）**: コアフロー（保存→決定→記録）を Maestro。

## MVP で必ずカバーするケース

- 最小データで店舗を保存できる。
- OGP 取得失敗でも保存が成立する（暫定名のまま）。
- 重複 URL が新規作成されず既存へ誘導される（[save-flow](../specs/save-flow.md)）。
- URL 正規化がトラッキングパラメータを除去する。
- 不正/プライベート IP URL を fetch しない（[security](../standards/security.md)）。
- 保存一覧の取得・フィルタ（候補がゼロにならない確認含む）。
- gacha が候補母集合から有効な 1 件を返す。
- gacha の重み付き抽選がスコアに比例する（統計的に検証）。
- swipe の kept/rejected が正しく記録され、kept 集合が得られる。
- 店舗を訪問済みにすると visit_count / last_visited_at が更新される。
- 訪問評価（星）を追加・後追い編集できる。
- アーカイブ済みが決定候補から除外される。

## スコアリングのテスト指針

- 各要素関数 `f_*` の境界値（保存直後/180日超、未提案/直近提案、未訪問/複数訪問）。
- 重み変更が順位に与える影響のスナップショット。
- 提案理由文が寄与上位要素から正しく生成される。

## 非機能

- 候補数が多い場合の `pickCandidates` / スコア計算のパフォーマンス（端末内同期処理の許容時間）。
