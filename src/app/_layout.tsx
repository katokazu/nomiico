import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { bootstrapDatabase } from "@/data/sqlite/bootstrap";

const queryClient = new QueryClient();

/**
 * ルートレイアウト (docs/patterns/implementation-patterns.md #ルーティング)。
 * 永続データはTanStack Query経由でRepositoryを呼ぶ。
 * マイグレーション/owner初期化/システムタグシードが終わるまで画面を出さない。
 * ShareIntentProviderで共有シート受信を検知し、保存完了画面(save)へ誘導する
 * (docs/specs/save-flow.md #エントリポイント1)。
 */
export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <RootLayoutNav />
    </ShareIntentProvider>
  );
}

function RootLayoutNav() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    bootstrapDatabase()
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    if (state === "ready" && hasShareIntent) {
      router.push("/save");
    }
  }, [state, hasShareIntent]);

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
