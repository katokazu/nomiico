import type { RestaurantRepository } from "@/data/repository";
import type { Restaurant, SaveRestaurantInput, SourceType } from "@/domain/models";
import { detectSourceType, extractFirstUrl, normalizeUrl } from "@/domain/urlNormalize";

import { fetchOgp } from "./ogp";

/**
 * 保存フロー (docs/specs/save-flow.md)。
 * URL正規化→重複判定→即時INSERT→バックグラウンドOGP取得→後追いUPDATE。
 * 保存は体感3秒以内に完了し、メタデータ取得の成否に依存しない。
 */

/** ユーザー起因の入力エラー(店名未入力など)。UI表示用 (docs/standards/coding.md #エラーハンドリング)。 */
export class ValidationError extends Error {}

export interface SaveFromUrlResult {
  restaurant: Restaurant;
  isNew: boolean;
}

export async function saveFromUrl(
  restaurantRepository: RestaurantRepository,
  url: string,
  sourceTypeHint?: SourceType,
): Promise<SaveFromUrlResult> {
  const normalizedUrl = normalizeUrl(url);

  const existing = await restaurantRepository.findByNormalizedUrl(normalizedUrl);
  if (existing) {
    return { restaurant: existing, isNew: false };
  }

  const input: SaveRestaurantInput = {
    name: provisionalName(url),
    sourceUrl: url,
    sourceType: sourceTypeHint ?? detectSourceType(url),
  };
  const created = await restaurantRepository.create(input);

  // 保存自体をブロックしない。OGP取得の成否に関わらず保存は成立している(正常系)。
  void fetchOgp(url)
    .then((ogp) => {
      if (!ogp) return undefined;
      return restaurantRepository.update(created.id, {
        name: ogp.title ?? created.name,
        thumbnailUrl: ogp.imageUrl ?? created.thumbnailUrl,
      });
    })
    .catch(() => undefined);

  return { restaurant: created, isNew: true };
}

/** 手動登録/編集フォームの入力 (docs/specs/home-and-decision-ux.md #手動登録編集フォーム)。店名のみ必須。 */
export interface ManualFormInput {
  name: string;
  sourceUrl?: string;
  desireLevel?: number;
  genre?: string;
  area?: string;
  priceRange?: string;
}

function validatedManualPatch(input: ManualFormInput) {
  const name = input.name.trim();
  if (!name) {
    throw new ValidationError("店名を入力してください");
  }
  const sourceUrl = input.sourceUrl?.trim() || undefined;
  return {
    name,
    sourceUrl,
    desireLevel: input.desireLevel,
    genre: input.genre?.trim() || undefined,
    area: input.area?.trim() || undefined,
    priceRange: input.priceRange?.trim() || undefined,
  };
}

/** 手動登録 (docs/specs/save-flow.md #エントリポイント2)。店名必須、他は任意で保存をブロックしない。 */
export async function saveManual(
  restaurantRepository: RestaurantRepository,
  input: ManualFormInput,
): Promise<Restaurant> {
  const patch = validatedManualPatch(input);
  const created = await restaurantRepository.create({
    name: patch.name,
    sourceUrl: patch.sourceUrl,
    sourceType: patch.sourceUrl ? detectSourceType(patch.sourceUrl) : "manual",
    desireLevel: patch.desireLevel,
  });

  if (patch.genre || patch.area || patch.priceRange) {
    return restaurantRepository.update(created.id, {
      genre: patch.genre,
      area: patch.area,
      priceRange: patch.priceRange,
    });
  }
  return created;
}

/** 手動登録/編集フォームの共通編集処理。 */
export async function updateManual(
  restaurantRepository: RestaurantRepository,
  id: string,
  input: ManualFormInput,
): Promise<Restaurant> {
  const patch = validatedManualPatch(input);
  return restaurantRepository.update(id, patch);
}

/** 共有シートで受信したデータ (expo-share-intentのShareIntentから必要な部分だけ抜粋)。 */
export interface ShareIntentInput {
  type: "media" | "file" | "text" | "weburl" | null;
  webUrl?: string | null;
  text?: string | null;
  files?: { path: string }[] | null;
}

/**
 * 共有シート受信の分岐 (docs/specs/save-flow.md #エントリポイント)。
 * URL(直接 or 本文中)があればsaveFromUrlへ、画像のみはscreenshotとしてサムネイル保存、
 * それ以外はテキストを暫定名としてmanual保存する(店名未入力は「名称未設定」のまま正常系)。
 */
export async function saveFromShareIntent(
  restaurantRepository: RestaurantRepository,
  share: ShareIntentInput,
): Promise<SaveFromUrlResult> {
  const url = share.webUrl ?? extractFirstUrl(share.text ?? "");
  if (url) {
    return saveFromUrl(restaurantRepository, url);
  }

  if (share.files && share.files.length > 0) {
    const created = await restaurantRepository.create({
      name: "スクリーンショットの店",
      sourceType: "screenshot",
    });
    const updated = await restaurantRepository.update(created.id, {
      thumbnailUrl: share.files[0].path,
    });
    return { restaurant: updated, isNew: true };
  }

  const created = await restaurantRepository.create({
    name: share.text?.trim() || undefined,
    sourceType: "manual",
  });
  return { restaurant: created, isNew: true };
}

function provisionalName(sourceUrl: string): string {
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    return `${host} の店`;
  } catch {
    return "保存した店";
  }
}
