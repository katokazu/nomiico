import { detectSourceType, extractFirstUrl, normalizeUrl } from "./urlNormalize";

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

describe("extractFirstUrl", () => {
  it("extracts a url embedded in text", () => {
    expect(extractFirstUrl("この店気になる https://tabelog.com/tokyo/A1301/ 今度行きたい")).toBe(
      "https://tabelog.com/tokyo/A1301/",
    );
  });

  it("takes only the first url when multiple are present", () => {
    expect(
      extractFirstUrl("https://example.com/a と https://example.com/b どっちがいい?"),
    ).toBe("https://example.com/a");
  });

  it("strips trailing japanese punctuation", () => {
    expect(extractFirstUrl("見つけた。https://example.com/shop。")).toBe(
      "https://example.com/shop",
    );
  });

  it("returns undefined when there is no url", () => {
    expect(extractFirstUrl("ここのお店よかったよ")).toBeUndefined();
  });
});
