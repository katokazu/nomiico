import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useShareIntentContext, type ShareIntent } from "expo-share-intent";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { localSqliteRepository } from "@/data/sqlite";
import { saveFromShareIntent, type SaveFromUrlResult } from "@/services/saveService";
import { Button } from "@/ui/Button";
import { StarRating } from "@/ui/StarRating";

/**
 * 保存完了画面 (docs/specs/save-flow.md #ux-flow共有シート)。
 * 共有シート/テキスト内URLからの保存後に表示する。行きたい度のみその場で調整可能。
 * INSERTは共有受信直後に即完了させ、この画面はその結果を提示するだけ(体感3秒以内)。
 */
export default function SaveCompleteScreen() {
  const { isReady, hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);
  const [result, setResult] = useState<SaveFromUrlResult | null>(null);

  const saveMutation = useMutation({
    mutationFn: (intent: ShareIntent) =>
      saveFromShareIntent(localSqliteRepository.restaurants, {
        type: intent.type,
        webUrl: intent.webUrl,
        text: intent.text,
        files: intent.files?.map((file) => ({ path: file.path })) ?? null,
      }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      resetShareIntent();
    },
  });

  useEffect(() => {
    if (hasShareIntent && !startedRef.current) {
      startedRef.current = true;
      saveMutation.mutate(shareIntent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent]);

  const desireLevelMutation = useMutation({
    mutationFn: (level: number) =>
      localSqliteRepository.restaurants.update(result!.restaurant.id, { desireLevel: level }),
    onSuccess: (restaurant) => {
      setResult((prev) => (prev ? { ...prev, restaurant } : prev));
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });

  if (isReady && !hasShareIntent && !result && !saveMutation.isPending && !saveMutation.isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>共有データがありません</Text>
        <Text style={styles.body}>他のアプリの共有メニューからこの画面を開いてください。</Text>
        <Button label="閉じる" onPress={() => router.replace("/(tabs)")} />
      </View>
    );
  }

  if (saveMutation.isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>保存に失敗しました</Text>
        <Button label="閉じる" onPress={() => router.replace("/(tabs)")} />
      </View>
    );
  }

  if (!isReady || saveMutation.isPending || !result) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={styles.body}>保存しています…</Text>
      </View>
    );
  }

  const { restaurant, isNew } = result;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isNew ? "保存しました" : "すでに保存済みです"}</Text>
      <Text style={styles.name}>{restaurant.name}</Text>
      <View style={styles.desireRow}>
        <Text style={styles.label}>行きたい度</Text>
        <StarRating
          value={restaurant.desireLevel}
          onChange={(level) => desireLevelMutation.mutate(level)}
        />
      </View>
      <Button
        label="詳細を追加する"
        variant="secondary"
        onPress={() =>
          router.push({ pathname: "/restaurant-form", params: { id: restaurant.id } })
        }
      />
      <Button label="閉じる" onPress={() => router.replace("/(tabs)")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 16, color: "#4B5563" },
  label: { fontSize: 14, color: "#374151" },
  desireRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});
