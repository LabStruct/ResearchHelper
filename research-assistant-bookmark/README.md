# 🤖 AI Research Assistant Bookmarklet

Transform any webpage into actionable insights with AI-powered summarization. This bookmarklet instantly analyzes webpage content, extracts key findings, and presents them in a clean, interactive popup.

![AI Research Assistant Demo](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v18+-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)

## ✨ Features

- 🎯 **Smart Content Extraction** - Automatically identifies and extracts main content, ignoring navigation and ads
- 🧠 **AI Summarization** - Generates concise 150-200 word summaries using OpenAI GPT-4o-mini
- 🔍 **Key Insights** - Extracts 3-7 most important findings with confidence ratings
- 📋 **Copy & Export** - One-click copying to clipboard and Markdown export
- 🎨 **Clean UI** - Non-intrusive floating popup that doesn't disrupt browsing
- 🚀 **Universal Compatibility** - Works on Chrome, Edge, Brave, and Firefox
- ⚡ **Instant Results** - Fast processing with loading indicators

## 🏗️ Architecture

```
research-assistant-bookmark/
│
├── backend/                 # Node.js + Express API server
│   ├── server.js           # Main server with /summarize endpoint
│   ├── package.json        # Dependencies and scripts
│   └── .env.example        # Environment variables template
│
├── frontend/               # Bookmarklet and UI components
│   ├── bookmarklet.js      # Main bookmarklet script
│   └── install.html        # Installation page
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### 1. Clone and Setup Backend

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd research-assistant-bookmark

# Install backend dependencies
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env file and add your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Start the Backend Server

```bash
# From the backend directory
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Install the Bookmarklet

#### Option A: Use Installation Page
1. Open `frontend/install.html` in your browser
2. Follow the interactive installation guide

#### Option B: Manual Installation
1. Show your browser's bookmarks bar:
   - **Chrome/Edge/Brave**: Press `Ctrl+Shift+B` (Windows) or `Cmd+Shift+B` (Mac)
   - **Firefox**: Press `Ctrl+Shift+B`

2. Drag this bookmarklet to your bookmarks bar:
   ```javascript
   javascript:(async()=>{const script=document.createElement('script');script.src='http://localhost:3001/static/bookmarklet.js';document.body.appendChild(script);})();
   ```

### 4. Start Researching!

1. Visit any webpage with substantial content
2. Click the "AI Research Assistant" bookmark
3. Watch as AI analyzes the content and presents key insights
4. Copy or export the summary as needed

## 📖 Usage Guide

### How It Works

1. **Content Extraction**: The bookmarklet intelligently extracts main content from the webpage, filtering out navigation, ads, and other noise
2. **AI Processing**: Content is sent to the backend API, which uses OpenAI GPT-4o-mini to generate summaries and extract key insights
3. **Results Display**: A clean popup appears showing the title, summary, and key findings with confidence levels
4. **Export Options**: Users can copy to clipboard or download as Markdown

### Best Practices

- **Content Length**: Works best on pages with at least 100 characters of meaningful content
- **Content Type**: Optimized for articles, blog posts, research papers, and documentation
- **Language**: Currently optimized for English content
- **Performance**: Keep the backend server running for instant results

### UI Features

- **Confidence Indicators**: Green (high), yellow (medium), gray (low) confidence ratings
- **Responsive Design**: Popup adapts to different screen sizes
- **Loading States**: Clear loading indicators during processing
- **Error Handling**: Helpful error messages with troubleshooting hints

## 🛠️ Development

### Backend API

The backend exposes several endpoints:

- `GET /health` - Health check endpoint
- `POST /summarize` - Main summarization endpoint
- `GET /static/*` - Serves frontend static files

#### Request Format
```json
{
  "text": "Full webpage content...",
  "title": "Page Title",
  "url": "https://example.com"
}
```

#### Response Format
```json
{
  "title": "Processed title",
  "summary": "150-200 word summary...",
  "key_points": [
    {
      "point": "Key insight or finding",
      "confidence": "high|medium|low"
    }
  ]
}
```

### Frontend Components

- **bookmarklet.js**: Main bookmarklet logic with content extraction and UI rendering
- **install.html**: User-friendly installation guide

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🔧 Configuration

### Customizing Content Extraction

Modify the `contentSelectors` array in `bookmarklet.js` to target specific content areas:

```javascript
const contentSelectors = [
  'article',           // Semantic article elements
  'main',             // Main content areas
  '[role="main"]',    // ARIA main landmarks
  '.content',         // Common content classes
  '.post-content',    // Blog post content
  '.article-content', // Article content
  '.entry-content',   // Entry content
  '.page-content'     // Page content
];
```

### Adjusting AI Parameters

Modify the OpenAI API call in `server.js`:

```javascript
{
  model: 'gpt-4o-mini',    // Change model if needed
  max_tokens: 1000,        // Adjust response length
  temperature: 0.3         // Control creativity (0.0-1.0)
}
```

## 🌐 Production Deployment

### Backend Deployment

1. **Environment Setup**:
   ```bash
   NODE_ENV=production
   OPENAI_API_KEY=your_production_api_key
   PORT=3001
   ```

2. **HTTPS Configuration**: Update API_BASE_URL in bookmarklet.js to your production domain

3. **CORS Settings**: Update CORS configuration for your domain

### Bookmarklet Update

Replace localhost URLs with your production domain:

```javascript
const API_BASE_URL = 'https://your-domain.com';
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Not enough content found" | Try on pages with more text content (>100 chars) |
| Server connection error | Verify backend is running on correct port |
| Nothing happens when clicking | Check browser console for errors, ensure bookmarklet is properly installed |
| OpenAI API errors | Verify API key is correct and has sufficient credits |
| CORS errors | Ensure CORS is properly configured for your domain |

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in API responses.

## 🔐 Security Considerations

- **API Keys**: Never expose OpenAI API keys in frontend code
- **CORS**: Configure CORS appropriately for production use
- **Content Filtering**: The system filters out scripts and styles but exercise caution with sensitive content
- **Rate Limiting**: Consider implementing rate limiting for production deployments

## 🚧 Future Enhancements

- [ ] **Source Highlighting**: Click key points to highlight original text on page
- [ ] **Multiple AI Providers**: Support for Anthropic Claude, Google PaLM
- [ ] **Content Context**: Summarize only selected text portions
- [ ] **Storage Integration**: Save summaries to Google Drive or Notion
- [ ] **Team Features**: Share summaries with team members
- [ ] **Analytics**: Track usage and most summarized content types

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push and create a pull request

## 📞 Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Documentation**: Check this README for common questions
- **API**: Refer to OpenAI documentation for API-related issues

---

**Built with ❤️ using Node.js, Express, and OpenAI GPT-4o-mini**