/**
 * OGP取得 (docs/specs/save-flow.md #ogp取得非同期ベストエフォート)。
 * SSRF対策 (docs/standards/security.md #a-ogp取得の安全策必須):
 * スキームallowlist / プライベートIP拒否 / サイズ上限 / タイムアウト / Content-Type限定。
 *
 * 既知の制約: RN環境からはDNS解決結果を直接検査できないため、ホスト名パターンでの
 * ベストエフォート判定に留まる。厳密なSSRF対策は将来のサーバー/Edge Function移設で
 * 一元化する(docs/standards/security.md #改善提案3)。
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const MAX_RESPONSE_CHARS = 2 * 1024 * 1024; // 約2MB相当
const FETCH_TIMEOUT_MS = 5000;

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
];

export function isAllowedProtocol(url: URL): boolean {
  return ALLOWED_PROTOCOLS.has(url.protocol);
}

export function isPrivateHostname(hostname: string): boolean {
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

export interface OgpResult {
  title?: string;
  imageUrl?: string;
  siteName?: string;
  description?: string;
  raw: string; // 生取得結果(メタタグ全体をJSON文字列化)。将来の再解析用に保全。
}

function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaTagPattern = /<meta\s+[^>]*>/gi;
  const matches = html.match(metaTagPattern) ?? [];
  for (const tag of matches) {
    const key = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/content=["']([^"']*)["']/i)?.[1];
    if (key && value !== undefined) {
      tags[key] = value;
    }
  }
  return tags;
}

/** 取得失敗はnullを返す。呼出側はエラーにせず暫定値を維持する(正常系)。 */
export async function fetchOgp(sourceUrl: string): Promise<OgpResult | null> {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return null;
  }
  if (!isAllowedProtocol(url) || isPrivateHostname(url.hostname)) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; nomiico/0.1; +local-first)",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) {
      return null;
    }

    const html = (await response.text()).slice(0, MAX_RESPONSE_CHARS);
    const meta = extractMetaTags(html);

    return {
      title: meta["og:title"],
      imageUrl: meta["og:image"],
      siteName: meta["og:site_name"],
      description: meta["og:description"],
      raw: JSON.stringify(meta),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
