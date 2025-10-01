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

## Design-Specific Endpoints

### 4.1. Breaking News Carousel
```bash
# Get breaking news (mixed categories)
curl -X GET "http://localhost:3000/api/v1/news/breaking"

# Get breaking news with limit
curl -X GET "http://localhost:3000/api/v1/news/breaking?limit=6"

# Get breaking news for specific category - Business
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=business"

# Get breaking news for specific category - Technology
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=technology"

# Get breaking news for specific category - Finance
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=finance"

# Get breaking news for specific category - Marketing
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=marketing"

# Get breaking news for specific category - Leadership
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=leadership"

# Get breaking news for specific category - Startups
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=startups"

# Get breaking news with category and limit
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=business&limit=8"

# Test invalid category (should return error)
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=health"
```

### 4.2. Article Details API
```bash
# Get article detail by breaking news ID (from breaking news list)
# First get breaking news to get an ID, then use it here
curl -X GET "http://localhost:3000/api/v1/news/breaking?category=business&limit=1"

# Then use the unique ID from the response:
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID_FROM_RESPONSE]"

# Get article detail with category context (recommended for breaking news)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=business"

# Get article detail with category context for technology
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=technology"

# Get article detail with category context for finance (specific finance RSS)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=finance"

# Get article detail with category context for marketing (specific marketing RSS)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=marketing"

# Get article detail with category context for leadership (specific leadership RSS)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=leadership"

# Get article detail with category context for startups (specific startup RSS)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]?category=startups"

# Get article detail without category (searches all feeds automatically)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]"

# Example: For your specific article
# Breaking news shows: "category": "LEADERSHIP"
# Use in article details: ?category=leadership (will show LEADERSHIP in response)
curl -X GET "http://localhost:3000/api/v1/news/article/mg7jmwio-u096ax?category=leadership"
```

### 4.3. Related Articles API
```bash
# Get related articles for a specific article ID (content-based matching)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]/related"

# Get related articles with custom limit (default is 2)
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]/related?limit=4"

# Get related articles with more results
curl -X GET "http://localhost:3000/api/v1/news/article/[UNIQUE_ID]/related?limit=6"

# Example with your specific article ID
curl -X GET "http://localhost:3000/api/v1/news/article/mg7jmwio-u096ax/related?limit=3"

# Example with another article ID
curl -X GET "http://localhost:3000/api/v1/news/article/mg7flyxc-axdkbf/related?limit=4"

# Test with different limits
curl -X GET "http://localhost:3000/api/v1/news/article/mg7jmwio-u096ax/related?limit=1"
curl -X GET "http://localhost:3000/api/v1/news/article/mg7jmwio-u096ax/related?limit=5"

# Response will include category field for article details API:
# {
#   "code": 200,
#   "message": "Related articles fetched successfully",
#   "data": [
#     {
#       "id": "unique-id-1",
#       "image": "https://picsum.photos/300/200?random=123",
#       "category": "BUSINESS",
#       "title": "Related Article Title",
#       "publishedAt": "2025-10-01T05:26:12.000Z",
#       "link": "https://news.google.com/rss/articles/...",
#       "source": "news.google.com"
#     }
#   ]
# }
```

### 5. Latest Articles API
```bash
# Get latest articles from all categories (default limit: 6)
curl -X GET "http://localhost:3000/api/v1/news/latest"

# Get latest articles with custom limit
curl -X GET "http://localhost:3000/api/v1/news/latest?limit=10"

# Get latest articles from specific category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=business"

# Get latest articles from technology category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=technology"

# Get latest articles from finance category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=finance"

# Get latest articles from marketing category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=marketing"

# Get latest articles from leadership category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=leadership"

# Get latest articles from startups category
curl -X GET "http://localhost:3000/api/v1/news/latest?category=startups"

# Combine category and limit
curl -X GET "http://localhost:3000/api/v1/news/latest?category=business&limit=8"
curl -X GET "http://localhost:3000/api/v1/news/latest?category=technology&limit=4"
```

### 6. Get News with Category
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
