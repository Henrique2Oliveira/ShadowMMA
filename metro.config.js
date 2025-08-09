const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Keep your existing settings
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.assetExts.push('db');

// // 🚫 Ignore Firebase functions folder
// defaultConfig.watchFolders = defaultConfig.watchFolders.filter(
//   folder => !folder.includes(path.join(__dirname, 'functions'))
// );

// // Also exclude it from resolution
// defaultConfig.resolver.blockList = [
//   /functions\/.*/
// ];

module.exports = defaultConfig;
