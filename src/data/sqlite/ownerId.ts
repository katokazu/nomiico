import * as SecureStore from "expo-secure-store";

import { appUser, userSettings } from "./schema";
import { newId, nowIso } from "./util";

/**
 * 端末ローカル匿名ユーザー (docs/adr/0003-anonymous-auth-upgrade.md)。
 * 初回解決時にowner_idを生成しexpo-secure-storeへ保存、app_user/user_settingsの
 * 既定行を作成する。以降はプロセス内でキャッシュする。
 *
 * 全Repositoryは呼出側が暗黙に持つ現在のownerとしてこれを既定値に使う
 * (docs/api/api-design.md)。テストではownerIdProviderを差し替えて
 * expo-secure-store/expo-sqliteに依存せず検証する。
 */

const OWNER_ID_KEY = "nomiico.owner_id";

let cachedOwnerId: Promise<string> | null = null;

export type OwnerIdProvider = () => Promise<string>;

export function getOwnerId(): Promise<string> {
  if (!cachedOwnerId) {
    cachedOwnerId = resolveOwnerId();
  }
  return cachedOwnerId;
}

async function resolveOwnerId(): Promise<string> {
  let ownerId = await SecureStore.getItemAsync(OWNER_ID_KEY);
  if (!ownerId) {
    ownerId = newId();
    await SecureStore.setItemAsync(OWNER_ID_KEY, ownerId);
  }
  await ensureOwnerRows(ownerId);
  return ownerId;
}

async function ensureOwnerRows(ownerId: string): Promise<void> {
  // client(expo-sqlite)への依存は実際に解決するときだけ読み込む。
  // repositoryはこのモジュールをimportするだけでexpo-sqliteを起動してしまわないようにする
  // (テストではgetOwnerIdを呼ばずownerIdProviderを差し替えるため)。
  const { db } = await import("./client");
  const now = nowIso();
  await db.insert(appUser).values({ id: ownerId, createdAt: now }).onConflictDoNothing();
  await db
    .insert(userSettings)
    .values({ ownerId, updatedAt: now })
    .onConflictDoNothing();
}
