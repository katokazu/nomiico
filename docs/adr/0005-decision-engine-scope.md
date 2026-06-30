# ADR 0005: 決定エンジンの MVP スコープ

## Status

Accepted (2026-06-29) ・ Amended (2026-06-30)

> **改訂 (2026-06-30):** ホーム/決定 UX の設計（[home-and-decision-ux](../specs/home-and-decision-ux.md)）で「みんなで（スマホ回し）」を採用したことに伴い、MVP スコープを再定義する。**判定軸は「単独か複数人か」ではなく「同一端末で完結するか／真の複数端末同期が要るか」**。1 台のスマホを回す投票制（`vote`）・順位制（`ranking`）は招待リンク・アカウント・同期サーバー不要で同一端末完結のため **MVP に含める**。下記「MVP で見送る」のうち端末間同期を前提とする `draft` と `tournament`（複数端末で並行）のみ将来へ残す。詳細は本文末尾「Amendment」を参照。

## Context

[product-overview](../domain/product-overview.md) は決定モードを 6 つ挙げる（gacha / swipe / draft / vote / tournament / roulette）。決定体験が本プロダクトの主役だが、ローカルファースト（[ADR 0002](0002-local-first-with-sync-seam.md)）ではサーバーを持たないため、複数端末をまたぐグループ決定は MVP では成立しない。

## Decision

**MVP は単独利用の決定モードに集中する。同一端末で完結するものに限定する。**

MVP に含む:

- **gacha**: 条件フィルタ → 重み付き抽選で 1 件提示。「もう一回」で再抽選。
- **swipe**: 候補カードを左右に振り分け、5〜10 件の最終候補集合を作る。
- **roulette / 最終決定**: swipe で絞った候補から 1 件をランダム確定。gacha の内部抽選と共通ロジック。

MVP で見送る（※下記 2 項目は 2026-06-30 Amendment で見直し。`vote` と単一端末回し決めは MVP に編入。末尾参照）:

- **draft / vote**: 複数人・複数端末の同期が要るためリモート導入後（[ADR 0002](0002-local-first-with-sync-seam.md)）。〔改訂: `vote` は 1 台を回す投票制として同期不要 → MVP へ。`draft` は据え置き〕
- **tournament**: 単独でも実装可能だが、MVP は gacha + swipe + roulette で「決める」が成立するため後続へ。〔改訂後も将来〕

抽選・スコアリングは端末内で同期的に行う（[scoring](../specs/scoring.md)）。

## Consequences

- 「今日どこ行く？」を単独で最後まで decide できる体験を最短で出せる。
- グループ系（みんなで決める）は UI 上「将来」として薄く見せるに留める。
- `decision_sessions.mode` の enum には将来モードも定義しておき、スキーマ変更なしで追加できるようにする。

## Alternatives Considered

- **6 モード全部**: スコープ過大。コア価値の検証が遅れる。却下。
- **gacha のみ**: 最小だが、swipe の「絞り込み → 確定」という決め方の楽しさを欠く。gacha + swipe + roulette を採用。

## Amendment (2026-06-30)

ホーム/決定 UX 設計でホーム主要 3 モードを **ガチャ / スワイプ / みんなで** とした（[home-and-decision-ux](../specs/home-and-decision-ux.md)）。これに合わせ MVP スコープを次のとおり改訂する。

MVP に含む（同一端末で完結）:

- **gacha / swipe / roulette**（当初どおり）。
- **vote（みんなで・投票制）**: 1 台のスマホを回し 1 人 1 票。得票で決定。
- **ranking（みんなで・順位制）**: 各自が候補に順位＝点を付け、全員ぶんの合計で決定。

いずれも招待リンク・アカウント・同期サーバー不要で、ローカルファースト（[ADR 0002](0002-local-first-with-sync-seam.md)）と矛盾しない。

将来へ残す（真の複数端末同期が前提）:

- **draft / tournament**: 複数端末で並行入力する形態はリモート導入後。

データモデルへの影響:

- `decision_sessions.mode` enum に `ranking` を追加（`vote` は既存）。
- `decision_sessions.participant_count`（回し決めの人数）を追加。
- `decision_candidates.tally`（得票数 / 順位点の合計）を追加。
- 詳細は [database/schema.md](../database/schema.md) / [decision-session model](../domain-models/decision-session.md) / [decide-flow](../specs/decide-flow.md)。

残る未決事項（[decide-flow](../specs/decide-flow.md)）: ranking の加点配分（上位 3/2/1 が有力）と vote 同票時の決着。
