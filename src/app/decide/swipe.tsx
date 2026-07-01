import { StyleSheet, Text, View } from "react-native";

/**
 * スワイプモード (docs/specs/decide-flow.md #モード2スワイプ)。
 *
 * TODO(実装): startSession('swipe', filter)でキュー化→recordSwipeを1件ずつ記録。
 * Undo(直前のスワイプを1回戻す)に対応する。5〜10件さばいたらkeptCandidatesで結果へ。
 */
export default function SwipeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>スワイプ</Text>
      <Text style={styles.body}>候補を左右に振り分けて、最終候補を絞り込みます。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, color: "#4B5563" },
});
