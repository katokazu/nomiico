import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { bootstrapDatabase } from "@/data/sqlite/bootstrap";

const queryClient = new QueryClient();

/**
 * ルートレイアウト (docs/patterns/implementation-patterns.md #ルーティング)。
 * 永続データはTanStack Query経由でRepositoryを呼ぶ。
 * マイグレーション/owner初期化/システムタグシードが終わるまで画面を出さない。
 */
export default function RootLayout() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    bootstrapDatabase()
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, []);

  if (state !== "ready") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{state === "error" ? "初期化に失敗しました" : "準備中..."}</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="save"
          options={{ headerShown: true, title: "保存しました", presentation: "modal" }}
        />
        <Stack.Screen name="settings" options={{ headerShown: true, title: "設定" }} />
        <Stack.Screen
          name="restaurant-form"
          options={{ headerShown: true, title: "お店を登録", presentation: "modal" }}
        />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: true, title: "店舗詳細" }} />
        <Stack.Screen name="decide/gacha" options={{ headerShown: true, title: "ガチャ" }} />
        <Stack.Screen name="decide/swipe" options={{ headerShown: true, title: "スワイプ" }} />
        <Stack.Screen name="decide/together" options={{ headerShown: true, title: "みんなで" }} />
        <Stack.Screen name="decide/result" options={{ headerShown: true, title: "決定" }} />
      </Stack>
    </QueryClientProvider>
  );
}
