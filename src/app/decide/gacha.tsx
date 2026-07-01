import { StyleSheet, Text, View } from "react-native";

/**
 * ガチャモード (docs/specs/decide-flow.md #モード1ガチャ)。
 *
 * TODO(実装): エリア/ジャンル/人数/シーン/予算のフィルタ→pickCandidates→scoreCandidates→
 * weightedRandomPick(@/domain/decisionEngine)で1件抽選。「もう一回」はrerollPick。
 */
export default function GachaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ガチャ</Text>
      <Text style={styles.body}>条件を選んで、今日の一店を抽選します。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, color: "#4B5563" },
});
