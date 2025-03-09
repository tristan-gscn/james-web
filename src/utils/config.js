const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Important paths
const CONFIG_DIR = path.join(os.homedir(), '.config', 'james-web');
const APPS_DIR = path.join(CONFIG_DIR, 'apps');
const ICONS_DIR = path.join(CONFIG_DIR, 'icons');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration structure
const DEFAULT_CONFIG = {
  version: 1,
  apps: {}
};

/**
 * Ensures that necessary directories exist
 */
function ensureAppDirs() {
  fs.ensureDirSync(CONFIG_DIR);
  fs.ensureDirSync(APPS_DIR);
  fs.ensureDirSync(ICONS_DIR);
  
  // Create the configuration file if it doesn't exist
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeJsonSync(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
  }
}

/**
 * Gets the current configuration
 */
function getConfig() {
  ensureAppDirs();
  return fs.readJsonSync(CONFIG_FILE);
}

/**
 * Saves the configuration
 */
function saveConfig(config) {
  fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 });
}

/**
 * Adds an application to the configuration
 */
function addApp(name, displayName, url, iconPath) {
  const config = getConfig();
  
  config.apps[name] = {
    displayName,
    url,
    iconPath,
    installPath: path.join(APPS_DIR, name),
    desktopEntryPath: path.join(os.homedir(), '.local', 'share', 'applications', `james-web-${name}.desktop`),
    createdAt: new Date().toISOString()
  };
  
  saveConfig(config);
  return config.apps[name];
}

/**
 * Removes an application from the configuration
 */
function removeApp(name) {
  const config = getConfig();
  
  if (!config.apps[name]) {
    return false;
  }
  
  const appInfo = config.apps[name];
  delete config.apps[name];
  saveConfig(config);
  
  return appInfo;
}

/**
 * Lists all applications
 */
function listApps() {
  const config = getConfig();
  return config.apps;
}

module.exports = {
  CONFIG_DIR,
  APPS_DIR,
  ICONS_DIR,
  ensureAppDirs,
  getConfig,
  saveConfig,
  addApp,
  removeApp,
  listApps
};