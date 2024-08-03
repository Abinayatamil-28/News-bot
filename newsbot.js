const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PORT = process.env.PORT || 3000;

// Your NewsAPI key
const NEWS_API_KEY = '689148296875407c96f8e86a7fa54268';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Function to fetch news from NewsAPI
async function fetchNews(keyword) {
  try {
    console.log(`Fetching news for keyword: ${keyword}`); // Log the keyword used for the request
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: keyword,
        apiKey: NEWS_API_KEY,
        language: 'en'
      }
    });
    console.log('API Response:', response.data); // Log the full API response
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error.message); // Log specific error message
    return [];
  }
}

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Log the request method and URL

  if (req.method === 'GET' && req.url === '/') {
    // Serve the static HTML file
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/news') {
    console.log('Handling /news route'); // Log when handling the /news route
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        const keyword = parsedBody.keyword;

        if (!keyword) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Keyword is required' }));
          return;
        }

        const newsArticles = await fetchNews(keyword);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ articles: newsArticles }));
      } catch (error) {
        console.error('Error processing request:', error.message); // Log error during request processing
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
