import { StyleSheet, Text, View } from "react-native";

/**
 * みんなで(投票制/順位制)。1台のスマホを回す、招待リンク・アカウント不要
 * (docs/specs/decide-flow.md #モード4みんなで回し決め)。
 *
 * TODO(実装): startSession('vote'|'ranking', filter, { participantCount })。
 * 投票制はcastVote、順位制はcastRankingで人数ぶん繰り返し、tally最大の店で決定。
 */
export default function TogetherScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>みんなで</Text>
      <Text style={styles.body}>1台のスマホを回して、投票または順位づけで決めます。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, color: "#4B5563" },
});
