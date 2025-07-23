// Mock data generator for testing sentiment analysis without API credentials
const setupDatabase = require('./database');

const mockTweets = [
    { text: "I absolutely love this brand! Best customer service ever!", sentiment: "positive", score: 0.9 },
    { text: "Just received my order and it's amazing! Thank you so much!", sentiment: "positive", score: 0.8 },
    { text: "Terrible experience with this company. Never ordering again.", sentiment: "negative", score: -0.9 },
    { text: "The product quality has really gone downhill lately.", sentiment: "negative", score: -0.7 },
    { text: "Just placed an order. Let's see how it goes.", sentiment: "neutral", score: 0.1 },
    { text: "Has anyone tried their new product line?", sentiment: "neutral", score: 0.0 },
    { text: "Outstanding quality! Highly recommend to everyone!", sentiment: "positive", score: 0.95 },
    { text: "Disappointed with my recent purchase. Expected better.", sentiment: "negative", score: -0.6 },
    { text: "Great products but shipping took forever.", sentiment: "neutral", score: -0.1 },
    { text: "Best purchase I've made this year! 10/10!", sentiment: "positive", score: 0.92 },
    { text: "Customer support was unhelpful and rude.", sentiment: "negative", score: -0.85 },
    { text: "The packaging is nice but product is just okay.", sentiment: "neutral", score: 0.05 },
    { text: "Fantastic experience from start to finish!", sentiment: "positive", score: 0.88 },
    { text: "Poor quality control. Found defects in my order.", sentiment: "negative", score: -0.75 },
    { text: "Received my order today. Everything looks good.", sentiment: "neutral", score: 0.15 },
];

const usernames = ["user123", "happycustomer", "techreviewer", "shoplover", "critic2024", "neutralbob", "fanatic99", "disappointed1", "reviewer_pro", "casualbuyer"];

async function generateMockData() {
    const db = await setupDatabase();
    
    try {
        // Get the first brand identity
        const brandIdentity = await db.get('SELECT id FROM brand_identities LIMIT 1');
        
        if (!brandIdentity) {
            console.error('No brand identity found. Please set up a brand first.');
            return;
        }
        
        console.log(`Generating mock data for brand ID: ${brandIdentity.id}`);
        
        // Create sentiment tracking config if it doesn't exist
        const existingConfig = await db.get(
            'SELECT id FROM sentiment_tracking_config WHERE brand_identity_id = ?',
            [brandIdentity.id]
        );
        
        if (!existingConfig) {
            await db.run(
                `INSERT INTO sentiment_tracking_config (brand_identity_id, keywords, tracking_enabled)
                 VALUES (?, ?, ?)`,
                [brandIdentity.id, JSON.stringify(['TestBrand', '@testbrand', '#TestBrand']), 1]
            );
            console.log('Created sentiment tracking config');
        }
        
        // Generate mock mentions over the last 7 days
        const now = new Date();
        let mentionsAdded = 0;
        
        for (let i = 0; i < 50; i++) {
            const tweet = mockTweets[Math.floor(Math.random() * mockTweets.length)];
            const username = usernames[Math.floor(Math.random() * usernames.length)];
            const daysAgo = Math.random() * 7;
            const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            const tweetId = `mock_${Date.now()}_${i}`;
            
            try {
                await db.run(
                    `INSERT INTO brand_mentions 
                     (brand_identity_id, source, source_id, content, author, source_url, sentiment, sentiment_score, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        brandIdentity.id,
                        'twitter',
                        tweetId,
                        tweet.text,
                        username,
                        `https://twitter.com/${username}/status/${tweetId}`,
                        tweet.sentiment,
                        tweet.score,
                        createdAt.toISOString()
                    ]
                );
                mentionsAdded++;
            } catch (error) {
                // Skip if duplicate
                if (!error.message.includes('UNIQUE constraint failed')) {
                    console.error('Error inserting mention:', error);
                }
            }
        }
        
        console.log(`Successfully added ${mentionsAdded} mock mentions`);
        
        // Update last fetch time
        await db.run(
            `UPDATE sentiment_tracking_config 
             SET last_fetch_at = CURRENT_TIMESTAMP 
             WHERE brand_identity_id = ?`,
            [brandIdentity.id]
        );
        
        // Display summary
        const summary = await db.all(
            `SELECT sentiment, COUNT(*) as count
             FROM brand_mentions
             WHERE brand_identity_id = ?
             GROUP BY sentiment`,
            [brandIdentity.id]
        );
        
        console.log('\nSentiment Summary:');
        summary.forEach(row => {
            console.log(`${row.sentiment}: ${row.count} mentions`);
        });
        
    } catch (error) {
        console.error('Error generating mock data:', error);
    } finally {
        await db.close();
    }
}

// Run if called directly
if (require.main === module) {
    generateMockData().then(() => {
        console.log('\nMock data generation complete!');
        console.log('You can now test the sentiment analysis dashboard without API credentials.');
        process.exit(0);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { generateMockData };