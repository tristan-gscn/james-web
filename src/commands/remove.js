const chalk = require('chalk');
const fs = require('fs-extra');
const { removeApp } = require('../utils/config');
const { removeDesktopEntry } = require('../utils/desktop-entry');

/**
 * Removes an application
 */
function remove(options) {
  const { name } = options;
  
  try {
    // Get application information
    const appInfo = removeApp(name);
    
    if (!appInfo) {
      throw new Error(`Application '${name}' not found`);
    }
    
    console.log(chalk.blue(`Removing application: ${appInfo.displayName} (${name})`));
    
    // Remove the application directory
    if (fs.existsSync(appInfo.installPath)) {
      fs.removeSync(appInfo.installPath);
      console.log(chalk.green(`Application directory removed: ${appInfo.installPath}`));
    }
    
    // Remove the icon
    if (appInfo.iconPath && fs.existsSync(appInfo.iconPath)) {
      fs.removeSync(appInfo.iconPath);
      console.log(chalk.green(`Icon removed: ${appInfo.iconPath}`));
    }
    
    // Remove the .desktop file
    if (removeDesktopEntry(appInfo.desktopEntryPath)) {
      console.log(chalk.green(`Desktop entry removed: ${appInfo.desktopEntryPath}`));
    }
    
    console.log(chalk.green(`\nApplication ${appInfo.displayName} successfully removed!`));
    
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = remove;