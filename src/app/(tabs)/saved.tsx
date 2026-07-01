import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { localSqliteRepository } from "@/data/sqlite";
import type { Restaurant } from "@/domain/models";
import { Button } from "@/ui/Button";
import { StarRating } from "@/ui/StarRating";

/**
 * 保存タブ (docs/specs/home-and-decision-ux.md #保存タブ)。
 *
 * TODO(実装): 一覧をそのまま「決める」入力に変える。並べ替え(行きたい度/古い順/未訪問)・
 * 絞り込み(エリア/ジャンル)をスワイプ・ガチャへそのまま渡す。左スワイプでarchived=1。
 */
export default function SavedScreen() {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants", {}],
    queryFn: () => localSqliteRepository.restaurants.list({}),
  });

  return (
    <View style={styles.container}>
      <Button label="＋ お店を登録" onPress={() => router.push("/restaurant-form")} />
      {!isLoading && (restaurants?.length ?? 0) === 0 && (
        <Text style={styles.empty}>保存したお店はまだありません。</Text>
      )}
      <FlatList
        data={restaurants ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RestaurantRow restaurant={item} />}
      />
    </View>
  );
}

function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  const meta = [restaurant.genre, restaurant.area].filter(Boolean).join(" / ");

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id } })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{restaurant.name}</Text>
        {meta.length > 0 && <Text style={styles.rowMeta}>{meta}</Text>}
        <Text style={styles.rowDays}>{daysAgoLabel(restaurant.createdAt)}</Text>
      </View>
      <StarRating value={restaurant.desireLevel} size={14} />
    </Pressable>
  );
}

function daysAgoLabel(createdAt: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  );
  return days === 0 ? "今日保存" : `保存から${days}日`;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  empty: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 40 },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
  },
  rowMain: { gap: 4, flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowMeta: { fontSize: 13, color: "#6B7280" },
  rowDays: { fontSize: 12, color: "#9CA3AF" },
});
