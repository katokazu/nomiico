# AGENTS.md

This file is the entry point for AI coding agents working in this repository.

Keep this file short. Detailed instructions live under `docs/` and should be loaded only when relevant.

## Start Here

1. Read [docs/INDEX.md](docs/INDEX.md) to find the right document for the task.
2. Read [docs/domain/product-overview.md](docs/domain/product-overview.md) before product, UX, or feature work.
3. Read the relevant area `INDEX.md` before editing code or adding specs.

## Product North Star

This project is not a restaurant search app. It is an app for turning saved "places I want to go" into an actual decision about where to go today.

Core principle:

> Do not optimize for collecting restaurants. Optimize for deciding and going.

## Default Behavior

- Prefer small, focused changes.
- Keep MVP scope tight unless the user explicitly asks for expansion.
- Update related docs when product behavior, architecture, data models, or conventions change.
- If a decision affects future implementation, record it as an ADR.
- Do not make the app a weaker clone of Google Maps, Instagram, or Tabelog.

## Product Decision Checklist

Before adding a feature, ask:

- Does it make saving faster?
- Does it make deciding easier?
- Does it help old saved candidates resurface?
- Does it avoid unnecessary input?
- Does it lead to an actual visit?
- Does it let memories accumulate naturally?

## Documentation Map

- [docs/INDEX.md](docs/INDEX.md): documentation router
- [docs/domain/INDEX.md](docs/domain/INDEX.md): product and business context
- [docs/specs/INDEX.md](docs/specs/INDEX.md): feature specs and UX flows
- [docs/domain-models/INDEX.md](docs/domain-models/INDEX.md): domain objects and terminology
- [docs/architecture/INDEX.md](docs/architecture/INDEX.md): system architecture
- [docs/database/INDEX.md](docs/database/INDEX.md): schema and persistence
- [docs/api/INDEX.md](docs/api/INDEX.md): API contracts
- [docs/patterns/INDEX.md](docs/patterns/INDEX.md): implementation patterns
- [docs/testing/INDEX.md](docs/testing/INDEX.md): test strategy
- [docs/standards/INDEX.md](docs/standards/INDEX.md): coding and documentation standards
- [docs/adr/INDEX.md](docs/adr/INDEX.md): architecture decision records

## Current Status

設計フェーズ。主要な技術・方針は決定済み（[docs/adr/INDEX.md](docs/adr/INDEX.md)）。実装はまだ未着手。

- プラットフォーム: Expo / React Native（モバイル）
- データ: 端末ローカル SQLite ファースト（将来 Supabase 同期シーム）
- 認証: 匿名ローカル → 任意昇格
- メタデータ: OGP + 連携元保存 + 手動補完（無料運用、Google API 不使用）
- 決定モード MVP: gacha / swipe / roulette

実装前に [docs/architecture/overview.md](docs/architecture/overview.md) と該当 spec を読むこと。

