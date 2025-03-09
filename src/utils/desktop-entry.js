const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Creates a .desktop file for the application
 * @param {string} name - Technical name of the application
 * @param {string} displayName - Display name
 * @param {string} execPath - Execution path
 * @param {string} iconPath - Path to the icon
 * @returns {string} - Path of the created .desktop file
 */
function createDesktopEntry(name, displayName, execPath, iconPath) {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications');
  fs.ensureDirSync(desktopDir);
  
  const desktopFile = path.join(desktopDir, `james-web-${name}.desktop`);
  
  const desktopEntry = `[Desktop Entry]
Type=Application
Name=${displayName}
Comment=Web application created with james-web
Exec="${execPath}"
Icon=${iconPath}
Terminal=false
Categories=Network;WebBrowser;
StartupWMClass=${name}
`;

  fs.writeFileSync(desktopFile, desktopEntry);
  fs.chmodSync(desktopFile, '755');
  
  return desktopFile;
}

/**
 * Removes a .desktop file
 * @param {string} desktopEntryPath - Path to the .desktop file
 */
function removeDesktopEntry(desktopEntryPath) {
  if (fs.existsSync(desktopEntryPath)) {
    fs.removeSync(desktopEntryPath);
    return true;
  }
  return false;
}

module.exports = {
  createDesktopEntry,
  removeDesktopEntry
};