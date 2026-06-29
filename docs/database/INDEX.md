# Database Index

Database documentation describes persistence models, migrations, and data ownership.

## Documents

- [schema.md](schema.md): SQLite スキーマ（テーブル定義・索引・マイグレーション方針）

## Principles

- Store user intent even when metadata is incomplete.
- Keep source URLs.
- Separate restaurants, tags, visits, and decision sessions.
- Avoid making optional enrichment required for MVP.

