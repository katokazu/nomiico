# AGENTS.md

このファイルは、このリポジトリで作業するAIコーディングエージェント向けの入口です。

このファイルは短く保ってください。詳細な指示は `docs/` 配下に置き、必要なときだけ読み込んでください。

## 最初に読むもの

1. タスクに合う文書を探すために [docs/INDEX.md](docs/INDEX.md) を読む。
2. プロダクト、UX、機能に関する作業の前に [docs/domain/product-overview.md](docs/domain/product-overview.md) を読む。
3. コード編集や仕様追加の前に、関連領域の `INDEX.md` を読む。

## プロダクトの北極星

このプロジェクトはレストラン検索アプリではありません。保存した「行きたい場所」を、今日どこに行くかの実際の決定へ変えるためのアプリです。

中心原則:

> 店を集めることに最適化しない。決めて行くことに最適化する。

## デフォルトの振る舞い

- 小さく焦点の合った変更を優先する。
- ユーザーが明示的に拡張を求めない限り、MVPスコープを絞る。
- プロダクト挙動、アーキテクチャ、データモデル、規約が変わる場合は関連ドキュメントを更新する。
- 将来の実装に影響する判断はADRに記録する。
- Googleマップ、Instagram、食べログの弱いクローンにしない。

## ドキュメント記述ルール

- `AGENTS.md` および `docs/` 配下の各ドキュメントは日本語で記述する。
- コード識別子、ファイル名、API名、enum値など、実装上の意味を持つ英語は必要に応じてそのまま残す。

## プロダクト判断チェックリスト

機能を追加する前に、次を確認してください。

- 保存が速くなるか。
- 決めやすくなるか。
- 古い保存候補が再浮上しやすくなるか。
- 不要な入力を避けているか。
- 実際の訪問につながるか。
- 思い出が自然に蓄積されるか。

## ドキュメントマップ

- [docs/INDEX.md](docs/INDEX.md): ドキュメントの入口
- [docs/domain/INDEX.md](docs/domain/INDEX.md): プロダクトと事業文脈
- [docs/specs/INDEX.md](docs/specs/INDEX.md): 機能仕様とUXフロー
- [docs/domain-models/INDEX.md](docs/domain-models/INDEX.md): ドメインオブジェクトと用語
- [docs/architecture/INDEX.md](docs/architecture/INDEX.md): システムアーキテクチャ
- [docs/database/INDEX.md](docs/database/INDEX.md): スキーマと永続化
- [docs/api/INDEX.md](docs/api/INDEX.md): API契約
- [docs/patterns/INDEX.md](docs/patterns/INDEX.md): 実装パターン
- [docs/testing/INDEX.md](docs/testing/INDEX.md): テスト戦略
- [docs/standards/INDEX.md](docs/standards/INDEX.md): コーディングとドキュメントの標準
- [docs/adr/INDEX.md](docs/adr/INDEX.md): アーキテクチャ判断記録

## 現在の状況

このコードベースは現在、ドキュメントとスキャフォールディングの段階です。技術選定はまだ確定していません。
