import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";

/**
 * ホーム「今日の一店」(docs/adr/0006-home-as-daily-pick.md, docs/specs/home-and-decision-ux.md)。
 *
 * TODO(実装): 起動時に保存済み・未アーカイブ母数からscoreCandidates→1件抽選して表示する。
 * 「今日はここにする」→ decide/result、「スキップ」→ last_suggested_at更新して即差し替え。
 * 未記録の決定セッションがあれば上部に記録うながしバナーを出す。
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>今日の一店</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>まだ保存がありません</Text>
        <Text style={styles.cardBody}>
          お店を保存すると、ここに今日行くべき一店が抽選で表示されます。
        </Text>
      </View>
      <View style={styles.modes}>
        <Text style={styles.modesLabel}>気分で選ぶ</Text>
        <View style={styles.modeButtons}>
          <Button label="ガチャ" variant="secondary" onPress={() => router.push("/decide/gacha")} />
          <Button label="スワイプ" variant="secondary" onPress={() => router.push("/decide/swipe")} />
          <Button label="みんなで" variant="secondary" onPress={() => router.push("/decide/together")} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  eyebrow: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  card: { backgroundColor: "#F3F4F6", borderRadius: 16, padding: 20, gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: "700" },
  cardBody: { fontSize: 14, color: "#4B5563" },
  modes: { gap: 8 },
  modesLabel: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  modeButtons: { flexDirection: "row", gap: 8 },
});
