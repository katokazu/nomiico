const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Drizzleのマイグレーションファイル(.sql)をそのままrequireできるようにする
// (docs/database/schema.md #マイグレーション)。
config.resolver.sourceExts.push("sql");

module.exports = config;
