# Times Aura News API - cURL Commands

This document provides comprehensive cURL commands for testing all API endpoints.

## Prerequisites

1. Start the server:
```bash
npm start
# or
npm run dev
```

2. The server will run on `http://localhost:3000` (or your configured PORT)

## Basic API Information

### 1. Get API Information
```bash
curl -X GET "http://localhost:3000/"
```

### 2. Get API Details
```bash
curl -X GET "http://localhost:3000/api"
```

### 3. Health Check
```bash
curl -X GET "http://localhost:3000/api/health"
```

## News Endpoints

### 4. Get Basic News (Top Stories)
```bash
curl -X GET "http://localhost:3000/api/v1/news"
```

### 5. Get News with Category
```bash
# Technology news
curl -X GET "http://localhost:3000/api/v1/news?category=technology"

# Business news
curl -X GET "http://localhost:3000/api/v1/news?category=business"

# World news
curl -X GET "http://localhost:3000/api/v1/news?category=world"

# Health news
curl -X GET "http://localhost:3000/api/v1/news?category=health"

# Sports news
curl -X GET "http://localhost:3000/api/v1/news?category=sports"

# Entertainment news
curl -X GET "http://localhost:3000/api/v1/news?category=entertainment"

# Science news
curl -X GET "http://localhost:3000/api/v1/news?category=science"
```

### 6. Get News with Limit
```bash
# Get 10 articles
curl -X GET "http://localhost:3000/api/v1/news?limit=10"

# Get 50 technology articles
curl -X GET "http://localhost:3000/api/v1/news?category=technology&limit=50"
```

### 7. Get News with Custom RSS Feeds
```bash
# Using BBC News RSS
curl -X GET "http://localhost:3000/api/v1/news?feeds=https://feeds.bbci.co.uk/news/rss.xml"

# Using multiple custom feeds
curl -X GET "http://localhost:3000/api/v1/news?feeds=https://feeds.bbci.co.uk/news/rss.xml,https://rss.cnn.com/rss/edition.rss"

# Custom feeds with limit
curl -X GET "http://localhost:3000/api/v1/news?feeds=https://feeds.bbci.co.uk/news/rss.xml&limit=20"
```

### 8. Get News with Sorting
```bash
# Sort by newest first (descending - default)
curl -X GET "http://localhost:3000/api/v1/news?sort=desc"

# Sort by oldest first (ascending)
curl -X GET "http://localhost:3000/api/v1/news?sort=asc"
```

### 9. Get News without Cache
```bash
curl -X GET "http://localhost:3000/api/v1/news?useCache=false"
```

### 10. Get Available Categories
```bash
curl -X GET "http://localhost:3000/api/v1/news/categories"
```

### 11. Get Multiple Categories (POST)
```bash
curl -X POST "http://localhost:3000/api/v1/news/multiple" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["technology", "business"],
    "limit": 10
  }'

# Get multiple categories with more options
curl -X POST "http://localhost:3000/api/v1/news/multiple" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["technology", "business", "health", "sports"],
    "limit": 5,
    "useCache": true
  }'
```

## Cache Management

### 12. Get Cache Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/news/cache/stats"
```

### 13. Clear Cache
```bash
curl -X DELETE "http://localhost:3000/api/v1/news/cache"
```

## Advanced Examples

### 14. Complete News Request with All Parameters
```bash
curl -X GET "http://localhost:3000/api/v1/news?category=technology&limit=25&sort=desc&useCache=true"
```

### 15. Test Error Handling
```bash
# Invalid category
curl -X GET "http://localhost:3000/api/v1/news?category=invalid_category"

# Invalid limit
curl -X GET "http://localhost:3000/api/v1/news?limit=invalid_limit"

# Invalid limit range
curl -X GET "http://localhost:3000/api/v1/news?limit=1000"
```

### 16. Pretty Print JSON Response
```bash
# Using jq for pretty printing (if installed)
curl -X GET "http://localhost:3000/api/v1/news?limit=5" | jq

# Using python for pretty printing
curl -X GET "http://localhost:3000/api/v1/news?limit=5" | python -m json.tool
```

## Response Format Examples

### Successful News Response
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

### Error Response
```json
{
  "code": 400,
  "error": {
    "msg": "Invalid category. Available categories: topStories, world, business, technology, health, sports, entertainment, science",
    "extra": null
  }
}
```

## Testing Script

You can also use the provided test script:

```bash
# Run the test script
npm test

# Run examples
npm run examples
```

## Available Categories

- `topStories` - Top stories from Google News
- `world` - World news and international events
- `business` - Business and financial news
- `technology` - Technology and innovation news
- `health` - Health and medical news
- `sports` - Sports news and updates
- `entertainment` - Entertainment and celebrity news
- `science` - Science and research news

## Notes

- All endpoints return JSON responses
- The API supports CORS for cross-origin requests
- Cache TTL is set to 5 minutes by default
- Maximum limit is 500 articles per request
- All timestamps are in ISO 8601 format
- The API includes comprehensive error handling and validation
