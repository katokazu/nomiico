# MVP Spec

## Goal

Make it possible to save restaurants and decide one place to go today from saved candidates.

## In Scope

- Save a restaurant from a shared URL or manual entry
- Store basic restaurant information
- Show saved restaurants
- Mark visited / unvisited
- Set desire level
- Filter by basic conditions
- Decide via gacha mode
- Narrow candidates via swipe mode

## Out Of Scope

- Full Google Maps import（API 直接連携。ただし軽量版の CSV インポートは MVP 直後の初期拡張で実施 → [csv-import](csv-import.md)）
- Full Instagram import
- Reservation flow
- Social feed
- Advanced AI concierge
- Complex automatic tagging
- Large-scale recommendation infrastructure

## Success Criteria

- A user can save a candidate quickly.
- A user can open the app and reach a decision without managing a list first.
- A user can record at least a minimal post-visit evaluation.

## Decisions (旧 Open Questions)

- **Which platform first?** → モバイル（Expo / React Native）([ADR 0001](../adr/0001-platform-expo-react-native.md))。
- **Which source URL types?** → instagram / googlemap / tabelog / line / web / screenshot / manual を `source_type` として受理。判定規則は [save-flow](save-flow.md)。
- **How much metadata extraction for MVP?** → OGP ベストエフォート + 連携元 URL 保存 + 手動補完。Google API 不使用、失敗しても URL は保存([ADR 0004](../adr/0004-metadata-extraction-strategy.md))。

## Architecture Summary

- データ: 端末ローカル SQLite ファースト、将来 Supabase 同期シーム([ADR 0002](../adr/0002-local-first-with-sync-seam.md))。
- 認証: 匿名ローカル → 任意昇格([ADR 0003](../adr/0003-anonymous-auth-upgrade.md))。
- 決定モード: gacha / swipe / roulette（グループ系は後続、[ADR 0005](../adr/0005-decision-engine-scope.md)）。

## 詳細仕様

- [save-flow.md](save-flow.md): 保存（共有/手動/OGP/重複）
- [decide-flow.md](decide-flow.md): 決定モード
- [scoring.md](scoring.md): 「今行くべき」スコア
- [resurfacing.md](resurfacing.md): 思い出す通知
- [csv-import.md](csv-import.md): CSV 一括取り込み（MVP 直後の初期拡張）

