# 画面モック一覧

ブラウザで開いて確認するHTMLモック。ビジュアルはB案リファイン（エディトリアル型ヒーローカード）を共通の基礎にしている。
方針の文章は [docs/specs/home-and-decision-ux.md](../docs/specs/home-and-decision-ux.md)、判断記録は [docs/adr/0006-home-as-daily-pick.md](../docs/adr/0006-home-as-daily-pick.md)。

## 採用モック

| ファイル | 内容 |
|---|---|
| [home-B-refined.html](home-B-refined.html) | ホーム単体（今日の一店）のビジュアル基礎 |
| [home-flow.html](home-flow.html) | 主動線：保存 → 思い出す → 決める（ガチャ/スワイプ/みんなで）→ 行く → 記録 |
| [saved-record-skip.html](saved-record-skip.html) | 保存タブ（決める入力化・寝かせ再浮上・アーカイブ）/ 記録タブ（思い出）/ スキップ後の挙動 |
| [detail-input-settings.html](detail-input-settings.html) | 店舗詳細 / 手動登録・編集 / 設定とその入口 / 通知許可 / 空状態（コールドスタート・スワイプ0件） |

## 検討過程（参考）

| ファイル | 内容 |
|---|---|
| [home-daily-pick.html](home-daily-pick.html) | ホーム案の比較検討（今日の一店に至る過程） |
| [home-screen.html](home-screen.html) | ホーム初期案 |

## 共通の約束

- 表示データは**アプリ内にあるものだけ**（天気・現在地・AI推論文を使わない）。
- 各画面は**スクロールなし**で主要部が収まる。
- タブは **ホーム / 保存 / 記録** の3つ。設定はホーム右上の歯車から。
- 入力は必要になるまで求めない（手動登録は店名のみ必須）。
