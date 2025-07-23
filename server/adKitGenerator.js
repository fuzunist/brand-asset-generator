const archiver = require('archiver');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Bannerbear API configuration
const BANNERBEAR_API_KEY = process.env.BANNERBEAR_API_KEY || '';
const BANNERBEAR_API_URL = 'https://api.bannerbear.com/v2/images';

// Template IDs for different ad sizes (these need to be created in Bannerbear)
const AD_TEMPLATES = {
  'square-1080x1080': process.env.BANNERBEAR_TEMPLATE_SQUARE || '',
  'landscape-1200x628': process.env.BANNERBEAR_TEMPLATE_LANDSCAPE || '',
  'vertical-1080x1920': process.env.BANNERBEAR_TEMPLATE_VERTICAL || '',
  'banner-300x250': process.env.BANNERBEAR_TEMPLATE_BANNER_MEDIUM || '',
  'banner-728x90': process.env.BANNERBEAR_TEMPLATE_BANNER_LEADERBOARD || ''
};

class AdKitGenerator {
  constructor() {
    this.apiKey = BANNERBEAR_API_KEY;
    this.templates = AD_TEMPLATES;
  }

  /**
   * Generate a single ad image using Bannerbear API
   * @param {string} templateId - The Bannerbear template ID
   * @param {Object} modifications - The modifications to apply to the template
   * @returns {Promise<Object>} - The generated image data
   */
  async generateSingleAd(templateId, modifications) {
    try {
      const response = await axios.post(
        BANNERBEAR_API_URL,
        {
          template: templateId,
          modifications: modifications,
          synchronous: true // Wait for the image to be generated
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating ad:', error.response?.data || error.message);
      throw new Error(`Failed to generate ad: ${error.message}`);
    }
  }

  /**
   * Prepare modifications for Bannerbear API based on user input and brand identity
   * @param {Object} dynamicText - User provided text (headline, description, cta)
   * @param {Object} brandIdentity - Brand identity data (logo, colors, fonts)
   * @returns {Array} - Array of modifications for Bannerbear
   */
  prepareModifications(dynamicText, brandIdentity) {
    const modifications = [];

    // Add text modifications
    if (dynamicText.headline) {
      modifications.push({
        name: 'headline_text',
        text: dynamicText.headline
      });
    }

    if (dynamicText.description) {
      modifications.push({
        name: 'description_text',
        text: dynamicText.description
      });
    }

    if (dynamicText.cta) {
      modifications.push({
        name: 'cta_button_text',
        text: dynamicText.cta
      });
    }

    // Add brand identity modifications
    if (brandIdentity.logoUrl) {
      modifications.push({
        name: 'logo_layer',
        image_url: brandIdentity.logoUrl
      });
    }

    if (brandIdentity.primaryColor) {
      modifications.push({
        name: 'background_color_layer',
        color: brandIdentity.primaryColor
      });
      modifications.push({
        name: 'cta_button_color',
        color: brandIdentity.primaryColor
      });
    }

    if (brandIdentity.secondaryColor) {
      modifications.push({
        name: 'accent_color_layer',
        color: brandIdentity.secondaryColor
      });
    }

    if (brandIdentity.fontFamily) {
      // Note: Bannerbear has limited font support, this might need mapping
      modifications.push({
        name: 'font_family',
        text: brandIdentity.fontFamily
      });
    }

    return modifications;
  }

  /**
   * Download an image from URL to buffer
   * @param {string} url - The image URL
   * @returns {Promise<Buffer>} - The image buffer
   */
  async downloadImageToBuffer(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading image:', error.message);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Generate the complete ad kit
   * @param {Object} dynamicText - User provided text
   * @param {Object} brandIdentity - Brand identity data
   * @returns {Promise<Buffer>} - ZIP file buffer containing all ads
   */
  async generateAdKit(dynamicText, brandIdentity) {
    try {
      // Prepare modifications for all templates
      const modifications = this.prepareModifications(dynamicText, brandIdentity);
      
      // Create promises for all ad generations
      const adPromises = Object.entries(this.templates).map(async ([sizeName, templateId]) => {
        if (!templateId) {
          console.warn(`Template ID not configured for ${sizeName}`);
          return null;
        }

        try {
          const result = await this.generateSingleAd(templateId, modifications);
          return {
            sizeName,
            imageUrl: result.image_url || result.url,
            filename: `${sizeName}.jpg`
          };
        } catch (error) {
          console.error(`Failed to generate ${sizeName}:`, error.message);
          return null;
        }
      });

      // Wait for all ads to be generated
      const adResults = await Promise.all(adPromises);
      const successfulAds = adResults.filter(ad => ad !== null);

      if (successfulAds.length === 0) {
        throw new Error('Failed to generate any ads');
      }

      // Download all images
      const imagePromises = successfulAds.map(async (ad) => {
        const buffer = await this.downloadImageToBuffer(ad.imageUrl);
        return {
          filename: ad.filename,
          buffer: buffer
        };
      });

      const images = await Promise.all(imagePromises);

      // Create ZIP archive
      const zipBuffer = await this.createZipArchive(images, brandIdentity.name || 'Brand');

      return zipBuffer;
    } catch (error) {
      console.error('Error generating ad kit:', error);
      throw error;
    }
  }

  /**
   * Create a ZIP archive from image buffers
   * @param {Array} images - Array of {filename, buffer} objects
   * @param {string} brandName - Brand name for the ZIP filename
   * @returns {Promise<Buffer>} - ZIP file buffer
   */
  async createZipArchive(images, brandName) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err) => reject(err));

      // Add images to archive
      images.forEach(({ filename, buffer }) => {
        archive.append(buffer, { name: filename });
      });

      // Add a README file with ad specifications
      const readme = this.generateReadme(brandName);
      archive.append(readme, { name: 'README.txt' });

      archive.finalize();
    });
  }

  /**
   * Generate README content for the ad kit
   * @param {string} brandName - Brand name
   * @returns {string} - README content
   */
  generateReadme(brandName) {
    return `${brandName} Ad Kit
Generated on: ${new Date().toISOString()}

This ad kit contains the following sizes:
- Square (1080x1080): Instagram/Facebook Carousel
- Landscape (1200x628): Facebook/LinkedIn Link Ads
- Vertical (1080x1920): Stories
- Medium Rectangle (300x250): Display Ads
- Leaderboard (728x90): Display Ads

All images are optimized for digital advertising platforms.
Colors and branding are consistent with your brand identity.

For best results:
1. Use these ads on their respective platforms
2. Test different ad copy variations
3. Monitor performance and iterate

Generated by Brand OS 2.0`;
  }

  /**
   * Mock function to generate ads without API (for testing)
   * @param {Object} dynamicText - User provided text
   * @param {Object} brandIdentity - Brand identity data
   * @returns {Promise<Buffer>} - ZIP file buffer
   */
  async generateMockAdKit(dynamicText, brandIdentity) {
    // Create mock images (simple colored rectangles with text)
    const sizes = [
      { name: 'square-1080x1080', width: 1080, height: 1080 },
      { name: 'landscape-1200x628', width: 1200, height: 628 },
      { name: 'vertical-1080x1920', width: 1080, height: 1920 },
      { name: 'banner-300x250', width: 300, height: 250 },
      { name: 'banner-728x90', width: 728, height: 90 }
    ];

    const sharp = require('sharp');
    const images = [];

    for (const size of sizes) {
      // Create a simple colored rectangle with text
      const svg = `
        <svg width="${size.width}" height="${size.height}">
          <rect width="100%" height="100%" fill="${brandIdentity.primaryColor || '#4F46E5'}"/>
          <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="${Math.min(size.width, size.height) * 0.08}px" font-family="Arial">
            ${dynamicText.headline || 'Your Ad Here'}
          </text>
          <text x="50%" y="60%" text-anchor="middle" fill="white" font-size="${Math.min(size.width, size.height) * 0.05}px" font-family="Arial">
            ${dynamicText.description || 'Description'}
          </text>
          <rect x="${size.width * 0.3}" y="${size.height * 0.75}" width="${size.width * 0.4}" height="${size.height * 0.1}" 
                fill="${brandIdentity.secondaryColor || '#EC4899'}" rx="5"/>
          <text x="50%" y="${size.height * 0.82}" text-anchor="middle" fill="white" font-size="${Math.min(size.width, size.height) * 0.04}px" font-family="Arial">
            ${dynamicText.cta || 'Learn More'}
          </text>
        </svg>
      `;

      const buffer = await sharp(Buffer.from(svg))
        .jpeg({ quality: 90 })
        .toBuffer();

      images.push({
        filename: `${size.name}.jpg`,
        buffer: buffer
      });
    }

    return this.createZipArchive(images, brandIdentity.name || 'Brand');
  }
}

module.exports = AdKitGenerator;