const axios = require('axios');
const cron = require('node-cron');
const OpenAI = require('openai');

class ThoughtLeadershipService {
    constructor(db, openaiApiKey) {
        this.db = db;
        this.openai = new OpenAI({ apiKey: openaiApiKey });
        this.newsApiKey = process.env.NEWS_API_KEY || '';
        this.serpApiKey = process.env.SERP_API_KEY || '';
    }

    // Fetch news articles using NewsAPI
    async fetchNewsArticles(industry) {
        try {
            if (!this.newsApiKey) {
                console.log('NewsAPI key not configured, using mock data');
                return this.getMockNewsData(industry);
            }

            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: `${industry} AND (trends OR innovation OR technology)`,
                    sortBy: 'publishedAt',
                    language: 'en',
                    pageSize: 10,
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                headers: {
                    'X-Api-Key': this.newsApiKey
                }
            });

            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description || article.content?.substring(0, 200)
            }));
        } catch (error) {
            console.error('Error fetching news:', error.message);
            return this.getMockNewsData(industry);
        }
    }

    // Fetch Google search results using SERP API
    async fetchGoogleTrends(industry) {
        try {
            if (!this.serpApiKey) {
                console.log('SERP API key not configured, using mock data');
                return this.getMockTrendsData(industry);
            }

            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    q: `${industry} weekly trends 2024`,
                    api_key: this.serpApiKey,
                    num: 5
                }
            });

            return response.data.organic_results?.map(result => result.snippet) || [];
        } catch (error) {
            console.error('Error fetching Google trends:', error.message);
            return this.getMockTrendsData(industry);
        }
    }

    // Mock data for development/testing
    getMockNewsData(industry) {
        const mockData = {
            'Fintech': [
                { title: 'Digital Banking Revolution: How AI is Transforming Customer Experience', description: 'Major banks are implementing AI chatbots and predictive analytics to enhance user experience.' },
                { title: 'Cryptocurrency Regulation Update: What Startups Need to Know', description: 'New regulatory frameworks are emerging globally for crypto businesses.' },
                { title: 'Open Banking APIs Drive Innovation in Payment Solutions', description: 'The rise of open banking is creating new opportunities for fintech startups.' }
            ],
            'SaaS': [
                { title: 'AI-Powered SaaS Tools See 300% Growth in Enterprise Adoption', description: 'Companies are rapidly adopting AI tools for automation and efficiency.' },
                { title: 'The Future of Remote Work: SaaS Platforms Leading the Way', description: 'New collaboration tools are reshaping how teams work together.' },
                { title: 'Security-First SaaS: Why Zero-Trust Architecture Matters', description: 'Security concerns drive new approaches to SaaS development.' }
            ],
            'E-commerce': [
                { title: 'Social Commerce Explosion: TikTok and Instagram Drive Sales', description: 'Social media platforms are becoming primary sales channels.' },
                { title: 'Sustainable E-commerce: How Green Practices Boost Brand Loyalty', description: 'Consumers increasingly prefer eco-friendly online retailers.' },
                { title: 'AI Personalization in E-commerce Increases Conversion by 40%', description: 'Machine learning algorithms are revolutionizing online shopping experiences.' }
            ]
        };

        return mockData[industry] || [
            { title: `Latest Trends in ${industry}`, description: 'Industry innovations and developments are accelerating.' },
            { title: `${industry} Market Analysis 2024`, description: 'Key insights and predictions for the year ahead.' },
            { title: `Technology Disruption in ${industry}`, description: 'How emerging tech is reshaping the industry landscape.' }
        ];
    }

    getMockTrendsData(industry) {
        return [
            `${industry} is experiencing rapid digital transformation with AI and automation leading the charge.`,
            `Investment in ${industry} startups reached record highs this quarter, signaling strong market confidence.`,
            `Customer expectations in ${industry} are evolving, with personalization and real-time services becoming standard.`,
            `Sustainability initiatives are becoming a key differentiator in the ${industry} sector.`,
            `Data privacy and security remain top concerns for ${industry} companies and their customers.`
        ];
    }

    // Generate content ideas using OpenAI
    async generateContentIdeas(industry, targetAudience, platform, newsData, trendsData) {
        const prompt = `You are a world-class content strategist for a startup founder. Your task is to analyze the provided raw data and generate 3 actionable content ideas.

**CONTEXT:**
- Founder's Industry: ${industry}
- Target Audience: ${targetAudience}
- Desired Platform: ${platform}

**RAW DATA FROM THE LAST 7 DAYS:**
- Recent News Headlines:
${newsData.map(item => `  - ${item.title}: ${item.description}`).join('\n')}

- Recent Google Search Snippets for industry trends:
${trendsData.map(snippet => `  - ${snippet}`).join('\n')}

**YOUR TASK:**
Based ONLY on the context and raw data provided, generate 3 unique and insightful content ideas. For each idea, provide a compelling title, a 2-sentence summary explaining the angle, and 3-5 key talking points as a bulleted list. The tone should be authoritative and forward-looking. Format your entire response as a JSON array of objects, with each object having the keys: "title", "summary", and "talking_points" (which is an array of strings).

DO NOT invent information. Synthesize what you've been given.`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const response = JSON.parse(completion.choices[0].message.content);
            
            // Handle both array response and object with ideas property
            const ideas = Array.isArray(response) ? response : (response.ideas || response.content_ideas || []);
            
            return ideas.slice(0, 3); // Ensure we only return 3 ideas
        } catch (error) {
            console.error('Error generating content ideas:', error);
            // Return mock ideas as fallback
            return this.getMockContentIdeas(industry, targetAudience, platform);
        }
    }

    // Mock content ideas for fallback
    getMockContentIdeas(industry, targetAudience, platform) {
        const platformSpecific = platform === 'LinkedIn Post' ? 'post' : 'article';
        
        return [
            {
                title: `Why ${industry} Leaders Are Betting Big on AI in 2024`,
                summary: `An analysis of recent AI adoption trends in ${industry} and what it means for the future. This ${platformSpecific} explores practical applications and ROI metrics that ${targetAudience} need to know.`,
                talking_points: [
                    'Current state of AI adoption in the industry with real examples',
                    'Three specific use cases showing measurable ROI',
                    'Common implementation challenges and how to overcome them',
                    'Future predictions based on current investment trends',
                    'Action steps for companies looking to get started'
                ]
            },
            {
                title: `The Hidden Cost of Ignoring Customer Experience in ${industry}`,
                summary: `Recent studies show that poor CX is costing ${industry} companies millions. This ${platformSpecific} breaks down the numbers and provides a roadmap for improvement that resonates with ${targetAudience}.`,
                talking_points: [
                    'Shocking statistics about customer churn and its financial impact',
                    'Three most common CX failures in the industry',
                    'Case study of a company that turned it around',
                    'Practical steps to audit and improve your CX',
                    'Tools and metrics to track progress'
                ]
            },
            {
                title: `Sustainability as a Competitive Advantage: A ${industry} Perspective`,
                summary: `How forward-thinking ${industry} companies are turning environmental responsibility into profit. This ${platformSpecific} shows ${targetAudience} why sustainability is no longer optional.`,
                talking_points: [
                    'Market data showing consumer preference for sustainable brands',
                    'Cost savings from sustainable practices in operations',
                    'Examples of successful sustainability initiatives in the industry',
                    'How to communicate sustainability efforts effectively',
                    'Getting started with small, impactful changes'
                ]
            }
        ];
    }

    // Process content generation for a single user
    async generateContentForUser(accountId) {
        try {
            // Get user settings
            const settings = await this.db.get(
                'SELECT * FROM thought_leadership_settings WHERE account_id = ? AND is_active = 1',
                accountId
            );

            if (!settings) {
                console.log(`No active thought leadership settings for account ${accountId}`);
                return;
            }

            console.log(`Generating content ideas for account ${accountId} in ${settings.industry}`);

            // Fetch data
            const [newsData, trendsData] = await Promise.all([
                this.fetchNewsArticles(settings.industry),
                this.fetchGoogleTrends(settings.industry)
            ]);

            // Generate ideas
            const ideas = await this.generateContentIdeas(
                settings.industry,
                settings.target_audience,
                settings.preferred_platform,
                newsData,
                trendsData
            );

            // Store ideas in database
            for (const idea of ideas) {
                await this.db.run(
                    `INSERT INTO content_ideas 
                    (account_id, title, summary, talking_points) 
                    VALUES (?, ?, ?, ?)`,
                    [
                        accountId,
                        idea.title,
                        idea.summary,
                        JSON.stringify(idea.talking_points)
                    ]
                );
            }

            console.log(`Successfully generated ${ideas.length} content ideas for account ${accountId}`);
        } catch (error) {
            console.error(`Error generating content for account ${accountId}:`, error);
        }
    }

    // Process all active users
    async processAllUsers() {
        try {
            const accounts = await this.db.all(
                `SELECT DISTINCT account_id 
                FROM thought_leadership_settings 
                WHERE is_active = 1`
            );

            console.log(`Processing ${accounts.length} accounts for content generation`);

            for (const account of accounts) {
                await this.generateContentForUser(account.account_id);
            }

            console.log('Completed content generation for all active accounts');
        } catch (error) {
            console.error('Error in processAllUsers:', error);
        }
    }

    // Initialize the cron job
    initializeCronJob() {
        // Run every Monday at 5 AM
        cron.schedule('0 5 * * 1', async () => {
            console.log('Starting weekly thought leadership content generation...');
            await this.processAllUsers();
        });

        console.log('Thought Leadership cron job initialized (runs every Monday at 5 AM)');
    }

    // Manual trigger for testing
    async triggerManualGeneration(accountId) {
        console.log(`Manually triggering content generation for account ${accountId}`);
        await this.generateContentForUser(accountId);
    }
}

module.exports = ThoughtLeadershipService;