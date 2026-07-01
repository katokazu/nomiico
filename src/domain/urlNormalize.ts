import type { SourceType } from "./models";

/**
 * URL正規化 (docs/specs/save-flow.md #URL正規化)。
 * 重複判定キー(normalized_url)として使う。I/Oを持たない純関数。
 */

const TRACKING_PARAM_PREFIXES = ["utm_", "fbclid", "igshid", "gclid", "mc_cid", "mc_eid"];

function isTrackingParam(key: string): boolean {
  const lower = key.toLowerCase();
  return TRACKING_PARAM_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function normalizeUrl(input: string): string {
  const url = new URL(input);

  url.protocol = url.protocol.toLowerCase().replace("http:", "https:");

  const params = Array.from(url.searchParams.keys());
  for (const key of params) {
    if (isTrackingParam(key)) {
      url.searchParams.delete(key);
    }
  }
  url.hash = "";

  let result = url.toString();
  if (result.endsWith("/") && url.pathname !== "/") {
    result = result.slice(0, -1);
  }
  return result;
}

const SOURCE_TYPE_HOST_RULES: { match: (host: string) => boolean; type: SourceType }[] = [
  { match: (host) => host.includes("instagram.com"), type: "instagram" },
  {
    match: (host) =>
      /google\..+\/maps/.test(host) || host.includes("maps.app.goo.gl") || host.includes("goo.gl"),
    type: "googlemap",
  },
  { match: (host) => host.includes("tabelog.com"), type: "tabelog" },
  { match: (host) => host.includes("line.me") || host.includes("lin.ee"), type: "line" },
];

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i;

/**
 * テキストに含まれる最初の有効なURLを抽出する (docs/specs/save-flow.md #エントリポイント3)。
 * 複数URLを含むテキストは最初の1件のみ採用する(docs/specs/save-flow.md #エッジケース)。
 */
export function extractFirstUrl(text: string): string | undefined {
  const match = text.match(URL_PATTERN);
  if (!match) {
    return undefined;
  }
  try {
    // 末尾の全角・半角句読点はURLの一部でないことが多いため取り除く
    const trimmed = match[0].replace(/[)\]}、。」』.,!?]+$/, "");
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

/** ホスト名ベースでsource_typeを判定 (docs/specs/save-flow.md #source_type判定)。 */
export function detectSourceType(sourceUrl: string | undefined): SourceType {
  if (!sourceUrl) {
    return "manual";
  }

  let host: string;
  let full: string;
  try {
    const url = new URL(sourceUrl);
    host = url.hostname.toLowerCase();
    full = (host + url.pathname).toLowerCase();
  } catch {
    return "web";
  }

  for (const rule of SOURCE_TYPE_HOST_RULES) {
    if (rule.match(full)) {
      return rule.type;
    }
  }
  return "web";
}
