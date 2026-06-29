# ADR 0001: プラットフォームは Expo / React Native

## Status

Accepted (2026-06-29)

## Context

コア体験は「Instagram / Googleマップ / 食べログ / LINE などの共有シートから URL を 3 秒で保存する」ことである（[product-overview](../domain/product-overview.md) §4）。この体験が成立するかどうかがプラットフォーム選定の最重要要件になる。

- iOS Safari の PWA は **Web Share Target API 非対応**であり、共有シートの受け口になれない。Android のみ部分対応。
- ネイティブの Share Extension（iOS）/ 共有ターゲット（Android）は OS の共有シートに項目を出せる。
- 開発は個人。iOS / Android を 1 コードベースで保ちたい。

## Decision

**Expo（React Native, TypeScript）でモバイルアプリとして実装する。**

- 共有受け口は `expo-share-intent`（config plugin）でネイティブの Share Extension / 共有ターゲットを構成する。
- 当面は iOS / Android のモバイルのみを対象とする。Web は対象外（将来 `react-native-web` で再検討可能だが、共有体験が成立しないため優先しない）。

## Consequences

- 1 コードベースで iOS / Android 両対応でき、共有保存というコア体験を満たせる。
- Expo の管理ワークフローのみでは Share Extension を組めないため、**config plugin + 開発ビルド（EAS Build / prebuild）**が前提になる。Expo Go だけでは共有受け口を検証できない。
- Web ユーザーは初期は非対象。リンクを開くだけの軽量 Web ランディングは将来別途検討する。

## Alternatives Considered

- **PWA（Web）**: 開発・配布は最速だが iOS で共有保存が成立せずコア体験が壊れる。却下。
- **Swift / Kotlin ネイティブ各別**: UX 最良だが個人開発で工数が倍。却下。
- **Flutter**: 候補だが、メタデータ抽出やバックエンド連携で TypeScript エコシステム（後の Supabase / Edge Functions）と揃えられる RN を優先。
