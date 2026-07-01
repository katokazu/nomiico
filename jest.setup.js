/* global jest */
// expo-cryptoはJest環境ではネイティブ実装を持たないため、
// 同等のNode組み込みcrypto.randomUUIDへ差し替える。
jest.mock("expo-crypto", () => ({
  randomUUID: () => require("node:crypto").randomUUID(),
}));
