import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient();

/**
 * ルートレイアウト (docs/patterns/implementation-patterns.md #ルーティング)。
 * 永続データはTanStack Query経由でRepositoryを呼ぶ。
 */
export default function RootLayout() {
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
