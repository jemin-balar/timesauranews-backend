# Times Aura News API

A comprehensive Node.js + Express module for fetching Google News RSS feeds and returning formatted JSON data. This API provides real-time news aggregation with caching, deduplication, and multiple category support.

## Features

- 🔄 **RSS Feed Parsing**: Fetches and parses Google News RSS feeds using `rss-parser`
- 📰 **Multiple Categories**: Support for various news categories (world, business, technology, etc.)
- 🚀 **Caching**: In-memory caching with TTL to reduce API calls
- 🔍 **Deduplication**: Removes duplicate articles based on links
- 📊 **Sorting**: Sort articles by publication date (ascending/descending)
- 🖼️ **Thumbnail Support**: Extracts images from RSS feeds
- 📝 **Logging**: Comprehensive logging with different levels
- 🛡️ **Error Handling**: Robust error handling and validation
- 🔧 **Modular Design**: Clean, maintainable, and extensible code structure

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
DEBUG=true
```

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### 1. Get News
**GET** `/api/news`

Fetch news from RSS feeds with various options.

**Query Parameters:**
- `category` (optional): News category (default: 'topStories')
  - Available: `topStories`, `world`, `business`, `technology`, `health`, `sports`, `entertainment`, `science`
- `limit` (optional): Maximum number of articles (default: 100, max: 500)
- `feeds` (optional): Comma-separated custom RSS feed URLs
- `useCache` (optional): Enable/disable caching (default: 'true')
- `sort` (optional): Sort order - 'asc' or 'desc' (default: 'desc')

**Example:**
```bash
# Get top stories
GET /api/news

# Get technology news with limit
GET /api/news?category=technology&limit=50

# Use custom feeds
GET /api/news?feeds=https://feeds.bbci.co.uk/news/rss.xml,https://rss.cnn.com/rss/edition.rss

# Disable caching
GET /api/news?useCache=false
```

### 2. Get Multiple Categories
**POST** `/api/news/multiple`

Fetch news from multiple categories in a single request.

**Request Body:**
```json
{
  "categories": ["technology", "business", "health"],
  "limit": 20,
  "useCache": true
}
```

### 3. Get Categories
**GET** `/api/news/categories`

Get available news categories and their descriptions.

### 4. Cache Management

**Get Cache Statistics:**
```bash
GET /api/news/cache/stats
```

**Clear Cache:**
```bash
DELETE /api/news/cache
```

### 5. Health Check
**GET** `/health`

Check API health status.

## Response Format

All news endpoints return data in the following format:

```json
{
  "code": 200,
  "message": "News fetched successfully",
  "data": [
    {
      "title": "Article Title",
      "link": "https://example.com/article",
      "summary": "Article summary or description",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "source": "example.com",
      "thumbnail": "https://example.com/image.jpg",
      "category": "technology"
    }
  ],
  "meta": {
    "total": 25,
    "category": "technology",
    "limit": 50,
    "cached": true
  }
}
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `DEBUG`: Enable debug logging (true/false)

### News Constants

The API uses configurable constants in `constant/text.constant.js`:

- `defaultCacheTTL`: Cache time-to-live (5 minutes)
- `maxArticles`: Maximum articles per request (100)
- `supportedImageFormats`: Supported image formats for thumbnails
- `defaultCategory`: Default news category

## Architecture

### Project Structure

```
Times-Aura-News/
├── controllers/
│   └── newsController.js      # API route handlers
├── services/
│   └── newsService.js         # RSS parsing and data processing
├── utils/
│   ├── logger.js              # Logging utility
│   ├── cacheManager.js        # In-memory caching
│   └── utils.js               # Common utilities
├── constant/
│   └── text.constant.js       # Constants and configurations
├── routes/
│   └── index.js              # Route definitions
├── common/
│   └── res.common.js         # Response helpers
└── index.js                  # Main application file
```

### Key Components

1. **NewsService**: Core RSS parsing and data formatting
2. **CacheManager**: In-memory caching with TTL
3. **Logger**: Structured logging with different levels
4. **NewsController**: API endpoint handlers
5. **Response Helpers**: Consistent API response format

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid parameters or malformed requests
- **500 Internal Server Error**: Server-side errors with detailed logging
- **Graceful Degradation**: Continues operation even if some feeds fail

## Caching Strategy

- **Feed-level caching**: Individual RSS feeds are cached separately
- **Result caching**: Merged and processed results are cached
- **TTL-based expiration**: Automatic cleanup of expired cache entries
- **Memory efficient**: Configurable cache limits and cleanup intervals

## Performance Features

- **Parallel Processing**: Multiple RSS feeds fetched simultaneously
- **Deduplication**: Removes duplicate articles based on links
- **Efficient Sorting**: Optimized sorting by publication date
- **Memory Management**: Automatic cache cleanup and memory monitoring

## Extensibility

The modular design allows easy extension:

1. **New Feed Sources**: Add new RSS feed URLs to `googleNewsFeeds`
2. **Custom Parsers**: Extend `NewsService` for different feed formats
3. **Additional Endpoints**: Add new routes in `newsController`
4. **Cache Backends**: Replace `CacheManager` with Redis or other backends

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing the API

```bash
# Test basic news endpoint
curl "http://localhost:3000/api/news?category=technology&limit=10"

# Test categories endpoint
curl "http://localhost:3000/api/news/categories"

# Test health check
curl "http://localhost:3000/health"
```

## Production Considerations

- **Rate Limiting**: Consider implementing rate limiting for production
- **Redis Caching**: Replace in-memory cache with Redis for scalability
- **Monitoring**: Add application monitoring and metrics
- **Security**: Implement authentication and authorization as needed
- **Load Balancing**: Use load balancers for high availability

## License

ISC License
