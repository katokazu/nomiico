import * as Crypto from "expo-crypto";

/**
 * ID/日時ユーティリティ (docs/patterns/implementation-patterns.md #日時/ID)。
 * IDはUUID v4、日時はUTC ISO8601文字列で統一する。
 */

export function newId(): string {
  return Crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
