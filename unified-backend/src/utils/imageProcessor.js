// unified-backend/src/utils/imageProcessor.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const processLogo = async (logoPath) => {
  try {
    if (!logoPath) {
      logger.warn('No logo path provided to image processor.');
      return null;
    }

    // In a real application, this would handle S3 URLs.
    // For now, we only handle local file paths for the demo.
    let imageBuffer;
    
    if (logoPath.startsWith('http')) {
      logger.info(`Skipping logo processing for remote URL: ${logoPath}`);
      return null;
    } else {
      const fullPath = path.isAbsolute(logoPath) ? logoPath : path.join(process.cwd(), logoPath);
      
      try {
        imageBuffer = await fs.readFile(fullPath);
        logger.info(`Successfully read logo file from: ${fullPath}`);
      } catch (error) {
        logger.warn(`Logo file not found at ${fullPath}. It will be omitted from the document.`);
        return null;
      }
    }

    const resizedLogo = await sharp(imageBuffer)
      .resize(150, 50, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
    
    logger.info('Logo processed and resized successfully.');
    return resizedLogo;
  } catch (error) {
    logger.error('Error processing logo:', error);
    return null;
  }
};

module.exports = {
  processLogo
}; 