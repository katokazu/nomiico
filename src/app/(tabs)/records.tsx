import { StyleSheet, Text, View } from "react-native";

/**
 * 記録タブ「思い出」(docs/specs/home-and-decision-ux.md #記録タブ思い出)。
 *
 * TODO(実装): 訪問(Visit)を月別タイムラインで表示する。管理表ではなく思い出として積もる場所。
 * 0件のときは入力を急かさず「今日の一店を見る」へ誘導する。
 */
export default function RecordsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>記録はまだありません。行ったお店の思い出がここに残ります。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  empty: { fontSize: 14, color: "#6B7280", textAlign: "center" },
});
