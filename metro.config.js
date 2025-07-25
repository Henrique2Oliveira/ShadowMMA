const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

// Add this resolver for Firebase
defaultConfig.resolver.assetExts.push('db');

module.exports = defaultConfig;