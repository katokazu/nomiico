# アーキテクチャ概要

## 状況

技術選定はまだ確定していません。

## 想定されるシステム責務

- URLまたは手動入力から飲食店候補を保存する
- ユーザー自身の店舗データを保存する
- 決定モードをサポートする
- 訪問記録をサポートする
- 通知または再浮上ロジックをサポートする
- 外部地図URLと連携する

## 初期アーキテクチャの論点

- モバイルファーストアプリ、Webアプリ、またはその両方のどれにするか。
- メタデータ抽出はどこで行うべきか。
- ユーザーデータを保存するバックエンドは何にするか。
- 通知はどのようにスケジュールするか。
- MVPに必要な認証モデルは何か。

## 制約

- 保存は速くなければならない。
- 地図や経路検索など、既存サービスの方が優れている領域では外部サービスを使う。
- アプリは完全なメタデータ抽出に依存しない。
関連する決定: [ADR 0001](../adr/0001-platform-expo-react-native.md) / [0002](../adr/0002-local-first-with-sync-seam.md) / [0003](../adr/0003-anonymous-auth-upgrade.md) / [0004](../adr/0004-metadata-extraction-strategy.md)。技術選定の詳細は [tech-stack.md](tech-stack.md)。

## Shape

単一の React Native（Expo）モバイルアプリ。バックエンドは持たず、端末内 SQLite を正とするローカルファースト構成。ネットワークは「保存時の OGP 取得」と「地図アプリへの遷移」など外部委譲のみで使う。

```text
┌─────────────────────────────────────────────┐
│ Expo / React Native App (iOS / Android)      │
│                                              │
│  Share Extension ──┐                         │
│  (OS 共有シート)    │                         │
│                    ▼                         │
│  UI Layer (expo-router screens, components)  │
│        │                                     │
│        ▼                                     │
│  Application Layer                           │
│   - save service (OGP 取得 → 正規化 → 保存)   │
│   - decision engine (gacha/swipe/roulette)   │
│   - scoring (今行くべきスコア)                │
│   - resurfacing (ローカル通知スケジュール)     │
│        │                                     │
│        ▼                                     │
│  Repository Interface  ◄── 同期シーム          │
│        │                                     │
│        ▼                                     │
│  LocalSqliteRepository (Drizzle + expo-sqlite)│
│        │                                     │
│        ▼                                     │
│  SQLite (端末ローカル)                         │
└──────────┬───────────────────┬───────────────┘
           │                   │
   外部 fetch (OGP)        外部アプリ起動
   対象店舗 URL          (Googleマップ / ブラウザ)
```

将来 `SupabaseRepository` を Repository 実装として追加することでリモート同期へ拡張する（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）。UI / アプリ層は変更しない。

## Layers

- **UI Layer**: 画面とコンポーネント。`expo-router` によるファイルベースルーティング。状態は最小限（[implementation-patterns](../patterns/implementation-patterns.md)）。
- **Application Layer**: ドメインのユースケース。ストレージ非依存の純粋な TypeScript に寄せ、テスト可能にする。
  - 保存サービス: URL 正規化 → OGP 取得 → `Restaurant` 生成 → 重複判定 → 永続化。
  - 決定エンジン: フィルタ → 候補抽出 → 重み付き抽選（[scoring](../specs/scoring.md)）。
  - リサーフェシング: 端末ローカル通知のスケジュールと再評価（[resurfacing](../specs/resurfacing.md)）。
- **Repository Layer**: [repository-contract](../api/api-design.md) のインターフェース。永続化の唯一の入口。
- **Persistence**: `expo-sqlite` + Drizzle ORM。スキーマは [database/schema.md](../database/schema.md)。

## System Responsibilities

- 共有シート / 手動入力から候補を保存する（メタデータ欠損を許容）。
- ユーザー所有の店舗・タグ・訪問・決定セッションを端末に永続化する。
- 単独利用の決定モードを提供する（[ADR 0005](../adr/0005-decision-engine-scope.md)）。
- 訪問記録を残す。
- 端末ローカル通知で保存済み候補を思い出させる。
- 地図 / ブラウザなど外部アプリへ受け渡す。

## Cross-Cutting

- **オフラインファースト**: 保存時の OGP 取得を除き、全機能がオフラインで完結する。OGP 取得失敗は正常系として扱う。
- **認証**: 端末ローカル匿名ユーザー（[ADR 0003](../adr/0003-anonymous-auth-upgrade.md)）。全データに `owner_id`。
- **通知**: `expo-notifications` の端末ローカルスケジュール通知。サーバー Push はリモート導入後。
- **セキュリティ / プライバシー**: [standards/security.md](../standards/security.md)。特に OGP fetch の SSRF / 入力検証、ローカルデータのエクスポート。

## Constraints

- 保存は速く（OGP 取得は非同期・バックグラウンドで、保存自体をブロックしない）。
- 地図・経路・予約など既存が優れる領域は外部委譲する。
- 完全なメタデータ抽出に依存しない。
