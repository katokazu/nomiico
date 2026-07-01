import type { RestaurantRepository } from "@/data/repository";
import type { Restaurant, SaveRestaurantInput, SourceType } from "@/domain/models";
import { detectSourceType, normalizeUrl } from "@/domain/urlNormalize";

import { fetchOgp } from "./ogp";

/**
 * 保存フロー (docs/specs/save-flow.md)。
 * URL正規化→重複判定→即時INSERT→バックグラウンドOGP取得→後追いUPDATE。
 * 保存は体感3秒以内に完了し、メタデータ取得の成否に依存しない。
 */

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

function provisionalName(sourceUrl: string): string {
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    return `${host} の店`;
  } catch {
    return "保存した店";
  }
}
