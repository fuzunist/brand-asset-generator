const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const convert = require('color-convert');

async function generateClearspaceImage(logoPath, logoMimeType, outputDir) {
    const logoContent = await fs.readFile(logoPath);
    const logoDataUri = `data:${logoMimeType};base64,${logoContent.toString('base64')}`;

    // 1. First render to measure the logo
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(`<img id="logo" src="${logoDataUri}" />`);
    const logoHandle = await page.$('#logo');
    const logoBox = await logoHandle.boundingBox();

    // 2. Calculate clearspace
    const clearspace = logoBox.height * 0.2; // 20% of the height

    // 3. Second render with the clearspace visual
    const htmlContent = `
        <style>
            body { margin: 0; padding: 0; }
            .clearspace-container {
                /* Add a little extra padding so the border isn't clipped in the screenshot */
                padding: 5px; 
            }
            .logo-wrapper {
                padding: ${clearspace}px;
                border: 1px dashed #999;
                /* Use inline-block to shrink-wrap the div to the content */
                display: inline-block;
            }
            img {
                display: block; /* remove bottom space */
                width: ${logoBox.width}px;
                height: ${logoBox.height}px;
            }
        </style>
        <div class="clearspace-container">
            <div class="logo-wrapper">
                <img src="${logoDataUri}" />
            </div>
        </div>
    `;

    await page.setContent(htmlContent);
    const container = await page.$('.clearspace-container');
    const boundingBox = await container.boundingBox();
    
    const outputPath = path.join(outputDir, 'clearspace.png');
    await page.screenshot({
        path: outputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    await browser.close();
    return 'clearspace.png';
}

async function generateMinSizeImage(logoPath, logoMimeType, outputDir) {
    const logoContent = await fs.readFile(logoPath);
    const logoDataUri = `data:${logoMimeType};base64,${logoContent.toString('base64')}`;

    const htmlContent = `
        <style>
            body { margin: 0; padding: 0; }
            .min-size-container {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5px; /* Add some padding to see the container */
                border: 1px dashed #ccc;
            }
            img {
                max-width: 100%;
                max-height: 100%;
            }
        </style>
        <div class="min-size-container">
            <img src="${logoDataUri}" />
        </div>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const container = await page.$('.min-size-container');
    const boundingBox = await container.boundingBox();
    
    const outputPath = path.join(outputDir, 'min_size.png');
    await page.screenshot({
        path: outputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    await browser.close();
    return 'min_size.png';
}

async function generateLogoDontsImage(logoPath, logoMimeType, outputDir) {
    const logoContent = await fs.readFile(logoPath);
    const logoDataUri = `data:${logoMimeType};base64,${logoContent.toString('base64')}`;

    const htmlContent = `
        <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; }
            .donts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                width: 500px;
            }
            .dont-item {
                border: 1px solid #eee;
                padding: 10px;
                text-align: center;
            }
            .logo-container {
                height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
            }
            .logo-container img { max-width: 80%; max-height: 80%; }
            .dont-item p { margin: 0; font-size: 12px; }

            /* Specific "Don'ts" */
            .stretch img { transform: scale(1.5, 0.8); }
            .shadow img { filter: drop-shadow(3px 3px 2px rgba(0,0,0,0.4)); }
            .rotate img { transform: rotate(15deg); }
            .busy-bg {
                background-image: 
                    linear-gradient(45deg, #ccc 25%, transparent 25%), 
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
                background-size: 20px 20px;
            }
        </style>
        <div class="donts-grid">
            <div class="dont-item stretch">
                <div class="logo-container"><img src="${logoDataUri}"></div>
                <p>Don't stretch or distort.</p>
            </div>
            <div class="dont-item shadow">
                <div class="logo-container"><img src="${logoDataUri}"></div>
                <p>Don't add drop shadows.</p>
            </div>
            <div class="dont-item rotate">
                <div class="logo-container"><img src="${logoDataUri}"></div>
                <p>Don't rotate the logo.</p>
            </div>
            <div class="dont-item">
                <div class="logo-container busy-bg"><img src="${logoDataUri}"></div>
                <p>Don't place on busy backgrounds.</p>
            </div>
        </div>
    `;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const gridElement = await page.$('.donts-grid');
    const boundingBox = await gridElement.boundingBox();
    
    const outputPath = path.join(outputDir, 'logo_donts.png');
    await page.screenshot({
        path: outputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    await browser.close();
    return 'logo_donts.png';
}

async function generateColorPaletteImage(colors, outputDir) {
    const primaryRGB = convert.hex.rgb(colors.primary.substring(1));
    const primaryCMYK = convert.hex.cmyk(colors.primary.substring(1));
    const secondaryRGB = convert.hex.rgb(colors.secondary.substring(1));
    const secondaryCMYK = convert.hex.cmyk(colors.secondary.substring(1));

    const htmlContent = `
        <style>
            body { font-family: sans-serif; margin: 0; padding: 0; }
            .palette { display: flex; gap: 20px; padding: 20px; }
            .swatch { width: 150px; }
            .color-box { width: 150px; height: 100px; border: 1px solid #ccc; }
            .color-info p { margin: 5px 0; font-size: 12px; }
        </style>
        <div class="palette">
            <div class="swatch">
                <div class="color-box" style="background-color: ${colors.primary};"></div>
                <div class="color-info">
                    <p><strong>Primary</strong></p>
                    <p>HEX: ${colors.primary}</p>
                    <p>RGB: ${primaryRGB.join(', ')}</p>
                    <p>CMYK: ${primaryCMYK.join(', ')}</p>
                </div>
            </div>
            <div class="swatch">
                <div class="color-box" style="background-color: ${colors.secondary};"></div>
                <div class="color-info">
                    <p><strong>Secondary</strong></p>
                    <p>HEX: ${colors.secondary}</p>
                    <p>RGB: ${secondaryRGB.join(', ')}</p>
                    <p>CMYK: ${secondaryCMYK.join(', ')}</p>
                </div>
            </div>
        </div>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const paletteElement = await page.$('.palette');
    const boundingBox = await paletteElement.boundingBox();
    
    const outputPath = path.join(outputDir, 'colors.png');
    await page.screenshot({
        path: outputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    await browser.close();
    return 'colors.png';
}

async function generateTypographyImage(fonts, outputDir) {
    const googleFontLink = `https://fonts.googleapis.com/css2?family=${fonts.headline.replace(' ', '+')}:wght@700&family=${fonts.body.replace(' ', '+')}:wght@400&display=swap`;

    const htmlContent = `
        <head>
            <link href="${googleFontLink}" rel="stylesheet">
            <style>
                body { margin: 0; padding: 0; }
                .typography-guide { padding: 20px; }
                .font-family { font-family: '${fonts.headline}', sans-serif; }
                .font-body { font-family: '${fonts.body}', sans-serif; }
                h1, h2, p { margin: 0 0 10px 0; }
                h1 { font-size: 32px; font-family: '${fonts.headline}', sans-serif; }
                h2 { font-size: 24px; font-family: '${fonts.headline}', sans-serif; }
                p { font-size: 14px; font-family: '${fonts.body}', sans-serif; }
            </style>
        </head>
        <body>
            <div class="typography-guide">
                <h1>Headline 1: ${fonts.headline}</h1>
                <h2>Headline 2: ${fonts.headline}</h2>
                <p>Body Text: ${fonts.body}. The quick brown fox jumps over the lazy dog.</p>
            </div>
        </body>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const typographyElement = await page.$('.typography-guide');
    const boundingBox = await typographyElement.boundingBox();
    
    const outputPath = path.join(outputDir, 'typography.png');
    await page.screenshot({
        path: outputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    await browser.close();
    return 'typography.png';
}

module.exports = {
    generateClearspaceImage,
    generateMinSizeImage,
    generateLogoDontsImage,
    generateColorPaletteImage,
    generateTypographyImage,
}; 