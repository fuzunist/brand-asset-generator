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
    
    // If no API key is provided, use Puppeteer to get basic performance metrics
    if (!apiKey) {
        console.warn('PAGESPEED_API_KEY is not set. Using basic performance analysis.');
        return await getBasicPerformanceMetrics(targetUrl);
    }
    
    const api_url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO&strategy=mobile`;

    try {
        const response = await axios.get(api_url, { timeout: 30000 });
        const lighthouse = response.data.lighthouseResult;
        
        return {
            performance: Math.round(lighthouse.categories.performance.score * 100),
            accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
            seo: Math.round(lighthouse.categories.seo.score * 100),
            loadingTime: lighthouse.audits['speed-index']?.displayValue || 'N/A',
            suggestions: extractTopSuggestions(lighthouse.audits)
        };
    } catch (error) {
        console.error('Error fetching PageSpeed scores:', error.message);
        // Fallback to basic metrics if API fails
        return await getBasicPerformanceMetrics(targetUrl);
    }
}

/**
 * Fallback function to get basic performance metrics using Puppeteer
 * @param {string} targetUrl The URL to analyze
 * @returns {Promise<object>} Basic performance metrics
 */
async function getBasicPerformanceMetrics(targetUrl) {
    let browser;
    try {
        browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();
        
        // Start timing
        const startTime = Date.now();
        
        await page.goto(targetUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Get basic metrics
        const metrics = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            const links = document.querySelectorAll('a');
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const metaDescription = document.querySelector('meta[name="description"]');
            const title = document.querySelector('title');
            
            return {
                imageCount: images.length,
                linkCount: links.length,
                headingCount: headings.length,
                hasMetaDescription: !!metaDescription,
                hasTitle: !!title,
                titleLength: title ? title.textContent.length : 0
            };
        });
        
        // Generate scores based on basic criteria
        let performanceScore = 100;
        if (loadTime > 3000) performanceScore -= 30;
        if (loadTime > 5000) performanceScore -= 20;
        
        let seoScore = 100;
        if (!metrics.hasTitle) seoScore -= 20;
        if (!metrics.hasMetaDescription) seoScore -= 15;
        if (metrics.titleLength > 60) seoScore -= 10;
        if (metrics.headingCount === 0) seoScore -= 15;
        
        let accessibilityScore = 85; // Base score for basic checks
        
        return {
            performance: Math.max(0, performanceScore),
            accessibility: accessibilityScore,
            seo: Math.max(0, seoScore),
            loadingTime: `${(loadTime / 1000).toFixed(1)}s`,
            suggestions: generateBasicSuggestions(loadTime, metrics)
        };
        
    } catch (error) {
        console.error('Error getting basic performance metrics:', error);
        return { 
            performance: 'Error', 
            accessibility: 'Error', 
            seo: 'Error',
            loadingTime: 'N/A',
            suggestions: []
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Extract top suggestions from Lighthouse audits
 * @param {object} audits Lighthouse audit results
 * @returns {Array} Array of top suggestions
 */
function extractTopSuggestions(audits) {
    const suggestions = [];
    
    if (audits['unused-css-rules']?.score < 0.9) {
        suggestions.push('Remove unused CSS');
    }
    if (audits['unused-javascript']?.score < 0.9) {
        suggestions.push('Remove unused JavaScript');
    }
    if (audits['largest-contentful-paint']?.score < 0.9) {
        suggestions.push('Improve Largest Contentful Paint');
    }
    if (audits['speed-index']?.score < 0.9) {
        suggestions.push('Optimize loading speed');
    }
    if (audits['meta-description']?.score < 1) {
        suggestions.push('Add meta description');
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Generate basic suggestions based on simple metrics
 * @param {number} loadTime Loading time in milliseconds
 * @param {object} metrics Basic page metrics
 * @returns {Array} Array of suggestions
 */
function generateBasicSuggestions(loadTime, metrics) {
    const suggestions = [];
    
    if (loadTime > 3000) {
        suggestions.push('Optimize page loading speed');
    }
    if (!metrics.hasTitle) {
        suggestions.push('Add a page title');
    }
    if (!metrics.hasMetaDescription) {
        suggestions.push('Add a meta description');
    }
    if (metrics.headingCount === 0) {
        suggestions.push('Add heading tags for better SEO');
    }
    if (metrics.titleLength > 60) {
        suggestions.push('Shorten page title (under 60 characters)');
    }
    
    return suggestions.slice(0, 3);
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
        browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();
        
        // Set longer timeout for page load
        await page.setDefaultTimeout(30000);
        
        // Emulate mobile device
        await page.emulate(puppeteer.devices['iPhone X']);
        
        // Add error handling for page navigation
        try {
            await page.goto(targetUrl, { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
        } catch (navigationError) {
            console.warn(`Navigation warning for ${targetUrl}:`, navigationError.message);
            // Try with alternative wait condition
            await page.goto(targetUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000 
            });
        }

        // Take screenshot
        const screenshotBuffer = await page.screenshot({ 
            type: 'png', 
            encoding: 'base64',
            fullPage: true 
        });

        // Enhanced color consistency check
        const consistencyCheck = await page.evaluate((brandColor) => {
            // Helper function to convert RGB to HEX
            function rgbToHex(rgb) {
                if (!rgb) return null;
                const result = rgb.match(/\d+/g);
                if (!result || result.length < 3) return null;
                return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
            }

            // Helper function to compare colors with tolerance
            function colorsMatch(color1, color2, tolerance = 30) {
                if (!color1 || !color2) return false;
                if (color1 === color2) return true;
                
                // Convert to RGB values for comparison
                const c1 = color1.match(/\d+/g);
                const c2 = color2.match(/\d+/g);
                
                if (!c1 || !c2 || c1.length < 3 || c2.length < 3) return false;
                
                const diff = Math.abs(parseInt(c1[0]) - parseInt(c2[0])) +
                           Math.abs(parseInt(c1[1]) - parseInt(c2[1])) +
                           Math.abs(parseInt(c1[2]) - parseInt(c2[2]));
                
                return diff <= tolerance;
            }

            const body = document.querySelector('body');
            const h1 = document.querySelector('h1');
            const h2 = document.querySelector('h2');
            const h3 = document.querySelector('h3');
            
            // Get computed styles
            const bodyBgColor = window.getComputedStyle(body).backgroundColor;
            const bodyColor = window.getComputedStyle(body).color;
            const h1Color = h1 ? window.getComputedStyle(h1).color : null;
            const h2Color = h2 ? window.getComputedStyle(h2).color : null;
            const h3Color = h3 ? window.getComputedStyle(h3).color : null;

            // Check for brand color usage
            const brandColorRgb = brandColor; // Assuming it might be in various formats
            const primaryColorUsed = colorsMatch(bodyBgColor, brandColorRgb) ||
                                   colorsMatch(bodyColor, brandColorRgb) ||
                                   colorsMatch(h1Color, brandColorRgb) ||
                                   colorsMatch(h2Color, brandColorRgb) ||
                                   colorsMatch(h3Color, brandColorRgb);

            return {
                primaryColorUsed,
                headerColorMatches: colorsMatch(h1Color, brandColorRgb),
                detectedColors: {
                    bodyBackground: rgbToHex(bodyBgColor),
                    bodyText: rgbToHex(bodyColor),
                    h1Color: rgbToHex(h1Color),
                    h2Color: rgbToHex(h2Color),
                    h3Color: rgbToHex(h3Color)
                }
            };
        }, primaryColor);

        return {
            mobileScreenshotUrl: `data:image/png;base64,${screenshotBuffer}`,
            consistencyCheck,
        };

    } catch (error) {
        console.error('Error in Puppeteer tasks:', error);
        // Return fallback data
        return {
            mobileScreenshotUrl: null,
            consistencyCheck: {
                primaryColorUsed: false,
                headerColorMatches: false,
                detectedColors: {},
                error: 'Could not analyze website'
            }
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

        // Helper function to get score class
        function getScoreClass(score) {
            if (typeof score === 'number') {
                if (score >= 80) return 'good';
                if (score >= 60) return 'fair';
                return 'poor';
            }
            return 'poor';
        }

        // Helper function to render suggestions
        function renderSuggestions(suggestions) {
            if (!suggestions || suggestions.length === 0) return '';
            return suggestions.map(suggestion => 
                `<div class="suggestion-item">${suggestion}</div>`
            ).join('');
        }

        // Helper function to render detected colors
        function renderDetectedColors(colors) {
            if (!colors) return '';
            let colorHtml = '';
            
            if (colors.bodyBackground) {
                colorHtml += `<div class="color-swatch">
                    <div class="color-box" style="background-color: ${colors.bodyBackground}"></div>
                    <span>Body Background</span>
                </div>`;
            }
            if (colors.h1Color) {
                colorHtml += `<div class="color-swatch">
                    <div class="color-box" style="background-color: ${colors.h1Color}"></div>
                    <span>H1 Color</span>
                </div>`;
            }
            if (colors.bodyText) {
                colorHtml += `<div class="color-swatch">
                    <div class="color-box" style="background-color: ${colors.bodyText}"></div>
                    <span>Body Text</span>
                </div>`;
            }
            
            return colorHtml;
        }

        // Replace all placeholders
        html = html.replace(/{{URL}}/g, aggregatedData.url)
                   .replace(/{{PERFORMANCE_SCORE}}/g, aggregatedData.scores.performance)
                   .replace(/{{ACCESSIBILITY_SCORE}}/g, aggregatedData.scores.accessibility)
                   .replace(/{{SEO_SCORE}}/g, aggregatedData.scores.seo)
                   .replace(/{{PERFORMANCE_CLASS}}/g, getScoreClass(aggregatedData.scores.performance))
                   .replace(/{{ACCESSIBILITY_CLASS}}/g, getScoreClass(aggregatedData.scores.accessibility))
                   .replace(/{{SEO_CLASS}}/g, getScoreClass(aggregatedData.scores.seo))
                   .replace(/{{LOADING_TIME}}/g, aggregatedData.scores.loadingTime || 'N/A')
                   .replace(/{{MOBILE_SCREENSHOT_URL}}/g, aggregatedData.mobileScreenshotUrl || '')
                   .replace(/{{PRIMARY_COLOR_USED}}/g, aggregatedData.consistencyCheck.primaryColorUsed)
                   .replace(/{{HEADER_COLOR_MATCHES}}/g, aggregatedData.consistencyCheck.headerColorMatches)
                   .replace(/{{GENERATED_DATE}}/g, new Date().toLocaleDateString());

        // Handle conditional sections
        if (aggregatedData.scores.suggestions && aggregatedData.scores.suggestions.length > 0) {
            const suggestionsHtml = `
                <div class="suggestions">
                    <h3>Improvement Suggestions</h3>
                    ${renderSuggestions(aggregatedData.scores.suggestions)}
                </div>`;
            html = html.replace(/{{#if SUGGESTIONS}}[\s\S]*?{{\/if}}/g, suggestionsHtml);
        } else {
            html = html.replace(/{{#if SUGGESTIONS}}[\s\S]*?{{\/if}}/g, '');
        }

        // Handle mobile screenshot conditional
        if (aggregatedData.mobileScreenshotUrl) {
            const screenshotHtml = `
                <div class="screenshot-container">
                    <img src="${aggregatedData.mobileScreenshotUrl}" alt="Mobile Screenshot" class="screenshot">
                    <p style="margin-top: 10px; color: #6c757d; font-size: 0.9em;">
                        Screenshot taken on iPhone X viewport (375x812)
                    </p>
                </div>`;
            html = html.replace(/{{#if MOBILE_SCREENSHOT_URL}}[\s\S]*?{{else}}[\s\S]*?{{\/if}}/g, screenshotHtml);
        } else {
            const noScreenshotHtml = `
                <div style="text-align: center; padding: 40px; color: #6c757d;">
                    <p>Could not capture mobile screenshot</p>
                </div>`;
            html = html.replace(/{{#if MOBILE_SCREENSHOT_URL}}[\s\S]*?{{else}}[\s\S]*?{{\/if}}/g, noScreenshotHtml);
        }

        // Handle detected colors conditional
        if (aggregatedData.consistencyCheck.detectedColors) {
            const colorsHtml = `
                <h3 style="margin-top: 25px; margin-bottom: 15px;">Detected Colors</h3>
                <div class="detected-colors">
                    ${renderDetectedColors(aggregatedData.consistencyCheck.detectedColors)}
                </div>`;
            html = html.replace(/{{#if DETECTED_COLORS}}[\s\S]*?{{\/if}}/g, colorsHtml);
        } else {
            html = html.replace(/{{#if DETECTED_COLORS}}[\s\S]*?{{\/if}}/g, '');
        }

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