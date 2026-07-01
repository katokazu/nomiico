import type { RestaurantRepository, SettingsRepository } from "@/data/repository";

/**
 * 思い出す/リサーフェシング (docs/specs/resurfacing.md)。
 * 端末ローカルのスケジュール通知(expo-notifications)のみを使う。サーバーPushは無い。
 *
 * ひな型段階のため未実装。実装時は次の順で埋める:
 * 1. settings.getSettings()で通知ON/OFF・時間帯・上限・寝かせ日数を取得
 * 2. restaurants.pickCandidates→scoreCandidatesで上位N件を選定(直近提案は除外気味に)
 * 3. expo-notificationsで直近N件のみ先行スケジュール
 * 4. アプリ起動/フォアグラウンド復帰時に再評価して入れ替え
 */
export interface ResurfacingDeps {
  restaurants: RestaurantRepository;
  settings: SettingsRepository;
}

export async function scheduleReminders(_deps: ResurfacingDeps): Promise<void> {
  throw new Error("not implemented: resurfacing.scheduleReminders");
}
