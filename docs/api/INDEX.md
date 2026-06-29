# API Index

MVP はサーバーを持たない（[ADR 0002](../adr/0002-local-first-with-sync-seam.md)）。ここでの「API」はアプリ内 Repository インターフェース（アプリ層と永続化層の境界、将来の同期シーム）。

## Documents

- [api-design.md](api-design.md): Repository / データアクセス契約

## When To Add Details

リモート（Supabase）導入で HTTP API を加える際、Repository のメソッド群を土台に endpoint 設計を追記する。

