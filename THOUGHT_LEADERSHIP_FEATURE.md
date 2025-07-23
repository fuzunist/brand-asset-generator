# Thought Leadership Planner Feature

## Overview

The Thought Leadership Planner is an AI-powered feature that helps founders establish themselves as industry experts by providing weekly content ideas based on current trends and news. This feature uses GPT-4 to analyze industry data and generate actionable content suggestions tailored to the user's target audience and preferred platform.

## Technical Implementation

### Backend Components

1. **ThoughtLeadershipService** (`server/thoughtLeadershipService.js`)
   - Core service handling all business logic
   - Integrates with external APIs (NewsAPI, SERP API)
   - Uses OpenAI GPT-4 for content synthesis
   - Includes mock data fallbacks for development

2. **Database Schema**
   - `thought_leadership_settings`: Stores user preferences
   - `content_ideas`: Stores generated content ideas with JSON-encoded talking points

3. **API Endpoints**
   - `GET /api/thought-leadership/settings`: Retrieve user settings
   - `POST /api/thought-leadership/settings`: Save/update user settings
   - `GET /api/thought-leadership/ideas`: Fetch generated content ideas
   - `PUT /api/thought-leadership/ideas/:id/read`: Mark idea as read
   - `PUT /api/thought-leadership/ideas/:id/used`: Mark idea as used
   - `POST /api/thought-leadership/generate`: Manually trigger content generation

4. **Scheduled Job**
   - Runs every Monday at 5 AM using node-cron
   - Automatically generates content for all active users

### Frontend Component

**ThoughtLeadership.js** (`client/src/components/ThoughtLeadership.js`)
- Settings configuration form
- Content ideas display with expandable cards
- Read/Used status tracking
- Manual generation trigger

## User Flow

1. **Initial Setup**
   - User navigates to Thought Leadership page
   - Fills out settings form:
     - Industry/Sector (e.g., "Fintech", "SaaS")
     - Target Audience (e.g., "Venture Capitalists")
     - Preferred Platform ("LinkedIn Post" or "Blog Article")

2. **Content Generation**
   - System fetches recent news and trends for the industry
   - AI analyzes data and generates 3 content ideas
   - Each idea includes:
     - Compelling title
     - 2-sentence summary
     - 3-5 key talking points

3. **Content Management**
   - Ideas are displayed as cards
   - Click to expand and see talking points
   - Mark as "Read" (automatic on click)
   - Mark as "Used" when content is created

## AI Prompt Engineering

The master prompt is carefully structured to:
- Provide clear context about the user's industry and audience
- Include raw data from news and search APIs
- Request specific output format (JSON)
- Emphasize synthesis over invention
- Maintain authoritative, forward-looking tone

## Configuration

### Required Environment Variables

```bash
# Required for AI functionality
OPENAI_API_KEY=your-openai-api-key-here

# Optional - will use mock data if not provided
NEWS_API_KEY=your-newsapi-key-here      # Get from newsapi.org
SERP_API_KEY=your-serpapi-key-here      # Get from serpapi.com
```

### Mock Data

The system includes comprehensive mock data for:
- Fintech, SaaS, and E-commerce industries
- News articles and trend snippets
- Fallback content ideas

This ensures the feature works even without external API keys during development.

## Testing

Run the test script to verify functionality:

```bash
cd server
node test_thought_leadership.js
```

This will:
1. Create test settings
2. Generate content ideas
3. Display the results

## API Cost Monitoring

The feature involves multiple paid API calls:
- OpenAI GPT-4: ~$0.03 per user per week
- NewsAPI: Free tier available (500 requests/day)
- SERP API: $50/month for 5,000 searches

Monitor usage carefully as costs scale with active users.

## Future Enhancements

1. **Content Calendar Integration**: Schedule posts directly
2. **Performance Analytics**: Track which ideas perform best
3. **Multiple Industries**: Support founders with diverse portfolios
4. **Team Collaboration**: Share ideas with team members
5. **Export Functionality**: Download ideas as PDF/CSV
6. **Custom Data Sources**: Add RSS feeds, specific publications
7. **Tone Customization**: Adjust voice for different audiences

## Troubleshooting

### Common Issues

1. **No ideas generated**
   - Check OpenAI API key is valid
   - Verify user has configured settings
   - Check server logs for API errors

2. **Mock data appearing in production**
   - Ensure NEWS_API_KEY and SERP_API_KEY are set
   - Verify API keys are valid and have quota

3. **Cron job not running**
   - Check server logs for cron initialization
   - Verify server stays running continuously
   - Consider using a process manager like PM2

## Security Considerations

- All API keys stored as environment variables
- User settings linked to authenticated accounts
- Content ideas scoped to account level
- No sensitive data in generated content