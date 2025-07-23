# Brand Sentiment Analysis Dashboard - Technical Documentation

## Overview
The Brand Sentiment Analysis Dashboard is an MVP feature that monitors social media mentions of a brand and analyzes their sentiment using Natural Language Processing. The feature tracks mentions from Twitter/X and categorizes them as positive, negative, or neutral.

## Technical Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **node-cron** for scheduled jobs (runs hourly)
- **twitter-api-v2** for Twitter API integration
- **@google-cloud/language** for sentiment analysis
- **JWT** for authentication

### Frontend
- **React** with React Router
- **Recharts** for data visualization (pie chart)
- **Tailwind CSS** with shadcn/ui components
- **Axios** for API calls

## Database Schema

### New Tables

#### `brand_mentions`
```sql
CREATE TABLE brand_mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_identity_id INTEGER NOT NULL,
    source TEXT NOT NULL CHECK(source IN ('twitter')),
    source_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    source_url TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK(sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE,
    UNIQUE(source, source_id)
);
```

#### `sentiment_tracking_config`
```sql
CREATE TABLE sentiment_tracking_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_identity_id INTEGER NOT NULL,
    tracking_enabled BOOLEAN DEFAULT 1,
    keywords TEXT NOT NULL, -- JSON array
    last_fetch_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE,
    UNIQUE(brand_identity_id)
);
```

## API Endpoints

### GET `/api/sentiment/config`
Get current sentiment tracking configuration
- **Auth Required**: Yes
- **Response**: Configuration object with keywords and tracking status

### POST `/api/sentiment/config`
Update sentiment tracking configuration
- **Auth Required**: Yes (Owner only)
- **Body**: `{ keywords: string[], trackingEnabled: boolean }`

### GET `/api/sentiment/summary`
Get sentiment summary for dashboard
- **Auth Required**: Yes
- **Query Params**: `days` (default: 7)
- **Response**: `{ positive: number, negative: number, neutral: number, total: number }`

### GET `/api/sentiment/feed`
Get recent mentions with sentiment
- **Auth Required**: Yes
- **Query Params**: `limit` (default: 20), `offset` (default: 0)
- **Response**: Array of mention objects

## Key Features

### 1. Automated Data Collection
- Scheduled job runs every hour
- Fetches mentions from Twitter API v2
- Avoids duplicates using `since_id` parameter
- Stores raw mentions in database

### 2. Sentiment Analysis
- Uses Google Cloud Natural Language API
- Sentiment scores range from -1.0 to 1.0
- Categorization logic:
  - Positive: score > 0.2
  - Negative: score < -0.2
  - Neutral: -0.2 ≤ score ≤ 0.2

### 3. Dashboard UI
- **Summary Cards**: Display total mentions and breakdown by sentiment
- **Pie Chart**: Visual representation of sentiment distribution
- **Mentions Feed**: Scrollable list of recent mentions with:
  - Color-coded sentiment badges
  - Author information
  - Direct link to original tweet
  - Timestamp
  - Load more pagination

### 4. Configuration Settings
- Enable/disable tracking
- Manage tracked keywords
- View last update time

## Setup Instructions

### 1. Environment Variables
Add to `server/.env`:
```env
# Twitter API v2 Credentials
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_SECRET=your-twitter-access-secret

# Google Cloud Natural Language API
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account-key.json
```

### 2. API Access Requirements

#### Twitter API v2
1. Apply for developer access at https://developer.twitter.com/
2. Create a project and app
3. Generate API keys and access tokens
4. Ensure you have at least "Basic" tier access for Recent Search endpoint

#### Google Cloud Natural Language API
1. Create a Google Cloud project
2. Enable the Natural Language API
3. Create a service account
4. Download the JSON key file
5. Set the file path in `GOOGLE_APPLICATION_CREDENTIALS`

### 3. Database Migration
The database tables are automatically created when the server starts via the `setupDatabase()` function.

### 4. Start the Services
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start backend (includes scheduler)
cd server && npm start

# Start frontend
cd client && npm start
```

## Cost Considerations

### Twitter API Pricing
- Basic tier: $100/month for up to 10,000 tweets
- Pro tier: Higher limits but more expensive
- Rate limits apply: 300 requests per 15 minutes

### Google Cloud Natural Language API
- First 5,000 units free per month
- $1.00 per 1,000 units after that
- Each sentiment analysis request = 1 unit

### Cost Optimization Strategies
1. Cache sentiment results to avoid re-analyzing
2. Batch process mentions during off-peak hours
3. Implement smart keyword filtering
4. Consider using open-source models (Hugging Face) for scale

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Rate Limiting**: Implement to prevent API abuse
3. **Data Privacy**: Only store public tweet data
4. **Access Control**: Sentiment config restricted to account owners

## Future Enhancements

1. **Multi-platform Support**: Instagram, LinkedIn, Reddit
2. **Advanced Analytics**: Trend analysis, topic extraction
3. **Real-time Alerts**: Notify on negative sentiment spikes
4. **Competitor Analysis**: Track competitor mentions
5. **Export Features**: CSV/PDF reports
6. **Sentiment History**: Time-series graphs
7. **AI Response Suggestions**: Auto-generate responses to mentions

## Troubleshooting

### Common Issues

1. **No mentions appearing**
   - Check if tracking is enabled
   - Verify keywords are correctly set
   - Ensure API credentials are valid
   - Check scheduler logs

2. **Sentiment always neutral**
   - Verify Google Cloud API is accessible
   - Check for API quota limits
   - Review error logs in console

3. **Rate limit errors**
   - Implement exponential backoff
   - Reduce polling frequency
   - Optimize keyword queries

## Definition of Done Checklist ✓

- [x] Database schema implemented
- [x] Backend API endpoints created
- [x] Scheduled job for data collection
- [x] Twitter API integration
- [x] Google Cloud NLP integration
- [x] Frontend dashboard with pie chart
- [x] Mentions feed with pagination
- [x] Configuration settings UI
- [x] Authentication and authorization
- [x] Error handling for API failures
- [x] Environment variables template
- [x] Navigation menu integration
- [x] Responsive design
- [x] Cost monitoring considerations documented