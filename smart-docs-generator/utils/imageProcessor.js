const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const processLogo = async (logoPath) => {
  try {
    // For demo purposes, we'll use a placeholder if no logo path
    if (!logoPath) {
      return null;
    }

    // In production, this would fetch from S3
    // For demo, we'll check if it's a local file
    let imageBuffer;
    
    if (logoPath.startsWith('http')) {
      // Would fetch from S3/URL in production
      return null;
    } else {
      // Local file path
      const fullPath = path.isAbsolute(logoPath) ? logoPath : path.join(process.cwd(), logoPath);
      
      try {
        imageBuffer = await fs.readFile(fullPath);
      } catch (error) {
        console.log('Logo file not found, using company name instead');
        return null;
      }
    }

    // Resize logo to appropriate dimensions for header
    const resizedLogo = await sharp(imageBuffer)
      .resize(150, 50, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    return resizedLogo;
  } catch (error) {
    console.error('Error processing logo:', error);
    return null;
  }
};

module.exports = {
  processLogo
};