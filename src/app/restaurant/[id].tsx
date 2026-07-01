import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/**
 * 店舗詳細 (docs/specs/home-and-decision-ux.md #店舗詳細)。
 *
 * TODO(実装): findByIdで全データ表示。行きたい度はその場で変更可。訪問履歴一覧。
 * 主アクション「ここにする(行く)」、従アクションに「編集」「アーカイブ」「連携元を開く」。
 */
export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>店舗詳細</Text>
      <Text style={styles.body}>id: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, color: "#4B5563" },
});
