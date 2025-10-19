const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for bookmarklet usage
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main summarization endpoint
app.post('/summarize', async (req, res) => {
  try {
    const { text, title, url } = req.body;

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ 
        error: 'Text content is required and must be at least 100 characters' 
      });
    }

    console.log(`Processing request for URL: ${url || 'Unknown'}`);

    const summary = await generateSummary(text, title, url);
    
    res.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

async function generateSummary(text, title, url) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Please analyze this webpage content and provide a structured response:

WEBPAGE TITLE: ${title || 'Unknown'}
WEBPAGE URL: ${url || 'Unknown'}

CONTENT:
${text.substring(0, 8000)} ${text.length > 8000 ? '...[truncated]' : ''}

Please respond with ONLY a valid JSON object in this exact format:
{
  "title": "The webpage title",
  "summary": "A concise 150-200 word summary of the main content",
  "key_points": [
    {
      "point": "First key insight or finding",
      "confidence": "high|medium|low"
    },
    {
      "point": "Second key insight or finding", 
      "confidence": "high|medium|low"
    }
  ]
}

Requirements:
- Summary should be 150-200 words, focusing on main points
- Include 3-7 key_points that are the most important insights
- Each key point should be specific and actionable
- Set confidence level based on how well supported each point is by the text
- Do not include any text outside the JSON object`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that extracts key insights from web content. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      throw new Error('Invalid response format from AI service');
    }

    // Validate the response structure
    if (!parsedResponse.title || !parsedResponse.summary || !Array.isArray(parsedResponse.key_points)) {
      throw new Error('Invalid response structure from AI service');
    }

    return parsedResponse;

  } catch (error) {
    if (error.response) {
      console.error('OpenAI API error:', error.response.data);
      throw new Error(`AI service error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
}

// Serve static files for the bookmarklet
app.use('/static', express.static('../frontend'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;