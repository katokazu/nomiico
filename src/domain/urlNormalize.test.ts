import { detectSourceType, normalizeUrl } from "./urlNormalize";

describe("normalizeUrl", () => {
  it("removes tracking params and trailing slash", () => {
    expect(normalizeUrl("http://Example.com/shop/?utm_source=ig&fbclid=abc")).toBe(
      "https://example.com/shop",
    );
  });

  it("removes the fragment", () => {
    expect(normalizeUrl("https://example.com/shop#section")).toBe("https://example.com/shop");
  });

  it("keeps non-tracking query params", () => {
    expect(normalizeUrl("https://example.com/shop?id=123")).toBe(
      "https://example.com/shop?id=123",
    );
  });
});

describe("detectSourceType", () => {
  it("detects instagram", () => {
    expect(detectSourceType("https://www.instagram.com/p/abc123/")).toBe("instagram");
  });

  it("detects googlemap short links", () => {
    expect(detectSourceType("https://maps.app.goo.gl/abc123")).toBe("googlemap");
  });

  it("detects tabelog", () => {
    expect(detectSourceType("https://tabelog.com/tokyo/A1301/A130101/13000000/")).toBe("tabelog");
  });

  it("falls back to web for other https urls", () => {
    expect(detectSourceType("https://example.com/shop")).toBe("web");
  });

  it("returns manual when there is no url", () => {
    expect(detectSourceType(undefined)).toBe("manual");
  });
});
