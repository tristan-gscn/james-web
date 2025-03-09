#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const chalk = require('chalk');
const { version } = require('../package.json');
const { ensureAppDirs } = require('./utils/config');

// Commands
const add = require('./commands/add');
const list = require('./commands/list');
const remove = require('./commands/remove');

// Ensure necessary directories exist
ensureAppDirs();

program
  .name('james')
  .description('Web application manager using nativefier')
  .version(version);

program
  .command('add')
  .description('Add a new web application')
  .requiredOption('-n, --name <name>', 'Technical name of the application (no spaces)')
  .requiredOption('-d, --display-name <displayName>', 'Display name of the application')
  .requiredOption('-u, --url <url>', 'Website URL')
  .option('-i, --icon <icon>', 'Path to a custom icon file (optional)')
  .action(add);

program
  .command('list')
  .description('List all installed applications')
  .action(list);

program
  .command('remove')
  .description('Remove an application')
  .requiredOption('-n, --name <name>', 'Technical name of the application to remove')
  .action(remove);

// Error handling
program.on('command:*', function () {
  console.error(chalk.red('Invalid command: %s\nUse --help to see available commands.'), program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

// Display help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}