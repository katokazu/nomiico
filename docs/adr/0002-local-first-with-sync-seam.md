# ADR 0002: ローカルファースト（SQLite）+ 同期シーム

## Status

Accepted (2026-06-29)

## Context

MVP は無料で運用したい。サーバーを持たずに「保存・思い出す・決める・記録する」を成立させたい。一方、将来的に複数端末同期・グループ決定・Push を入れるために Supabase 等のリモートへ拡張する余地は残したい。

## Decision

**端末内 SQLite を唯一の正とするローカルファースト構成にする。ただしデータアクセスを Repository インターフェースで抽象化し、将来のリモート同期を差し込めるシーム（継ぎ目）を最初から設ける。**

- 永続化: `expo-sqlite` 上に **Drizzle ORM** を載せる。Drizzle は SQLite と Postgres の双方に対応するため、将来の Supabase（Postgres）移行でスキーマ定義とクエリ資産を流用できる。
- すべてのデータ操作は [repository-contract](../api/api-design.md) に定義する `Repository` インターフェース経由で行う。UI / ドメインロジックは具体的なストレージを知らない。
- 実装は当面 `LocalSqliteRepository` のみ。将来 `SupabaseRepository` を追加し、同期方針は別 ADR で決める。
- 全行に `owner_id`（[ADR 0003](0003-anonymous-auth-upgrade.md) のローカル匿名ユーザー ID）を持たせ、将来のマルチユーザー / 同期時に所有境界が壊れないようにしておく。

## Consequences

- サーバー費用ゼロで MVP を運用できる。オフラインでも全機能が動く。
- グループ決定（draft / vote）と端末間同期・サーバー Push は、リモート導入まで保留になる（[decision-engine スコープ](0005-decision-engine-scope.md)）。
- 「思い出す」通知はサーバー不要の **端末ローカルスケジュール通知**（`expo-notifications`）で実現する。
- バックアップは端末ローカルのみ。端末紛失・再インストールでデータ消失リスクがあるため、MVP では手動エクスポート（JSON 書き出し）を用意する（[security](../standards/security.md)）。
- Drizzle のマイグレーション運用が必要になる。

## Alternatives Considered

- **最初から Supabase**: 同期・Push・グループが楽になるが、運用コストと認証必須化を招き「入力を求めない / 無料」方針に反する。後続フェーズへ。
- **素の `expo-sqlite` を直接利用**: 依存は減るが、型安全・マイグレーション・Postgres 移植性を失う。Drizzle を採用。
- **WatermelonDB / Realm**: 同期機能は強いが、Postgres 移植性と軽量さで Drizzle + SQLite を優先。
