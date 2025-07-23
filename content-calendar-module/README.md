# Content Calendar Module

An intelligent content calendar that automatically populates with relevant holidays and special events, providing AI-powered content suggestions tailored to your industry.

## Features

- 📅 **Dynamic Calendar View**: Clean, monthly calendar interface using FullCalendar
- 🎉 **Automated Event Population**: Automatically displays holidays and social media days
- 🏭 **Industry-Specific Filtering**: Filter events based on your business industry
- 🤖 **AI Content Suggestions**: Get 2 creative content ideas for each event
- 💾 **Smart Caching**: Caches AI responses to reduce API costs
- 🔒 **Rate Limiting**: Protects against API abuse
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js + Express
- SQLite database with Knex.js ORM
- OpenAI GPT-4 for content generation
- Calendarific API for holiday data
- Winston for logging
- Helmet for security
- Rate limiting with express-rate-limit

### Frontend
- React 18 with Vite
- FullCalendar for calendar display
- TailwindCSS for styling
- React Query for data fetching
- Axios for API calls
- React Hot Toast for notifications

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key
- Calendarific API key (optional, for external holidays)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd content-calendar-module
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

4. Run database migrations:
```bash
cd backend
npm run migrate
npm run seed
```

5. Start the development servers:
```bash
# From the root directory
npm run dev
```

The backend will run on http://localhost:3001 and frontend on http://localhost:3000

## API Endpoints

### GET /api/calendar/events
Fetch events for a specific month.

Query parameters:
- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2024)
- `industry` (optional): Industry filter
- `countryCode` (optional): Country code for holidays (default: US)

### POST /api/calendar/generate-prompt
Generate AI content suggestions for an event.

Request body:
```json
{
  "eventName": "International Coffee Day",
  "userIndustry": "Fashion Retail",
  "eventDescription": "Optional description"
}
```

### GET /api/calendar/industries
Get list of supported industries.

### GET /api/calendar/health
Health check endpoint.

## Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./database.sqlite

# External APIs
CALENDARIFIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# OpenAI Settings
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=150
OPENAI_TEMPERATURE=0.7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Adding Custom Events

Edit `backend/src/data/socialMediaHolidays.json` to add custom social media holidays:

```json
{
  "date": "MM-DD",
  "name": "Event Name",
  "tags": ["tag1", "tag2"],
  "description": "Event description"
}
```

Then run: `npm run seed`

## Scheduled Jobs

The system includes automated jobs:
- **Monthly Event Aggregation**: Runs on the 1st of each month at 2 AM UTC
- **Daily Cache Cleanup**: Runs daily at 3 AM to remove expired AI prompts

## Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables
3. Use a process manager like PM2 for the backend
4. Serve the frontend build with a web server
5. Set up proper CORS origins in the backend

## Definition of Done Checklist ✅

- [x] Monthly calendar view implemented with FullCalendar
- [x] Backend job aggregates holidays from external API
- [x] Calendar displays events fetched from backend
- [x] User can set industry in profile
- [x] Calendar shows industry-relevant events
- [x] Click event opens modal with AI prompts
- [x] AI-generated content angles display in modal
- [x] System is performant with caching
- [x] API costs monitored via rate limiting
- [x] 50+ social media holidays in database

## License

MIT