import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { localSqliteRepository } from "@/data/sqlite";
import type { Restaurant } from "@/domain/models";
import { ValidationError, saveManual, updateManual } from "@/services/saveService";
import { Button } from "@/ui/Button";
import { StarRating } from "@/ui/StarRating";

/**
 * 手動登録/編集の共通フォーム (docs/specs/home-and-decision-ux.md #手動登録編集フォーム)。
 * 保存タブの「＋」、保存完了画面の「詳細を追加する」、店舗詳細の「編集」から共通で開く。
 * 店名のみ必須、URL/ジャンル/エリア/予算は任意(docs/specs/save-flow.md)。
 * idクエリがあれば編集、無ければ新規登録。
 */

const GENRE_PRESETS = ["焼肉", "焼鳥", "ラーメン", "カフェ", "居酒屋"];

export default function RestaurantFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existingQuery = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => localSqliteRepository.restaurants.findById(id as string),
    enabled: !!id,
  });

  if (id && existingQuery.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  // idありでexistingが見つからない(削除済み等)場合も新規入力として続行する。
  return <RestaurantFormBody id={id} initial={existingQuery.data ?? null} />;
}

function RestaurantFormBody({ id, initial }: { id?: string; initial: Restaurant | null }) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(initial?.name ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [desireLevel, setDesireLevel] = useState(initial?.desireLevel ?? 3);
  const [genre, setGenre] = useState(initial?.genre ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [priceRange, setPriceRange] = useState(initial?.priceRange ?? "");

  const mutation = useMutation({
    mutationFn: () => {
      const input = {
        name,
        sourceUrl: sourceUrl.trim() || undefined,
        desireLevel,
        genre,
        area,
        priceRange,
      };
      return id
        ? updateManual(localSqliteRepository.restaurants, id, input)
        : saveManual(localSqliteRepository.restaurants, input);
    },
    onSuccess: (restaurant) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", restaurant.id] });
      router.back();
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        Alert.alert("入力エラー", error.message);
        return;
      }
      Alert.alert("保存に失敗しました", "しばらくしてからもう一度お試しください。");
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{id ? "お店を編集" : "お店を登録"}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>店名</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例: 大衆酒場 ことぶき"
            autoFocus={!id}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            URL <Text style={styles.optional}>任意</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={sourceUrl}
            onChangeText={setSourceUrl}
            placeholder="https://… 共有元のリンク"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>行きたい度</Text>
          <StarRating value={desireLevel} onChange={setDesireLevel} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            ジャンル <Text style={styles.optional}>任意</Text>
          </Text>
          <View style={styles.chips}>
            {GENRE_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => setGenre(genre === preset ? "" : preset)}
                style={[styles.chip, genre === preset && styles.chipOn]}
              >
                <Text style={[styles.chipLabel, genre === preset && styles.chipLabelOn]}>
                  {preset}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={genre}
            onChangeText={setGenre}
            placeholder="その他のジャンルを入力"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            エリア <Text style={styles.optional}>任意</Text>
          </Text>
          <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="例: 渋谷" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            予算 <Text style={styles.optional}>任意</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={priceRange}
            onChangeText={setPriceRange}
            placeholder="例: 3000円"
          />
        </View>

        <Text style={styles.hint}>
          エリア・ジャンル・予算は後からでもOK。まず保存して、決めるとき・行ったときに育てましょう。
        </Text>

        <Button
          label={id ? "変更を保存" : "このお店を保存"}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  container: { padding: 20, gap: 18 },
  title: { fontSize: 20, fontWeight: "700" },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  optional: { fontSize: 12, color: "#9CA3AF", fontWeight: "400" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: "#208AEF", borderColor: "#208AEF" },
  chipLabel: { fontSize: 13, color: "#374151" },
  chipLabelOn: { color: "#FFFFFF", fontWeight: "600" },
  hint: { fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
});
