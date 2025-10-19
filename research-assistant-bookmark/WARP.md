# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Backend Setup and Development
```bash
# Install backend dependencies
cd backend && npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Health check
curl http://localhost:3001/health
```

### Environment Configuration
```bash
# Copy and configure environment variables
cd backend
cp .env.example .env
# Edit .env to add your OPENAI_API_KEY
```

### Testing the Bookmarklet
```bash
# Start backend server first
cd backend && npm start

# Then open frontend/install.html in browser to install bookmarklet
# Or manually drag this to bookmarks bar:
# javascript:(async()=>{const script=document.createElement('script');script.src='http://localhost:3001/static/bookmarklet.js';document.body.appendChild(script);})();
```

## Architecture Overview

This is a **bookmarklet-based AI research assistant** that summarizes webpage content using OpenAI's GPT-4o-mini. The architecture consists of two main components:

### Backend (`/backend/`)
- **Express.js API server** running on port 3001
- **Single endpoint architecture**: `/summarize` POST endpoint accepts webpage content and returns AI-generated summaries
- **OpenAI integration**: Uses GPT-4o-mini with structured JSON prompting to extract summaries and key insights with confidence ratings
- **CORS configuration**: Wide-open CORS (`origin: '*'`) to support bookmarklet usage across domains
- **Static file serving**: Serves frontend files at `/static/*` path

### Frontend (`/frontend/`)
- **Pure vanilla JavaScript bookmarklet** - no frameworks or build process
- **Content extraction engine**: Uses intelligent selectors to find main content (`article`, `main`, `[role="main"]`, etc.) and excludes navigation/ads
- **Floating UI popup**: Creates non-intrusive overlay with summary results
- **Export functionality**: Supports clipboard copy and Markdown file download

### Data Flow
1. Bookmarklet extracts clean text content from webpage using semantic selectors
2. Content sent to `/summarize` endpoint with title, URL, and extracted text
3. Backend uses OpenAI API to generate structured JSON response with summary and key points
4. Frontend displays results in styled popup with confidence indicators
5. User can copy to clipboard or export as Markdown

## Key Configuration Points

### Content Extraction Selectors
The bookmarklet prioritizes content discovery in this order:
```javascript
const contentSelectors = [
  'article', 'main', '[role="main"]',
  '.content', '.post-content', '.article-content',
  '.entry-content', '.page-content'
];
```

### OpenAI API Parameters
```javascript
{
  model: 'gpt-4o-mini',
  max_tokens: 1000,
  temperature: 0.3  // Low temperature for consistent, factual summaries
}
```

### Environment Variables
- `OPENAI_API_KEY`: Required for AI functionality
- `PORT`: Server port (default 3001)
- `NODE_ENV`: Controls error detail visibility

## Important Implementation Details

### No Build Process
This project intentionally uses no build tools - the bookmarklet must be pure JavaScript that can be injected into any webpage. All code is vanilla JS with inline styles.

### Content Length Validation
- Minimum 100 characters of content required for processing
- Content truncated to 8000 characters before sending to OpenAI to stay within token limits

### Error Handling Strategy
- Frontend gracefully handles network errors with user-friendly messages
- Backend provides detailed errors in development, sanitized in production
- OpenAI API errors are caught and re-thrown with helpful context

### Security Considerations
- API key is server-side only, never exposed to frontend
- Wide CORS policy necessary for bookmarklet functionality across domains
- Content filtering removes scripts/styles but exercise caution with sensitive pages

### Popup Management
- Popup uses `z-index: 999999` to appear above most website elements
- Automatically removes existing popup before showing new one
- Click-outside-to-close and explicit close button for user control