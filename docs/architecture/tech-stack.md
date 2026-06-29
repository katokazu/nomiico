# Tech Stack

決定根拠は [ADR 0001](../adr/0001-platform-expo-react-native.md) / [0002](../adr/0002-local-first-with-sync-seam.md)。バージョンは実装開始時点の最新安定版に合わせる。

## Core

| 領域 | 選定 | 理由 |
|---|---|---|
| 言語 | TypeScript (strict) | 型安全。ドメイン語彙をそのまま型に。 |
| フレームワーク | Expo (React Native) | iOS/Android 1 コードベース。Share Extension 対応。 |
| ルーティング | expo-router | ファイルベース。ディープリンク / 共有遷移に強い。 |
| DB | expo-sqlite | 端末ローカル永続化。 |
| ORM / マイグレーション | Drizzle ORM | 型安全。SQLite↔Postgres 移植で将来の Supabase 移行容易。 |
| サーバー状態 / キャッシュ | TanStack Query | ローカル非同期クエリのキャッシュ・無効化・楽観更新を統一。 |
| UI 状態 | Zustand | 決定セッション中の一時状態など軽量グローバル状態。 |
| 共有受け口 | expo-share-intent | OS 共有シートからの URL / テキスト受信。 |
| 通知 | expo-notifications | 端末ローカルスケジュール通知。 |
| 秘匿ストレージ | expo-secure-store | owner_id 等の保管。 |
| HTML/OGP 解析 | 軽量メタタグパーサ（正規表現ベース or `node-html-parser` 相当の軽量実装） | OGP 抽出（[ADR 0004](../adr/0004-metadata-extraction-strategy.md)）。 |

## Tooling

| 領域 | 選定 |
|---|---|
| Lint / Format | ESLint + Prettier（Expo 既定の eslint-config-expo を基点） |
| テスト（単体/結合） | Jest + React Native Testing Library |
| テスト（E2E、後続） | Maestro（RN 向けで軽量） |
| ビルド / 配布 | EAS Build（Share Extension のため開発ビルド必須） |
| CI | GitHub Actions（lint → typecheck → test） |

## Not Used In MVP

- バックエンド / サーバー（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）
- Google Places / 地図 API（[ADR 0004](../adr/0004-metadata-extraction-strategy.md)）
- サーバー Push（FCM/APNs 経由）
- 認証プロバイダ（[ADR 0003](../adr/0003-anonymous-auth-upgrade.md)）

## Future (リモート導入時)

- Supabase（Postgres + Auth + Storage + Edge Functions + Realtime）
- Drizzle スキーマを Postgres ターゲットへ流用
- グループ決定（draft / vote）と端末間同期
