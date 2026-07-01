# 実装パターン

## 状況

確立済みの実装パターンはまだありません。

## 将来追加するセクション

- ルーティング
- 状態管理
- フォーム処理
- データ取得
- エラー処理
- バックグラウンドジョブ
- 通知スケジューリング
- メタデータ抽出

## 指針

最初の実装が入ったら、実際に使われているパターンだけを文書化してください。
技術選定は [tech-stack](../architecture/tech-stack.md)。ここでは実装時に従う具体パターンを定義する。コードが無い段階のため「最初に従うべき規約」として記述し、実装後に実態へ合わせて更新する。

## プロジェクト構成

ソースのルートフォルダは `src/` に統一する。`expo-router` は `app/` に加え `src/app/` も規定のルートとして自動認識するため、ルーティングも含めて全体を `src/` 配下に置ける。

```text
src/
  app/                      # expo-router 画面（ファイルベースルーティング）
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx             # ホーム「今日の一店」
      saved.tsx              # 保存タブ
      records.tsx             # 記録タブ（思い出）
    decide/
      gacha.tsx
      swipe.tsx
      together.tsx           # みんなで（投票制/順位制）
      result.tsx
    restaurant/[id].tsx      # 店舗詳細
    restaurant-form.tsx       # 手動登録/編集の共通フォーム
    save.tsx                  # 共有/手動保存の保存完了画面
    settings.tsx
  domain/                   # 型・ドメインロジック（ストレージ非依存・純粋）
    models.ts
    scoring.ts
    decisionEngine.ts
    urlNormalize.ts
  data/
    repository.ts           # Repository インターフェース
    sqlite/                 # LocalSqliteRepository 実装
      client.ts              # expo-sqlite + Drizzle 接続
      schema.ts               # Drizzle スキーマ
      migrations/
      restaurantRepository.ts
      ...
  services/
    saveService.ts
    ogp.ts                   # OGP 取得（セキュリティ制約込み）
    resurfacing.ts
  state/                    # Zustand ストア（決定セッション一時状態など）
  ui/                       # 再利用コンポーネント
  config/
    scoring.ts               # スコア重み等の調整値
```

## ルーティング

- `expo-router` のファイルベース。共有/通知からのディープリンクは画面パスに対応させる。
- 「決める」へは最短遷移（一覧を挟まない）。

## データ取得 / 状態管理

- **永続データ**: TanStack Query で Repository を呼ぶ。クエリキーは `['restaurants', filter]` 等。変更系（保存・訪問・アーカイブ）は mutation + `invalidateQueries`。
- **一時状態**: 決定セッション中のスワイプ進行などは Zustand（or セッション永続化が要るものは DB）。
- **DB は Repository 経由のみ**触る。画面が Drizzle / SQL を直接呼ばない（[repository-contract](../api/api-design.md)）。

## ドメインロジックの純粋性

- `scoring` / `decisionEngine` / `urlNormalize` は I/O を持たない純関数にし、Repository から渡されたデータだけで動かす。→ 単体テスト容易（[testing](../testing/strategy.md)）。

## 保存（OGP）パターン

- 保存は 2 段階: ①即時 INSERT（暫定値）→ ②バックグラウンドで OGP 取得 → 後追い UPDATE（[save-flow](../specs/save-flow.md)）。
- OGP 取得はセキュリティ制約（URL allowlist / サイズ・タイムアウト上限 / プライベート IP 拒否）を `ogp.ts` に集約（[security](../standards/security.md)）。
- 取得失敗はエラーにせず黙って暫定値維持。

## エラーハンドリング

- ユーザー操作起因のエラーのみ UI 表示（保存名未入力など）。
- ネットワーク/OGP 失敗は非致命として握り、保存自体は成功させる。
- 例外は境界（service / repository 呼び出し）で捕捉し、ドメイン層に漏らさない。

## 日時 / ID

- ID は UUID v4（`crypto.randomUUID` 相当）。
- 日時は UTC ISO8601 文字列で保存、表示時のみローカル変換。

## マイグレーション / シード

- Drizzle マイグレーションをコミット。起動時に未適用分を適用し、初回にシステムタグをシード（[schema](../database/schema.md)）。
- 実装: `.sql` マイグレーションを Metro でそのまま `require` できるよう `metro.config.js`（`sourceExts` に `sql` 追加）と
  `babel.config.js`（`babel-plugin-inline-import`）を設定。`src/data/sqlite/bootstrap.ts` が
  `drizzle-orm/expo-sqlite/migrator` の `migrate()` → `ownerId.ts` の owner 解決 → `tagRepository.seedSystemTags()`
  の順で実行し、ルートレイアウト（`src/app/_layout.tsx`）が完了までスプラッシュ的な待機画面を出す。
- `docs/database/schema.md` の変更時は `npx drizzle-kit generate` でマイグレーションを再生成する。

## データ層の実装パターン

- **owner 解決**（[ADR 0003](../adr/0003-anonymous-auth-upgrade.md)）: `src/data/sqlite/ownerId.ts` の
  `getOwnerId()` が `expo-secure-store` から読み書きし、`app_user` / `user_settings` の既定行を作成する。
  各 Repository はコンストラクタ第2引数 `ownerIdProvider`（既定値 `getOwnerId`）を持ち、
  結合テストではこれをフェイクに差し替えて `expo-secure-store` / `expo-sqlite` への依存を切る。
- **行 ↔ ドメイン変換**: `src/data/sqlite/mappers.ts` に集約（snake_case行→camelCaseドメイン型、
  タグの N+1 回避のためのバッチ読み込み、決定セッション+候補の組み立てなど）。複数 Repository から共有する。
- **Repository 間の依存**: `SqliteDecisionRepository` は `pickCandidates` のために `RestaurantRepository` を
  コンストラクタで受け取る（`src/data/sqlite/index.ts` で restaurants を先に生成してから渡す）。

## テスト（Repository 結合）

- `expo-sqlite` は Jest 上で動かないため、Repository の結合テストは `better-sqlite3` に同じ Drizzle スキーマを適用して行う
  （`src/data/sqlite/testDb.ts` の `createTestDb()`）。生成済みマイグレーション SQL をそのまま再生してスキーマの乖離を防ぐ。
- `expo-crypto`（ID 採番）は Jest 環境にネイティブ実装が無いため `jest.setup.js` で Node の `crypto.randomUUID` にモックする。

## 通知

- `expo-notifications` の権限要求は初回起動を避け、適切なタイミングで（[resurfacing](../specs/resurfacing.md)）。
- スケジュールはアプリ起動/フォアグラウンド時に再評価。

## まだ作らない

- リモート同期 / `SupabaseRepository`（インターフェースのみ用意）。
- グループ決定の状態同期。
- 抽象化のための抽象化（[coding standards](../standards/coding.md)）。実際に使うパターンのみ追加する。
