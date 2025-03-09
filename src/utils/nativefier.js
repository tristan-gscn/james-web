const { spawn } = require('child_process');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs-extra');
const { APPS_DIR } = require('./config');

/**
 * Run nativefier to create an application
 * @param {Object} options - Options for nativefier
 * @returns {Promise<string>} - Path to the created application
 */
function runNativefier(options) {
  return new Promise((resolve, reject) => {
    const {
      name,
      targetUrl,
      outputDirectory = APPS_DIR,
      icon,
      ...otherOptions
    } = options;

    // Prepare arguments for nativefier
    const args = [
      targetUrl,
      '--name', name,
      '--out', outputDirectory
    ];

    // Add the icon if specified
    if (icon) {
      args.push('--icon', icon);
    }

    // Add other options
    Object.entries(otherOptions).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          args.push(`--${key}`);
        }
      } else {
        args.push(`--${key}`, value);
      }
    });

    const spinner = ora('Creating application...').start();

    // First, ensure the output directory exists and is clean
    fs.ensureDirSync(outputDirectory);
    
    // Get list of directories before running nativefier
    const beforeDirs = new Set(fs.readdirSync(outputDirectory));

    const nativefierProcess = spawn('npx', ['nativefier', ...args]);
    
    let stdout = '';
    let stderr = '';

    nativefierProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      spinner.text = `Creating application... ${data.toString().trim()}`;
    });

    nativefierProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      spinner.text = `Creating application... ${data.toString().trim()}`;
    });

    nativefierProcess.on('close', (code) => {
      if (code !== 0) {
        spinner.fail(chalk.red('Failed to create application'));
        console.error(stderr);
        reject(new Error(`nativefier failed with code ${code}: ${stderr}`));
        return;
      }

      // Wait a moment to ensure file system operations are complete
      setTimeout(() => {
        try {
          // First check if app was created in current directory instead of outputDirectory
          const currentDir = process.cwd();
          const appNameDir = path.join(currentDir, `${name}-linux-x64`);
          
          if (fs.existsSync(appNameDir)) {
            // App was created in current directory
            console.log(chalk.yellow(`App found in current directory instead of output directory`));
            
            // Either move it to the correct location or process it where it is
            const targetDir = path.join(outputDirectory, path.basename(appNameDir));
            
            // Option 1: Move the directory
            fs.ensureDirSync(path.dirname(targetDir));
            fs.moveSync(appNameDir, targetDir, { overwrite: true });
            processAppDir(targetDir, spinner, resolve, reject);
            
            // Option 2 (alternative): Or just process it where it is
            // processAppDir(appNameDir, spinner, resolve, reject);
            return;
          }
          
          // Get list of directories after running nativefier
          const afterDirs = fs.readdirSync(outputDirectory);
          
          // Find new directories that were created by nativefier
          const newDirs = afterDirs.filter(dir => !beforeDirs.has(dir));
          
          if (newDirs.length === 0) {
            // If no new directories are found, try looking for directories containing the app name
            const appNamePattern = new RegExp(`${name}`);
            const matchingDirs = afterDirs.filter(dir => dir.match(appNamePattern))
              .map(dir => path.join(outputDirectory, dir));
            
            if (matchingDirs.length === 0) {
              spinner.fail(chalk.red('Application created but unable to find the folder'));
              console.log('Output directory content:', afterDirs);
              console.log('Stdout:', stdout);
              console.log('Stderr:', stderr);
              reject(new Error('Unable to find the application folder'));
              return;
            }
            
            // Sort by modification time to get the most recent
            matchingDirs.sort((a, b) => {
              return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
            });
            
            processAppDir(matchingDirs[0], spinner, resolve, reject);
          } else {
            // Process the first new directory (most likely the app directory)
            const newAppDir = path.join(outputDirectory, newDirs[0]);
            processAppDir(newAppDir, spinner, resolve, reject);
          }
        } catch (error) {
          spinner.fail(chalk.red(`Error finding application directory: ${error.message}`));
          reject(error);
        }
      }, 1000); // Wait 1 second to ensure file operations are complete
    });
  });
}

/**
 * Process the application directory to find the executable
 * @param {string} appDir - Application directory
 * @param {object} spinner - Ora spinner instance
 * @param {function} resolve - Promise resolve function
 * @param {function} reject - Promise reject function
 */
function processAppDir(appDir, spinner, resolve, reject) {
  try {
    // Find the executable based on platform
    let executablePath;
    
    if (process.platform === 'linux') {
      const files = fs.readdirSync(appDir);
      const appName = path.basename(appDir).replace('-linux-x64', '');
      
      // First try to find an executable matching the app name (highest priority)
      const appNameExec = files.find(file => {
        return file === appName && 
               fs.statSync(path.join(appDir, file)).isFile() && 
               (fs.statSync(path.join(appDir, file)).mode & 0o111); // Check if executable
      });
      
      if (appNameExec) {
        executablePath = path.join(appDir, appNameExec);
      } else {
        // Then try to find any executable except chrome-sandbox
        const linuxExec = files.find(file => {
          const filePath = path.join(appDir, file);
          return !path.extname(file) && 
                 file !== 'chrome-sandbox' &&  // Explicitly avoid chrome-sandbox
                 fs.statSync(filePath).isFile() && 
                 (fs.statSync(filePath).mode & 0o111); 
        });
        
        if (linuxExec) {
          executablePath = path.join(appDir, linuxExec);
        } else {
          // Rest of your existing fallback logic
          // If no Linux executable found, look for any file without extension
          const noExtFile = linuxExec || files.find(file => {
            const filePath = path.join(appDir, file);
            return !path.extname(file) && fs.statSync(filePath).isFile();
          });
          
          if (noExtFile) {
            executablePath = path.join(appDir, noExtFile);
          } else {
            // Last resort: check if there's a linux-unpacked directory (electron apps)
            const linuxUnpackedDir = path.join(appDir, 'linux-unpacked');
            if (fs.existsSync(linuxUnpackedDir)) {
              const unpackedFiles = fs.readdirSync(linuxUnpackedDir);
              const unpackedExec = unpackedFiles.find(file => !path.extname(file));
              if (unpackedExec) {
                executablePath = path.join(linuxUnpackedDir, unpackedExec);
              }
            }
          }
        }
      }
    } else if (process.platform === 'darwin') {
      // For macOS, look for a .app
      const appBundle = fs.readdirSync(appDir)
        .find(file => file.endsWith('.app'));
      
      if (appBundle) {
        executablePath = path.join(appDir, appBundle);
      }
    } else if (process.platform === 'win32') {
      // For Windows, look for a .exe
      const exeFile = fs.readdirSync(appDir)
        .find(file => file.endsWith('.exe'));
      
      if (exeFile) {
        executablePath = path.join(appDir, exeFile);
      }
    }

    if (!executablePath) {
      // Log directory contents for debugging
      console.log('Application directory contents:', fs.readdirSync(appDir));
      
      // If no executable found, use the app directory itself
      spinner.warn(chalk.yellow('Could not find specific executable. Using application directory as target.'));
      executablePath = appDir;
    } else {
      // Make executable... executable
      if (process.platform !== 'win32') {
        fs.chmodSync(executablePath, '755');
      }
    }

    spinner.succeed(chalk.green('Application created successfully'));
    resolve({ 
      appDir: appDir,
      executablePath 
    });
  } catch (error) {
    spinner.fail(chalk.red(`Error processing application directory: ${error.message}`));
    reject(error);
  }
}

module.exports = { runNativefier };