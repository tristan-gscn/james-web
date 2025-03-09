const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const { ICONS_DIR } = require('./config');

/**
 * Retrieves and saves a website's favicon
 * @param {string} url - Website URL
 * @param {string} appName - Application name
 * @returns {Promise<string>} - Path to the saved icon
 */
async function getFavicon(url, appName) {
  try {
    // Extract domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Try via Google Favicon Service
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const response = await fetch(googleFaviconUrl);
    
    if (!response.ok) {
      throw new Error(`Unable to retrieve favicon for ${domain}`);
    }
    
    // Save the icon
    const iconPath = path.join(ICONS_DIR, `${appName}.png`);
    const iconBuffer = await response.buffer();
    await fs.writeFile(iconPath, iconBuffer);
    
    return iconPath;
  } catch (error) {
    console.error(`Error retrieving favicon: ${error.message}`);
    // Return null on failure
    return null;
  }
}

module.exports = { getFavicon };