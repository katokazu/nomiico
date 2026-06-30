# ADRインデックス

ADR（アーキテクチャ判断記録）は、繰り返し再検討すべきでない判断を記録します。

## 記録

- [0001-platform-expo-react-native.md](0001-platform-expo-react-native.md): Expo / React Native でモバイル実装
- [0002-local-first-with-sync-seam.md](0002-local-first-with-sync-seam.md): ローカル SQLite ファースト + 将来同期シーム
- [0003-anonymous-auth-upgrade.md](0003-anonymous-auth-upgrade.md): 匿名ローカルユーザー → 任意昇格
- [0004-metadata-extraction-strategy.md](0004-metadata-extraction-strategy.md): OGP + 連携元保存 + 手動補完
- [0005-decision-engine-scope.md](0005-decision-engine-scope.md): 決定エンジンの MVP スコープ（gacha / swipe / roulette + 単一端末回し決めの vote / ranking。2026-06-30 改訂）
- [0006-home-as-daily-pick.md](0006-home-as-daily-pick.md): ホームをスコアリング抽選の「今日の一店」にする

## テンプレート

新しい記録には [template.md](template.md) を使ってください。

## 命名

番号付きのファイル名を使ってください。

```text
0001-short-title.md
0002-short-title.md
```
