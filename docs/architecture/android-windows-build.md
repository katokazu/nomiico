# Windows での Android ローカルビルド

Windows 環境で Android 実機にネイティブビルドをインストールして確認するための、開発マシン側のセットアップ手順と既知の問題への対処法。`android/` は Continuous Native Generation（CNG）方式で `.gitignore` 対象のため、このドキュメントが唯一の手順書になる。

## 前提

- Android Studio がインストール済み（Android SDK と JBR（バンドル JDK）を利用する）
- Android SDK に `platform-tools` / `platforms`（`compileSdk` 以上）/ `build-tools` / NDK が導入済み
- 実機を使う場合は USB デバッグを有効化した Android 端末（[docs/architecture/tech-stack.md](tech-stack.md) の通り MVP はネイティブビルド必須。Expo Go では Share Extension 等が動かない）

## 1. 環境変数

Gradle / CMake の呼び出し元が正しい JDK と SDK を見つけられるよう、ユーザー環境変数として永続化する。

| 変数 | 値の例 |
|---|---|
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr`（Android Studio 同梱の JDK 17。システムの Java がそれより新しい/古いバージョンの場合、そちらを使うと Gradle が壊れることがあるため必ずこちらを指定する） |
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | `%LOCALAPPDATA%\Android\Sdk` |
| `Path` に追加 | `%ANDROID_HOME%\platform-tools`（`adb` 用）, `%JAVA_HOME%\bin` |

PowerShell（管理者権限不要、ユーザースコープ）:

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "$env:LOCALAPPDATA\Android\Sdk", "User")
# Path に platform-tools と JAVA_HOME\bin を追記(既存 Path は保持すること)
```

設定後は新しいターミナルを開かないと反映されない。

## 2. `android/local.properties`

`npx expo prebuild` は `local.properties` を自動生成しないことがあるため、`android/` 生成後に手動で用意する（`.gitignore` 対象、マシンごとに必要）。

```properties
sdk.dir=C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
```

## 3. ビルド手順

```powershell
npm install
npx expo prebuild --platform android   # android/ を生成(既存の場合は --clean で再生成)
cd android
.\gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
```

- `-PreactNativeArchitectures=arm64-v8a` で実機の ABI のみに絞ると、4 ABI 全部（`armeabi-v7a,arm64-v8a,x86,x86_64`、`android/gradle.properties` の既定値）を毎回ビルドするより大幅に速い。配布用ビルドではこのフラグを外す。
- 生成物: `android/app/build/outputs/apk/debug/app-debug.apk`

### 実機へのインストール

```powershell
adb devices -l          # 実機が device として見えることを確認(unauthorized なら端末側で許可)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.katokazu.nomiico/.MainActivity
```

`npx expo run:android` でも同等のビルド→インストール→起動が一括で行える（`package.json` の `android` スクリプトはこちらを指す。`expo start --android` は Expo Go 起動のみでネイティブモジュールを含むフルビルドにはならないので使わない）。

## 4. 既知の問題: ninja の "manifest still dirty" ループ（Windows 固有）

### 症状

`gradlew assembleDebug` が `expo-modules-core` / `react-native-reanimated` などネイティブモジュールの `buildCMakeDebug` で以下のように失敗する。ログには `[1/2] Re-running CMake...` が延々と繰り返された末に失敗が出る。

```
C/C++: ninja: error: manifest 'build.ninja' still dirty after 100 tries
> Task :expo-modules-core:buildCMakeDebug[arm64-v8a] FAILED
```

パスを短くしても（`subst` で短いドライブ文字にマッピングしても）再現する。これは AGP/CMake がプロジェクトパスを正規化（`File.getCanonicalPath()` 相当）する際に `subst` の仮想ドライブを実体パスへ解決し直すため、`subst` では実質的にパス長が短縮されないことが原因。`git worktree` で深い階層に配置されたプロジェクトほど発生しやすい。

### 原因

Android SDK に同梱される CMake 3.22.1 が使う `ninja.exe` が **1.10.2** と古く、Windows の長いパスを正しく扱えないバグがある。React Native / Reanimated 公式ドキュメントでも既知の問題として挙げられている。

- [ninja: error: manifest 'build.ninja' still dirty after 100 tries · Issue #22444 · expo/expo](https://github.com/expo/expo/issues/22444)
- [Building for Android on Windows | React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows/)

### 対処

Android SDK 同梱の `ninja.exe` を新しいバージョン（1.12 以降。確認済みは 1.13.2）に差し替える。元ファイルはバックアップしておく。

```powershell
# ninja-build の GitHub Releases から Windows 版 zip を取得して展開後
$cmakeBin = "$env:LOCALAPPDATA\Android\Sdk\cmake\3.22.1\bin"
Copy-Item "$cmakeBin\ninja.exe" "$cmakeBin\ninja.exe.orig" -ErrorAction SilentlyContinue
Copy-Item ".\ninja.exe" "$cmakeBin\ninja.exe" -Force
```

差し替え後は壊れた `.cxx` キャッシュを削除してから再ビルドする。

```powershell
Remove-Item -Recurse -Force node_modules\expo-modules-core\android\.cxx, `
  node_modules\react-native-gesture-handler\android\.cxx, `
  node_modules\react-native-reanimated\android\.cxx, `
  node_modules\react-native-screens\android\.cxx, `
  node_modules\react-native-worklets\android\.cxx, `
  android\app\.cxx -ErrorAction SilentlyContinue
```

注意: この差し替えは Android SDK 内のファイルを直接書き換えるマシン固有の対処。SDK Manager で CMake コンポーネントを再インストール/修復すると元の 1.10.2 に戻るため、再発したら同じ手順で差し替え直す。

### 試したが効果がなかった対処

- `subst` での短いドライブ文字へのマッピング（上記の理由により根本解決にならない）
- `--no-parallel` によるモジュールの逐次ビルド（競合が原因ではなかった。ただし切り分けの過程で有用だった）
