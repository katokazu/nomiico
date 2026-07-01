import { StyleSheet, Text, View } from "react-native";

/**
 * 設定画面 (docs/specs/home-and-decision-ux.md #設定とその入口)。
 * ホーム右上の歯車から入る(タブは増やさない)。
 *
 * TODO(実装): 通知(ON/OFF・時間帯・頻度)、データ(CSV取り込み・エクスポート)、
 * アカウント連携(MVPは将来プレースホルダのみ)、アプリ情報。
 */
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.section}>通知</Text>
      <Text style={styles.section}>データ</Text>
      <Text style={styles.section}>アカウント連携</Text>
      <Text style={styles.section}>アプリ情報</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  section: { fontSize: 16, fontWeight: "600" },
});
