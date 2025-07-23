const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const specs = require('./social-media-specs.json');

// Helper function to convert hex color to RGB format for Sharp
const hexToRgb = (hex) => {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b, alpha: 1 };
};

const generateSocialMediaKit = async (logoPath, primaryColor, secondaryColor, brandName) => {
    const outputPromises = [];
    
    // Convert hex colors to RGB format for Sharp
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    for (const platform in specs) {
        for (const type in specs[platform]) {
            const { width, height, format } = specs[platform][type];
            const logoBuffer = await sharp(logoPath).resize({ width: Math.floor(width * 0.8) }).toBuffer();

            // Variation 1: Logo on white background
            const whiteBgImage = await sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                }
            })
            .composite([{ input: logoBuffer, gravity: 'center' }])
            .toFormat(format)
            .toBuffer();
            outputPromises.push({ data: whiteBgImage, name: `${platform}/${type}/${platform}_${type}_white.${format}` });

            // Variation 2: Logo on primary color background
            const primaryBgImage = await sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: primaryRgb
                }
            })
            .composite([{ input: logoBuffer, gravity: 'center' }])
            .toFormat(format)
            .toBuffer();
            outputPromises.push({ data: primaryBgImage, name: `${platform}/${type}/${platform}_${type}_primary.${format}` });


            // Variation 3: Logo on secondary color background
            const secondaryBgImage = await sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: secondaryRgb
                }
            })
            .composite([{ input: logoBuffer, gravity: 'center' }])
            .toFormat(format)
            .toBuffer();
            outputPromises.push({ data: secondaryBgImage, name: `${platform}/${type}/${platform}_${type}_secondary.${format}` });

            // Cover variations
            if (type === 'cover') {
                 // Logo left-aligned on a background of the brand's primary color.
                const leftAlignedImage = await sharp({ create: { width, height, channels: 4, background: primaryRgb } })
                    .composite([{ input: logoBuffer, gravity: 'west' }])
                    .toFormat(format)
                    .toBuffer();
                outputPromises.push({ data: leftAlignedImage, name: `${platform}/${type}/${platform}_${type}_primary_left.${format}` });

                // A simple pattern or gradient using the brand's primary and secondary colors, with the logo placed on top.
                const gradientBuffer = Buffer.from(
                    `<svg><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" /><stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)" /></svg>`
                );
                const gradientImage = await sharp(gradientBuffer)
                    .resize(width, height)
                    .composite([{ input: logoBuffer, gravity: 'center' }])
                    .toFormat(format)
                    .toBuffer();
                outputPromises.push({ data: gradientImage, name: `${platform}/${type}/${platform}_${type}_gradient.${format}` });
            }
        }
    }

    return Promise.all(outputPromises);
};


const createZipStream = (files) => {
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', function(err) {
        throw err;
    });

    files.forEach(file => {
        archive.append(file.data, { name: file.name });
    });

    archive.finalize();
    return archive;
};

module.exports = { generateSocialMediaKit, createZipStream }; 