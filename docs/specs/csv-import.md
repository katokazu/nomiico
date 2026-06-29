# CSV インポート (CSV Import)

関連: [save-flow](save-flow.md) / [ADR 0004](../adr/0004-metadata-extraction-strategy.md) / [repository-contract](../api/api-design.md) / [database/schema.md](../database/schema.md)。

## 位置づけ / スコープ

**MVP 直後の初期拡張。** 単体の保存・決定体験（MVP）が成立した後に追加する。

本プロダクトの核心は「散らばった"行きたい"を集約する」こと（[product-overview](../domain/product-overview.md) §1）。CSV インポートは、完全な API 連携（後回し機能）より遥かに軽量に、既存資産を一括で取り込む手段である。初期候補ゼロ問題（空っぽのアプリ）を一気に解消する効果も大きい。

初期対応フォーマット: **Google Takeout の「保存済みリスト」CSV**。
将来拡張: マイマップ由来 CSV / 汎用 CSV（列マッピング）。設計は列マッピングを前提にして拡張可能にしておく。

## Goal

ユーザーが既に Google マップ等に貯めた「行きたい場所」を、CSV ファイルから一括で候補として取り込む。

## Non-Goals

- Google アカウント直接連携 / API 取り込み（後回し、[product-overview](../domain/product-overview.md) §5）。
- 取り込み時の完全なメタデータ補完（OGP は遅延・任意）。
- 双方向同期。CSV は一方向の取り込みのみ。

## 入力フォーマット

Google Takeout 保存リスト CSV は概ね次の列を持つ（順序・有無は変動しうる）:

| 列 | 例 | マッピング先 |
|---|---|---|
| Title | 〇〇食堂 | `name` |
| URL | https://www.google.com/maps/... | `source_url` |
| Note | 友達おすすめ | `raw_metadata.note`（詳細で表示） |
| Comment / Tags 等 | （あれば） | `raw_metadata` に保全 |

- 文字コード: UTF-8（BOM 付き許容）。BOM を除去して解析。
- 引用フィールド（カンマ・改行を含む値）に対応する正しい CSV パーサを使う（[implementation-patterns](../patterns/implementation-patterns.md)）。
- 必須とみなす列: **Title または URL のどちらか**。両方空の行はスキップ。

## UX Flow

```text
設定 or 保存一覧 → 「CSVから取り込む」
  → ファイル選択 (expo-document-picker)
  → 解析 & 列の自動推定（Title/URL/Note）
  → プレビュー（先頭数件 + 取込件数 / 重複件数 / スキップ件数）
      └─ 列マッピングを手動修正可能
  → [取り込む]
  → 進捗表示（チャンク処理）
  → 完了サマリ（新規 N 件 / 重複スキップ M 件 / 失敗 K 件）
      └─ [この取り込みを取り消す]（Undo）
```

## Functional Requirements

### 取り込み処理

1. 各行を `Restaurant` 候補に変換。
   - `name` = Title（無ければ URL のホスト/暫定名、[save-flow](save-flow.md)）。
   - `source_url` = URL。`normalized_url` を生成（[save-flow](save-flow.md) の正規化規則を共有）。
   - `source_type` = URL ホストから判定（Google マップ URL → `googlemap`、他 → `web`、URL 無し → `manual`）。
   - `desire_level` = 既定 3。
   - `Note` 等は `raw_metadata`(JSON) に保全。
   - 取り込み元を識別する `import_batch_id` を付与（Undo 用）。
2. **重複判定**: 既存 `(owner_id, normalized_url)` と一致、またはファイル内重複はスキップ（カウントのみ）。URL 無し行は Title 完全一致で簡易重複判定。
3. **一括 INSERT**: チャンク（例 100 行）単位でトランザクション処理し、進捗を更新。
4. **OGP 補完は同期実行しない**: 大量行のため取り込みをブロックしない。Google マップ URL は Title が既に良名のため優先度低。補完は遅延・レート制限つきでバックグラウンド実行（[save-flow](save-flow.md) の OGP 経路を再利用、任意）。

### Undo（取り消し）

- 取り込み直後のサマリから、その `import_batch_id` で**新規作成された行のみ**を削除（既存だった重複は触らない）。
- バッチ情報は [schema](../database/schema.md) `import_batches` に記録。

## Data Requirements

[database/schema.md](../database/schema.md):

- `restaurants.import_batch_id`（NULL 可, FK）を追加。
- `import_batches` テーブルを追加（id / owner_id / source_label / file_name / created_count / skipped_count / created_at）。

## Edge Cases

- **列が想定と違う / ヘッダ無し** → 列マッピング UI でユーザーが手動割当。自動推定失敗でも取り込めるようにする。
- **巨大ファイル** → ファイルサイズ上限（例 5MB）と行数上限を設け、チャンク処理。超過時は警告。
- **不正文字コード / 壊れた行** → 行単位でスキップしカウント、全体は失敗させない。
- **全行重複** → 「新規 0 件」を明示。
- **オフライン** → INSERT は成功（OGP 補完のみ後追い）。
- **危険 URL（非 http(s) / プライベート IP）** → URL は保存するが OGP 補完対象から除外（[security](../standards/security.md)）。

## Security

- インポート URL も OGP 取得時は [security](../standards/security.md) の SSRF 制約を適用。
- ファイルはローカル処理のみ。外部送信しない。

## Open Questions

- Note を `raw_metadata` 止まりにするか、専用の表示欄（restaurant の説明）を設けるか。MVP拡張時は raw_metadata で開始。
- マイマップ CSV の実列構成は入手サンプルで確定（汎用マッピングで吸収予定）。
