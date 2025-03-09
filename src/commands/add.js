const chalk = require('chalk');
const ora = require('ora');
const { addApp } = require('../utils/config');
const { getFavicon } = require('../utils/favicon');
const { runNativefier } = require('../utils/nativefier');
const { createDesktopEntry } = require('../utils/desktop-entry');

/**
 * Add a new web application
 */
async function add(options) {
  const { name, displayName, url, icon } = options;
  
  try {
    // Validate name (no spaces or special characters)
    if (!/^[a-z0-9\-]+$/.test(name)) {
      throw new Error('Technical name must contain only lowercase letters, numbers, or hyphens');
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      throw new Error('Invalid URL');
    }
    
    console.log(chalk.blue(`Adding application: ${displayName} (${name}) from ${url}`));
    
    // Get favicon if no icon is provided
    let iconPath = icon;
    if (!iconPath) {
      const spinner = ora('Getting favicon...').start();
      iconPath = await getFavicon(url, name);
      if (iconPath) {
        spinner.succeed(chalk.green('Favicon retrieved successfully'));
      } else {
        spinner.warn(chalk.yellow('Could not retrieve favicon, application will be created without an icon'));
      }
    }
    
    // Create the application with nativefier
    const nativefierOptions = {
      name,
      targetUrl: url,
      icon: iconPath,
      singleInstance: true,
      disableContextMenu: false,
      disableDevTools: true,
      hideWindowFrame: false,
      maximize: false,
      tray: false,
      width: 1280,
      height: 800,
      showMenuBar: false
    };
    
    const { appDir, executablePath } = await runNativefier(nativefierOptions);
    
    // Create the .desktop file
    const desktopEntryPath = createDesktopEntry(name, displayName, executablePath, iconPath || '');
    console.log(chalk.green(`Desktop entry created: ${desktopEntryPath}`));
    
    // Add the application to the configuration
    addApp(name, displayName, url, iconPath, appDir, desktopEntryPath);
    
    console.log(chalk.green(`\nApplication ${displayName} created successfully!`));
    console.log(`  Executable: ${executablePath}`);
    console.log(`  Menu: The application is available in the applications menu`);
    
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = add;