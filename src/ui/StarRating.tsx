import { Pressable, StyleSheet, Text, View } from "react-native";

interface StarRatingProps {
  value: number; // 1..5
  onChange?: (value: number) => void; // 省略時は表示のみ
  size?: number;
}

/** 行きたい度(1..5)の表示/変更 (docs/specs/save-flow.md #保存完了画面, #手動登録編集フォーム)。 */
export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) =>
        onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={4}>
            <Text style={{ fontSize: size }}>{star <= value ? "★" : "☆"}</Text>
          </Pressable>
        ) : (
          <Text key={star} style={{ fontSize: size }}>
            {star <= value ? "★" : "☆"}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});
