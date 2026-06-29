# コーディング標準

## 現在の状況

言語やフレームワークはまだ選定されていません。

## 一般標準

- コードができた後は、既存のプロジェクト規約に従う。
- 変更は焦点を絞る。
- 推測による抽象化を避ける。
- ドメイン文書に基づく明確な命名を優先する。
- MVPの振る舞いはシンプルで観察可能に保つ。
- 不完全なメタデータを通常のケースとして扱う。

## UI標準

- 速く保存でき、速く決められることを優先する。
- 一覧管理を主要体験にしない。
- 任意の詳細情報は、それが有用になったタイミングでのみ求める。
技術選定は [tech-stack](../architecture/tech-stack.md)（Expo / React Native / TypeScript）。

## 言語 / 型

- TypeScript strict。`any` 回避、ドメイン語彙を型名に（`Restaurant`, `DecisionMode` 等）。
- enum 的値は union 文字列リテラル型で表現（[repository-contract](../api/api-design.md) 参照）。
- 日時は UTC ISO8601 文字列、ID は UUID v4。

## 構造 / 依存方向

- 依存は UI → services → domain / repository の一方向。domain（scoring/decisionEngine/urlNormalize）は I/O を持たない純関数。
- 画面・コンポーネントは DB / SQL を直接触らず Repository 経由（[implementation-patterns](../patterns/implementation-patterns.md)）。
- 投機的な抽象化を避ける。実際に使うパターンだけ追加する。

## 命名

- ファイル: コンポーネントは PascalCase、その他 camelCase。
- DB は snake_case（[schema](../database/schema.md)）、TS 層は camelCase。境界で変換。

## General

- 変更は小さく焦点を絞る。
- メタデータ欠損は通常ケースとして扱う（例外にしない）。
- ユーザー起因エラーのみ UI 表示。ネットワーク/OGP 失敗は非致命。

## UI Standards

- 速い保存・速い決定を最優先。一覧管理を主役にしない。
- 任意項目は有用になった時だけ求める（[product-overview](../domain/product-overview.md) §3）。
- 「決める」へ最短遷移。誤操作対策（スワイプ Undo 等）を入れる。

## 品質ゲート

- コミット前に lint / typecheck / test を通す（[testing](../testing/strategy.md)）。
- スコア重み等のチューニング値は `config/` に分離し、ロジックに直書きしない。
