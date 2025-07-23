const { TwitterApi } = require('twitter-api-v2');
const language = require('@google-cloud/language');
const setupDatabase = require('./database');

// Initialize Google Cloud Language client
const languageClient = new language.LanguageServiceClient({
    // Note: In production, use proper authentication via service account key file
    // For MVP, we'll use environment variables
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Twitter API client will be initialized with credentials from environment
const getTwitterClient = () => {
    return new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
};

// Analyze sentiment using Google Cloud Natural Language API
async function analyzeSentiment(text) {
    try {
        const document = {
            content: text,
            type: 'PLAIN_TEXT',
        };

        const [result] = await languageClient.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;

        // Categorize sentiment based on score
        let category = 'neutral';
        if (sentiment.score > 0.2) {
            category = 'positive';
        } else if (sentiment.score < -0.2) {
            category = 'negative';
        }

        return {
            score: sentiment.score,
            magnitude: sentiment.magnitude,
            category: category,
        };
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        // Fallback to neutral if analysis fails
        return {
            score: 0,
            magnitude: 0,
            category: 'neutral',
        };
    }
}

// Fetch mentions from Twitter
async function fetchTwitterMentions(keyword, sinceId = null) {
    try {
        const client = getTwitterClient();
        const searchParams = {
            query: keyword,
            max_results: 100, // Maximum allowed per request
            'tweet.fields': 'created_at,author_id',
            'user.fields': 'username',
            expansions: 'author_id',
        };

        if (sinceId) {
            searchParams.since_id = sinceId;
        }

        const tweets = await client.v2.search(searchParams);
        
        // Format the results
        const mentions = [];
        const users = {};
        
        // Build user lookup
        if (tweets.includes && tweets.includes.users) {
            tweets.includes.users.forEach(user => {
                users[user.id] = user.username;
            });
        }

        if (tweets.data) {
            for (const tweet of tweets.data) {
                mentions.push({
                    id: tweet.id,
                    text: tweet.text,
                    authorId: tweet.author_id,
                    authorUsername: users[tweet.author_id] || 'unknown',
                    createdAt: tweet.created_at,
                    url: `https://twitter.com/${users[tweet.author_id] || 'i'}/status/${tweet.id}`,
                });
            }
        }

        return mentions;
    } catch (error) {
        console.error('Error fetching Twitter mentions:', error);
        return [];
    }
}

// Process mentions for a single brand
async function processBrandMentions(db, brandIdentityId, keywords) {
    try {
        // Get the last processed tweet ID for this brand
        const lastMention = await db.get(
            `SELECT source_id FROM brand_mentions 
             WHERE brand_identity_id = ? AND source = 'twitter' 
             ORDER BY source_id DESC LIMIT 1`,
            [brandIdentityId]
        );

        const sinceId = lastMention ? lastMention.source_id : null;

        // Fetch new mentions for each keyword
        const allMentions = [];
        for (const keyword of keywords) {
            const mentions = await fetchTwitterMentions(keyword, sinceId);
            allMentions.push(...mentions);
        }

        // Process each mention
        for (const mention of allMentions) {
            // Analyze sentiment
            const sentimentResult = await analyzeSentiment(mention.text);

            // Store in database
            try {
                await db.run(
                    `INSERT INTO brand_mentions 
                     (brand_identity_id, source, source_id, content, author, source_url, sentiment, sentiment_score, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        brandIdentityId,
                        'twitter',
                        mention.id,
                        mention.text,
                        mention.authorUsername,
                        mention.url,
                        sentimentResult.category,
                        sentimentResult.score,
                        mention.createdAt,
                    ]
                );
            } catch (insertError) {
                // Skip if already exists (unique constraint)
                if (!insertError.message.includes('UNIQUE constraint failed')) {
                    console.error('Error inserting mention:', insertError);
                }
            }
        }

        // Update last fetch time
        await db.run(
            `UPDATE sentiment_tracking_config 
             SET last_fetch_at = CURRENT_TIMESTAMP 
             WHERE brand_identity_id = ?`,
            [brandIdentityId]
        );

        console.log(`Processed ${allMentions.length} mentions for brand ID ${brandIdentityId}`);
    } catch (error) {
        console.error(`Error processing mentions for brand ${brandIdentityId}:`, error);
    }
}

// Main function to process all brands
async function processAllBrands() {
    const db = await setupDatabase();

    try {
        // Get all brands with tracking enabled
        const brands = await db.all(
            `SELECT stc.brand_identity_id, stc.keywords, bi.brand_name
             FROM sentiment_tracking_config stc
             JOIN brand_identities bi ON stc.brand_identity_id = bi.id
             WHERE stc.tracking_enabled = 1`
        );

        for (const brand of brands) {
            const keywords = JSON.parse(brand.keywords);
            console.log(`Processing brand: ${brand.brand_name} with keywords: ${keywords.join(', ')}`);
            await processBrandMentions(db, brand.brand_identity_id, keywords);
        }
    } catch (error) {
        console.error('Error in processAllBrands:', error);
    }
}

// API functions for the dashboard
async function getSentimentSummary(brandIdentityId, days = 7) {
    const db = await setupDatabase();
    
    try {
        const summary = await db.all(
            `SELECT sentiment, COUNT(*) as count
             FROM brand_mentions
             WHERE brand_identity_id = ? 
             AND created_at >= datetime('now', '-${days} days')
             GROUP BY sentiment`,
            [brandIdentityId]
        );

        // Format the result
        const result = {
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
        };

        summary.forEach(row => {
            result[row.sentiment] = row.count;
            result.total += row.count;
        });

        return result;
    } catch (error) {
        console.error('Error getting sentiment summary:', error);
        throw error;
    }
}

async function getRecentMentions(brandIdentityId, limit = 20, offset = 0) {
    const db = await setupDatabase();
    
    try {
        const mentions = await db.all(
            `SELECT * FROM brand_mentions
             WHERE brand_identity_id = ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [brandIdentityId, limit, offset]
        );

        return mentions;
    } catch (error) {
        console.error('Error getting recent mentions:', error);
        throw error;
    }
}

module.exports = {
    processAllBrands,
    getSentimentSummary,
    getRecentMentions,
    analyzeSentiment,
    processBrandMentions,
};