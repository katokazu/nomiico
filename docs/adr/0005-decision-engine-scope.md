# ADR 0005: 決定エンジンの MVP スコープ

## Status

Accepted (2026-06-29)

## Context

[product-overview](../domain/product-overview.md) は決定モードを 6 つ挙げる（gacha / swipe / draft / vote / tournament / roulette）。決定体験が本プロダクトの主役だが、ローカルファースト（[ADR 0002](0002-local-first-with-sync-seam.md)）ではサーバーを持たないため、複数端末をまたぐグループ決定は MVP では成立しない。

## Decision

**MVP は単独利用の決定モードに集中する。同一端末で完結するものに限定する。**

MVP に含む:

- **gacha**: 条件フィルタ → 重み付き抽選で 1 件提示。「もう一回」で再抽選。
- **swipe**: 候補カードを左右に振り分け、5〜10 件の最終候補集合を作る。
- **roulette / 最終決定**: swipe で絞った候補から 1 件をランダム確定。gacha の内部抽選と共通ロジック。

MVP で見送る:

- **draft / vote**: 複数人・複数端末の同期が要るためリモート導入後（[ADR 0002](0002-local-first-with-sync-seam.md)）。
- **tournament**: 単独でも実装可能だが、MVP は gacha + swipe + roulette で「決める」が成立するため後続へ。

抽選・スコアリングは端末内で同期的に行う（[scoring](../specs/scoring.md)）。

## Consequences

- 「今日どこ行く？」を単独で最後まで decide できる体験を最短で出せる。
- グループ系（みんなで決める）は UI 上「将来」として薄く見せるに留める。
- `decision_sessions.mode` の enum には将来モードも定義しておき、スキーマ変更なしで追加できるようにする。

## Alternatives Considered

- **6 モード全部**: スコープ過大。コア価値の検証が遅れる。却下。
- **gacha のみ**: 最小だが、swipe の「絞り込み → 確定」という決め方の楽しさを欠く。gacha + swipe + roulette を採用。
