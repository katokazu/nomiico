import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";

/**
 * 保存タブ (docs/specs/home-and-decision-ux.md #保存タブ)。
 *
 * TODO(実装): 一覧をそのまま「決める」入力に変える。並べ替え(行きたい度/古い順/未訪問)・
 * 絞り込み(エリア/ジャンル)をスワイプ・ガチャへそのまま渡す。左スワイプでarchived=1。
 */
export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Button label="＋ お店を登録" onPress={() => router.push("/restaurant-form")} />
      <Text style={styles.empty}>保存したお店はまだありません。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  empty: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 40 },
});
