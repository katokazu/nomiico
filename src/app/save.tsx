import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";

/**
 * 保存完了画面 (docs/specs/save-flow.md #ux-flow共有シート)。
 * 共有シート/テキスト内URLからの保存後に表示する。行きたい度のみその場で調整可能。
 *
 * TODO(実装): expo-share-intentで受けたURLをsaveService.saveFromUrlへ渡す。
 * OGP取得は非同期。取得できた項目のみ後追いで名前/画像を差し替える。
 */
export default function SaveCompleteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>保存しました</Text>
      <Text style={styles.body}>行きたい度: ★★★☆☆</Text>
      <Button label="詳細を追加する" variant="secondary" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  body: { fontSize: 16 },
});
