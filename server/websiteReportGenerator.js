// This file will orchestrate the website audit process.
// It will use Puppeteer and Google PageSpeed Insights to gather data
// and then generate a PDF report.

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// --- Helper Functions ---

/**
 * Gets website performance scores from Google PageSpeed Insights API.
 * @param {string} targetUrl The URL to analyze.
 * @returns {Promise<object>} An object with performance, accessibility, and seo scores.
 */
async function getPagespeedScores(targetUrl) {
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
        console.warn('PAGESPEED_API_KEY is not set. Skipping performance audit.');
        return { performance: 'N/A', accessibility: 'N/A', seo: 'N/A' };
    }
    
    const api_url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO`;

    try {
        const response = await axios.get(api_url);
        const lighthouse = response.data.lighthouseResult;
        return {
            performance: Math.round(lighthouse.categories.performance.score * 100),
            accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
            seo: Math.round(lighthouse.categories.seo.score * 100),
        };
    } catch (error) {
        console.error('Error fetching PageSpeed scores:', error.message);
        return { performance: 'Error', accessibility: 'Error', seo: 'Error' };
    }
}

/**
 * Uses Puppeteer to take a mobile screenshot and check color consistency.
 * @param {string} targetUrl The URL to visit.
 * @param {string} primaryColor The primary brand color (HEX) to check for.
 * @returns {Promise<object>} An object with screenshot data and consistency results.
 */
async function runPuppeteerTasks(targetUrl, primaryColor) {
    let browser;
    try {
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        
        // Emulate mobile device
        await page.emulate(puppeteer.devices['iPhone X']);
        
        await page.goto(targetUrl, { waitUntil: 'networkidle0' });

        // Take screenshot
        const screenshotBuffer = await page.screenshot({ type: 'png', encoding: 'base64' });

        // Color consistency check
        const consistencyCheck = await page.evaluate((brandColor) => {
            const body = document.querySelector('body');
            const h1 = document.querySelector('h1');
            
            const bodyBgColor = window.getComputedStyle(body).backgroundColor;
            const h1Color = h1 ? window.getComputedStyle(h1).color : null;

            // This is a very basic check. A real implementation might need a more
            // sophisticated way to compare colors (e.g., converting RGB to HEX).
            return {
                primaryColorUsed: bodyBgColor.includes(brandColor) || (h1Color && h1Color.includes(brandColor)),
                headerColorMatches: h1Color ? h1Color.includes(brandColor) : false,
            };
        }, primaryColor);

        return {
            mobileScreenshotUrl: `data:image/png;base64,${screenshotBuffer}`,
            consistencyCheck,
        };

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}


/**
 * Main orchestrator function for generating the website report.
 * @param {string} url The website URL to audit.
 * @param {string} accountId The user's account ID to fetch brand data.
 * @param {object} db The database connection instance.
 * @returns {Promise<Buffer|null>} A buffer containing the generated PDF, or null on failure.
 */
async function generateWebsiteReport(url, accountId, db) {
    try {
        console.log(`Starting website audit for: ${url} (Account: ${accountId})`);

        // 1. Fetch brand data
        const brandIdentity = await db.get('SELECT primary_color FROM brand_identities WHERE account_id = ?', accountId);
        const primaryColor = brandIdentity?.primary_color || '#000000'; // Default to black if not found

        // 2. Run audits in parallel
        const [pagespeedData, puppeteerData] = await Promise.all([
            getPagespeedScores(url),
            runPuppeteerTasks(url, primaryColor)
        ]);

        // 3. Aggregate results
        const aggregatedData = {
            url,
            scores: pagespeedData,
            ...puppeteerData,
        };

        // 4. Render HTML report from template
        const templatePath = path.join(__dirname, 'templates', 'report_template.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        html = html.replace('{{URL}}', aggregatedData.url)
                   .replace('{{PERFORMANCE_SCORE}}', aggregatedData.scores.performance)
                   .replace('{{ACCESSIBILITY_SCORE}}', aggregatedData.scores.accessibility)
                   .replace('{{SEO_SCORE}}', aggregatedData.scores.seo)
                   .replace('{{MOBILE_SCREENSHOT_URL}}', aggregatedData.mobileScreenshotUrl)
                   .replace('{{PRIMARY_COLOR_USED}}', aggregatedData.consistencyCheck.primaryColorUsed ? 'Yes' : 'No');

        // 5. Generate PDF from HTML
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        console.log(`Successfully generated report for ${url}`);
        return pdfBuffer;

    } catch (error) {
        console.error(`Failed to generate website report for ${url}:`, error);
        // In case of error, return null. The route handler will catch this and send a 500 response.
        throw error;
    }
}

module.exports = {
  generateWebsiteReport,
}; 