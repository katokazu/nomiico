import { SqliteRestaurantRepository } from "@/data/sqlite/restaurantRepository";
import { createTestDb, seedTestOwner, TEST_OWNER_ID } from "@/data/sqlite/testDb";
import type { db as Database } from "@/data/sqlite/client";

import { ValidationError, saveFromShareIntent, saveManual, updateManual } from "./saveService";

jest.mock("./ogp", () => ({
  fetchOgp: jest.fn().mockResolvedValue(null),
}));

/**
 * docs/testing/strategy.md #MVPで必ずカバーするケース の保存/手動登録まわりを検証する。
 */

async function makeRepo(): Promise<SqliteRestaurantRepository> {
  const db: typeof Database = createTestDb();
  await seedTestOwner(db);
  return new SqliteRestaurantRepository(db, async () => TEST_OWNER_ID);
}

describe("saveManual", () => {
  it("saves with only a name (minimal manual entry)", async () => {
    const repo = await makeRepo();
    const restaurant = await saveManual(repo, { name: "焼鳥や" });

    expect(restaurant.name).toBe("焼鳥や");
    expect(restaurant.sourceType).toBe("manual");
    expect(restaurant.desireLevel).toBe(3);
  });

  it("rejects an empty name", async () => {
    const repo = await makeRepo();
    await expect(saveManual(repo, { name: "   " })).rejects.toBeInstanceOf(ValidationError);
  });

  it("detects source_type from a manually entered url and applies optional fields", async () => {
    const repo = await makeRepo();
    const restaurant = await saveManual(repo, {
      name: "町中華",
      sourceUrl: "https://tabelog.com/tokyo/A1301/A130101/13000000/",
      genre: "中華",
      area: "渋谷",
    });

    expect(restaurant.sourceType).toBe("tabelog");
    expect(restaurant.genre).toBe("中華");
    expect(restaurant.area).toBe("渋谷");
  });
});

describe("updateManual", () => {
  it("updates an existing restaurant", async () => {
    const repo = await makeRepo();
    const created = await saveManual(repo, { name: "更新前" });

    const updated = await updateManual(repo, created.id, {
      name: "更新後",
      desireLevel: 5,
      priceRange: "3000円",
    });

    expect(updated.name).toBe("更新後");
    expect(updated.desireLevel).toBe(5);
    expect(updated.priceRange).toBe("3000円");
  });

  it("rejects clearing the name to empty", async () => {
    const repo = await makeRepo();
    const created = await saveManual(repo, { name: "編集対象" });

    await expect(updateManual(repo, created.id, { name: "" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});

describe("saveFromShareIntent", () => {
  it("saves a direct weburl share and detects source_type", async () => {
    const repo = await makeRepo();
    const result = await saveFromShareIntent(repo, {
      type: "weburl",
      webUrl: "https://www.instagram.com/p/abc123/",
    });

    expect(result.isNew).toBe(true);
    expect(result.restaurant.sourceType).toBe("instagram");
    expect(result.restaurant.sourceUrl).toBe("https://www.instagram.com/p/abc123/");
  });

  it("extracts the first url from shared text", async () => {
    const repo = await makeRepo();
    const result = await saveFromShareIntent(repo, {
      type: "text",
      text: "この店気になる https://tabelog.com/tokyo/A1301/ 見て",
    });

    expect(result.restaurant.sourceType).toBe("tabelog");
    expect(result.restaurant.sourceUrl).toBe("https://tabelog.com/tokyo/A1301/");
  });

  it("does not create a duplicate for an already-saved url", async () => {
    const repo = await makeRepo();
    const first = await saveFromShareIntent(repo, {
      type: "weburl",
      webUrl: "https://example.com/shop",
    });
    const second = await saveFromShareIntent(repo, {
      type: "weburl",
      webUrl: "https://example.com/shop?utm_source=ig",
    });

    expect(second.isNew).toBe(false);
    expect(second.restaurant.id).toBe(first.restaurant.id);
  });

  it("saves image-only shares as screenshot with a thumbnail", async () => {
    const repo = await makeRepo();
    const result = await saveFromShareIntent(repo, {
      type: "media",
      files: [{ path: "file:///tmp/shared.jpg" }],
    });

    expect(result.restaurant.sourceType).toBe("screenshot");
    expect(result.restaurant.thumbnailUrl).toBe("file:///tmp/shared.jpg");
  });

  it("saves plain text without a url as a manual entry using the text as the name", async () => {
    const repo = await makeRepo();
    const result = await saveFromShareIntent(repo, {
      type: "text",
      text: "ことぶき",
    });

    expect(result.restaurant.sourceType).toBe("manual");
    expect(result.restaurant.name).toBe("ことぶき");
  });
});
