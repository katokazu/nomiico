import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/**
 * 手動登録/編集の共通フォーム (docs/specs/home-and-decision-ux.md #手動登録編集フォーム)。
 * 保存タブの「＋」、保存完了画面の「詳細を追加する」、店舗詳細の「編集」から共通で開く。
 *
 * TODO(実装): 店名のみ必須、URL/ジャンル/エリア/予算/タグは任意(docs/specs/save-flow.md)。
 * idクエリがあれば編集、無ければ新規登録。
 */
export default function RestaurantFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id ? "お店を編集" : "お店を登録"}</Text>
      <Text style={styles.body}>店名だけ入力すれば保存できます。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, color: "#4B5563" },
});
