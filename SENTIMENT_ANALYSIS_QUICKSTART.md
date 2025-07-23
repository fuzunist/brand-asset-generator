# Sentiment Analysis Feature - Quick Start Guide

## Testing Without API Credentials

You can test the sentiment analysis dashboard immediately without setting up Twitter or Google Cloud APIs by using mock data.

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies  
cd ../client
npm install
```

### Step 2: Generate Mock Data

```bash
cd server
npm run mock:sentiment
```

This will:
- Create sample sentiment data for the last 7 days
- Add 50 mock Twitter mentions with varied sentiments
- Set up the tracking configuration automatically

### Step 3: Start the Application

```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm start
```

### Step 4: Access the Feature

1. Open http://localhost:3000 in your browser
2. Log in with default credentials (if using test database)
3. Click "Sentiment Analysis" in the sidebar
4. You'll see:
   - Summary cards with sentiment breakdown
   - Pie chart visualization
   - Feed of recent mentions
   - Settings tab for configuration

## Setting Up Real API Access

### Twitter API Setup

1. Go to https://developer.twitter.com/
2. Apply for developer access
3. Create a new project and app
4. Generate these credentials:
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret

### Google Cloud Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Cloud Natural Language API"
4. Create a service account
5. Download the JSON key file

### Configure Environment

Create `server/.env` file:

```env
# Twitter API
TWITTER_API_KEY=your-key-here
TWITTER_API_SECRET=your-secret-here
TWITTER_ACCESS_TOKEN=your-token-here
TWITTER_ACCESS_SECRET=your-token-secret-here

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
```

### Enable Real Tracking

1. Navigate to Sentiment Analysis > Settings
2. Enter your brand keywords (e.g., "YourBrand", "@yourbrand")
3. Click "Enable Tracking"
4. The system will fetch mentions every hour

## Feature Capabilities

- **Real-time Monitoring**: Tracks brand mentions on Twitter
- **Sentiment Analysis**: Categorizes as positive, negative, or neutral
- **Visual Dashboard**: Pie chart and summary statistics
- **Mentions Feed**: Browse individual mentions with links
- **Keyword Management**: Configure what terms to track
- **Scheduled Updates**: Automatic hourly data refresh

## Troubleshooting

### No Data Showing?
- Run `npm run mock:sentiment` to generate test data
- Check if tracking is enabled in settings
- Verify keywords are configured

### API Errors?
- Check credentials in `.env` file
- Ensure APIs are enabled in cloud consoles
- Monitor console for specific error messages

### Database Issues?
- Delete `brandos.db` and restart server
- Check file permissions in server directory

## Next Steps

1. **Production Setup**: Configure real API credentials
2. **Customize Keywords**: Add your actual brand terms
3. **Monitor Costs**: Set up billing alerts for APIs
4. **Scale Considerations**: Implement caching for high volume