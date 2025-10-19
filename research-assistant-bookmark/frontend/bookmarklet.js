(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'http://localhost:3001';
  const POPUP_ID = 'ai-research-popup';

  // Check if popup already exists
  if (document.getElementById(POPUP_ID)) {
    document.getElementById(POPUP_ID).remove();
    return;
  }

  // Show loading indicator
  showLoadingIndicator();

  // Extract page content
  const pageContent = extractPageContent();
  
  if (!pageContent.text || pageContent.text.length < 100) {
    showError('Not enough content found on this page to summarize.');
    return;
  }

  // Send to backend for processing
  summarizeContent(pageContent);

  function extractPageContent() {
    const title = document.title || 'Untitled';
    const url = window.location.href;
    
    // Try to find main content areas
    const contentSelectors = [
      'article',
      'main', 
      '[role="main"]',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.page-content'
    ];
    
    let mainContent = null;
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element;
        break;
      }
    }
    
    // If no main content found, use body but exclude common noise
    if (!mainContent) {
      mainContent = document.body;
    }
    
    // Extract text content while excluding navigation and ads
    const excludeSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.nav', '.navigation', '.menu',
      '.ad', '.ads', '.advertisement', '.sidebar',
      '.comments', '.comment-section',
      'script', 'style', 'noscript'
    ];
    
    let clone = mainContent.cloneNode(true);
    
    // Remove excluded elements
    excludeSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get clean text content
    const text = clone.innerText || clone.textContent || '';
    
    return {
      title: title.trim(),
      url: url,
      text: text.trim()
    };
  }

  function showLoadingIndicator() {
    const loadingHTML = `
      <div id="${POPUP_ID}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e1e5e9;
      ">
        <div style="padding: 20px; text-align: center;">
          <div style="
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
          "></div>
          <div style="color: #333; font-size: 14px;">
            Analyzing page content...
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  function showError(message) {
    const existingPopup = document.getElementById(POPUP_ID);
    if (existingPopup) {
      existingPopup.remove();
    }
    
    const errorHTML = `
      <div id="${POPUP_ID}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: #fee;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #fcc;
      ">
        <div style="padding: 20px;">
          <div style="color: #c33; font-size: 14px; font-weight: 500;">
            Error: ${message}
          </div>
          <button onclick="document.getElementById('${POPUP_ID}').remove()" style="
            margin-top: 12px;
            padding: 8px 16px;
            background: #c33;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          ">Close</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', errorHTML);
  }

  async function summarizeContent(content) {
    try {
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response from server');
      }

      const summary = await response.json();
      displaySummary(summary);
      
    } catch (error) {
      console.error('Summarization error:', error);
      showError(error.message || 'Failed to connect to summarization service');
    }
  }

  function displaySummary(data) {
    const existingPopup = document.getElementById(POPUP_ID);
    if (existingPopup) {
      existingPopup.remove();
    }

    const keyPointsHTML = data.key_points.map((point, index) => `
      <div style="
        margin-bottom: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 3px solid ${point.confidence === 'high' ? '#28a745' : point.confidence === 'medium' ? '#ffc107' : '#6c757d'};
      ">
        <div style="font-size: 13px; font-weight: 500; color: #333;">
          ${point.point}
        </div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">
          Confidence: ${point.confidence}
        </div>
      </div>
    `).join('');

    const popupHTML = `
      <div id="${POPUP_ID}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e1e5e9;
        overflow: hidden;
      ">
        <div style="
          padding: 16px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">
            AI Research Summary
          </h3>
          <button onclick="document.getElementById('${POPUP_ID}').remove()" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            color: #666;
          ">×</button>
        </div>
        
        <div style="max-height: calc(80vh - 120px); overflow-y: auto; padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #333;">
              ${data.title}
            </h4>
            <div style="font-size: 13px; line-height: 1.5; color: #555;">
              ${data.summary}
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #333;">
              Key Insights
            </h4>
            ${keyPointsHTML}
          </div>
        </div>
        
        <div style="
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #e1e5e9;
          display: flex;
          gap: 8px;
        ">
          <button onclick="copyToClipboard()" style="
            flex: 1;
            padding: 8px 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
          ">Copy Summary</button>
          <button onclick="exportContent()" style="
            flex: 1;
            padding: 8px 12px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
          ">Export</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Add global functions for buttons
    window.copyToClipboard = function() {
      const text = `# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.key_points.map((p, i) => `${i + 1}. ${p.point} (${p.confidence} confidence)`).join('\n')}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Summary copied to clipboard!');
      });
    };

    window.exportContent = function() {
      const blob = new Blob([`# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.key_points.map((p, i) => `${i + 1}. ${p.point} (${p.confidence} confidence)`).join('\n')}\n\n---\nGenerated by AI Research Assistant`], 
        { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }

})();