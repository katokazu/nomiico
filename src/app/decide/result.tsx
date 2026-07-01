import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";

/**
 * 決定結果(共通)。主アクションは外部マップを開く (docs/specs/decide-flow.md #完了後go)。
 *
 * TODO(実装): decisionRepository.completeでdecided_restaurant_id確定→last_suggested_at更新。
 * source_urlがGoogleマップ形式ならマップアプリ、それ以外はブラウザで開く(http/httpsのみ、
 * docs/standards/security.md #c外部遷移)。
 */
export default function DecideResultScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ここに決まりました</Text>
      <Button label="地図で開く" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
});
