# 保存フロー (Save Flow)

関連: [ADR 0004](../adr/0004-metadata-extraction-strategy.md) / [user-flows](user-flows.md) / [repository-contract](../api/api-design.md)。

## Goal

連携元 URL を最小操作で候補として保存する。保存は体感 3 秒以内に完了し、メタデータ取得の成否に依存しない。

## Non-Goals

- 完全なメタデータ自動取得。
- 保存時点での詳細入力（ジャンル/エリア/タグの必須化）。

## User Stories

- 外部アプリで見つけた店を共有シートからこのアプリに送るだけで保存できる。
- URL が無い店も、店名だけで手動保存できる。
- 後から気が向いたときに詳細を埋められる。

## エントリポイント

1. **共有シート**: `expo-share-intent` で URL / テキストを受信（[ADR 0001](../adr/0001-platform-expo-react-native.md)）。
2. **手動登録**: アプリ内の「+」から店名（必須）+ 任意 URL。
3. **テキスト内 URL**: LINE 等から共有された本文に URL が含まれる場合、本文から URL を抽出。

## UX Flow（共有シート）

```text
共有受信
  → URL 正規化 & source_type 判定
  → 重複チェック
      ├─ 既存あり → 「すでに保存済み」表示 + 既存詳細へ（行きたい度だけ上げ直せる）
      └─ 新規     → 即 INSERT（暫定 name）→ 保存完了画面を即表示
  → 保存完了画面（行きたい度のみ任意調整）
  → バックグラウンドで OGP 取得 → 取得できた項目を後追い UPDATE
```

保存完了画面（[product-overview](../domain/product-overview.md) §6）:

```text
保存しました
〇〇食堂            ← OGP 取得後に暫定名から差し替え
行きたい度 ★★★★☆   ← 既定 3、その場で変更可
[保存]
```

## Functional Requirements

### URL 正規化（重複判定キー）

- スキームを小文字化、`http`→`https` を正規化。
- トラッキングクエリ（`utm_*`, `fbclid`, `igshid` 等）を除去。
- 末尾スラッシュ・フラグメントを除去。
- `normalized_url` として保存し、`(owner_id, normalized_url)` で重複判定。

### source_type 判定（ホスト名ベース）

| ホスト含む | source_type |
|---|---|
| instagram.com | instagram |
| google.*/maps, maps.app.goo.gl, goo.gl/maps | googlemap |
| tabelog.com | tabelog |
| line.me, lin.ee | line |
| 上記以外の http(s) | web |
| URL なし手動 | manual |
| 画像のみ共有 | screenshot |

### 暫定名（OGP 取得前）

- URL あり: ホスト名 or パス末尾から暫定表示名（例 "tabelog.com の店"）。
- URL なし: ユーザー入力名（手動は名前必須）。

### OGP 取得（非同期・ベストエフォート）

- 対象 URL を `fetch`（GET）し、`Content-Type: text/html` のみ解析。
- 抽出: `og:title`→name、`og:site_name`、`og:image`→thumbnail_url、`og:description`→raw_metadata。
- 取得全文を `raw_metadata`(JSON) に保全。
- 成功時のみ該当カラムを UPDATE。失敗・タイムアウトは黙って暫定値のまま（エラーをユーザーに出さない）。
- **セキュリティ制約**（[security](../standards/security.md)）: http/https のみ、リダイレクト最大 5 回、レスポンス上限（例 2MB）、タイムアウト（例 5s）、プライベート IP への解決を拒否。

### Instagram の扱い

- OGP がログイン無しで取りにくいため、**投稿 URL とサムネイル（取得できれば）を保存**し、店名は手動前提（[ADR 0004](../adr/0004-metadata-extraction-strategy.md)）。
- 「店名を入れる」導線を保存完了画面に軽く出す（任意・スキップ可）。

## Data Requirements

- 必須: `source_type`、`name`(暫定可)、`desire_level`(既定 3)、`created_at`。
- 任意: `source_url`/`normalized_url`/`thumbnail_url`/`genre`/`area`/`address` 等。
- [schema](../database/schema.md) `restaurants` に対応。

## Edge Cases

- **OGP 取得失敗** → 暫定名のまま保存成立。正常系。
- **重複 URL** → 新規作成せず既存へ誘導。行きたい度の再設定のみ許可。
- **不正/危険 URL**（非 http(s)、プライベート IP、巨大レスポンス） → fetch せず URL のみ保存。
- **URL なし手動で名前空** → バリデーションエラー（名前必須）。
- **複数 URL を含むテキスト** → 最初の有効 URL を採用、残りは無視（将来複数候補化）。
- **オフライン保存** → INSERT は成功、OGP 取得は次回オンライン時にリトライ（保留フラグ）。

## Open Questions

- 画像（スクショ）共有時の OCR は将来。MVP はサムネイル保存と手動名入力のみ。
- オフライン時の OGP リトライをアプリ起動時バッチにするか、通知トリガにするか（[resurfacing](resurfacing.md) と統合検討）。
