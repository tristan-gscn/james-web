const chalk = require('chalk');
const { listApps } = require('../utils/config');

/**
 * Lists all installed applications
 */
function list() {
  const apps = listApps();
  const appCount = Object.keys(apps).length;
  
  if (appCount === 0) {
    console.log(chalk.yellow('No applications installed.'));
    console.log('Use', chalk.cyan('james add -n [name] -d [display name] -u [url]'), 'to add an application.');
    return;
  }
  
  console.log(chalk.blue(`Installed applications (${appCount}):`));
  console.log('─'.repeat(50));
  
  Object.entries(apps).forEach(([name, app]) => {
    console.log(chalk.green(`${app.displayName} (${name})`));
    console.log(`  URL: ${app.url}`);
    console.log(`  Installed on: ${new Date(app.createdAt).toLocaleString()}`);
    console.log('─'.repeat(50));
  });
}

module.exports = list;