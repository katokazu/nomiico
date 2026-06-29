# ドキュメント標準

## 目的

ドキュメントは、人間とAIエージェントがすべてのファイルを読み込まずに、必要な文脈を素早く見つけられるようにするためのものです。

## ルール

- `AGENTS.md` は短く保ち、詳細な文書へ案内する。
- 各ディレクトリの `INDEX.md` を最新に保つ。
- 新しい文書は最も近い `INDEX.md` に追加する。
- 抽象的なルールより具体例を優先する。
- 振る舞いが変わったらドキュメントを更新する。
- `AGENTS.md` と `docs/` 配下の文書は日本語で記述する。

## ファイル配置

- プロダクト文脈: `docs/domain/`
- 機能仕様: `docs/specs/`
- ドメインオブジェクト: `docs/domain-models/`
- 技術アーキテクチャ: `docs/architecture/`
- 永続化: `docs/database/`
- API契約: `docs/api/`
- パターン: `docs/patterns/`
- テスト: `docs/testing/`
- 標準: `docs/standards/`
- 判断記録: `docs/adr/`
