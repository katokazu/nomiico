import { Link, Tabs } from "expo-router";
import { Pressable, Text } from "react-native";

/**
 * タブは ホーム/保存/記録 の3つを維持する (docs/adr/0006-home-as-daily-pick.md)。
 * 設定はタブを増やさずホーム右上の歯車から入る。
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          headerShown: true,
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable hitSlop={12}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen name="saved" options={{ title: "保存" }} />
      <Tabs.Screen name="records" options={{ title: "記録" }} />
    </Tabs>
  );
}
