# Times Aura News API - Design-Specific Endpoints

This document outlines the design-specific APIs created to match the "Dynamic Business" website design.

## 🎯 Design-Specific APIs

### 1. Breaking News Carousel
**Endpoint:** `GET /api/v1/news/breaking`
**Description:** Get breaking news articles for horizontal carousel display
**Query Parameters:**
- `limit` (optional): Number of articles (default: 4)
- `category` (optional): Filter by specific design category (business, technology, finance, marketing, leadership, startups)

**Response Format:**
```json
{
  "code": 200,
  "message": "Breaking news fetched successfully",
  "data": {
    "breakingNews": [
      {
        "id": "1a2b3c4d5e6f-abc12345",
        "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
        "category": "BUSINESS",
        "title": "Market Analysis: Tech Stocks Surge",
        "publishedAt": "2024-01-15T10:30:00.000Z",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 4,
    "category": "business",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

**Note:** The `id` field contains a unique identifier generated from article content, timestamp, and source. Each article has a guaranteed unique ID that can be used with the Article Details API to fetch the full article information.

### 2. Featured Article
**Endpoint:** `GET /api/v1/news/featured`
**Description:** Get the main featured article for prominent display
**Response Format:**
```json
{
  "code": 200,
  "message": "Featured article fetched successfully",
  "data": {
    "id": "featured-1",
    "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
    "category": "BUSINESS",
    "title": "The Future of AI in Business: Transforming Industries",
    "description": "An in-depth look at how artificial intelligence is revolutionizing business operations...",
    "author": "By news.google.com",
    "date": "3/15/2024",
    "link": "https://example.com/article",
    "source": "news.google.com"
  }
}
```

### 3. Latest Articles Grid
**Endpoint:** `GET /api/v1/news/latest`
**Description:** Get latest articles for 2x3 grid display
**Query Parameters:**
- `limit` (optional): Number of articles (default: 6)

**Response Format:**
```json
{
  "code": 200,
  "message": "Latest articles fetched successfully",
  "data": {
    "latestArticles": [
      {
        "id": "latest-1",
        "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
        "category": "TECHNOLOGY",
        "title": "The Future of AI in Business: Transforming Industries",
        "description": "An in-depth look at how artificial intelligence is revolutionizing business operations...",
        "author": "news.google.com",
        "date": "3/15/2024",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 6
  }
}
```

### 4. More Articles
**Endpoint:** `GET /api/v1/news/more`
**Description:** Get additional articles for "More Articles" section
**Query Parameters:**
- `limit` (optional): Number of articles (default: 4)

**Response Format:**
```json
{
  "code": 200,
  "message": "More articles fetched successfully",
  "data": {
    "moreArticles": [
      {
        "id": "more-1",
        "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
        "title": "Leadership in the Digital Age",
        "description": "The essential skills and approaches needed for effective leadership...",
        "author": "news.google.com",
        "date": "3/10/2024",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 4
  }
}
```

## 🔗 Related Articles API

### 8. Related Articles
**Endpoint:** `GET /api/v1/news/article/:id/related`
**Description:** Get related articles for a specific article based on content similarity
**Query Parameters:**
- `limit` (optional): Number of related articles (default: 2)

**Response Format:**
```json
{
  "code": 200,
  "message": "Related articles fetched successfully",
  "data": [
    {
      "id": "2b3c4d5e6f7g-def67890",
      "image": "https://picsum.photos/300/200?random=123456",
      "category": "BUSINESS",
      "title": "AI Revolution in Business",
      "publishedAt": "2024-01-15T09:30:00.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    },
    {
      "id": "3c4d5e6f7g8h-ghi78901",
      "image": "https://picsum.photos/300/200?random=789012",
      "category": "TECHNOLOGY",
      "title": "Tech Stocks Surge in Market",
      "publishedAt": "2024-01-15T08:45:00.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    }
  ]
}
```

**Note:** 
- Each related article has a unique ID that can be used with the Article Details API
- Related articles are found based on content similarity (title, summary, keywords, source, category)
- Response format matches breaking news API format
- Articles are automatically filtered to exclude the original article

## 📋 Category Mapping

When using the Article Details API with breaking news IDs, use these category mappings:

| Breaking News Display Category | Article Details Category | RSS Feed Source |
|-------------------------------|---------------------------|-----------------|
| BUSINESS | `business` | Google News Business |
| TECHNOLOGY | `technology` | Google News Technology |
| FINANCE | `finance` | Google News Finance (finance+economy+stock+market) |
| MARKETING | `marketing` | Google News Marketing (marketing+advertising+brand) |
| LEADERSHIP | `leadership` | Google News Leadership (leadership+management+CEO) |
| STARTUPS | `startups` | Google News Startups (startup+entrepreneur+venture) |

**Example:**
- Breaking news shows: `"category": "LEADERSHIP"`
- Use in article details: `?category=leadership` (will show LEADERSHIP in response)
- Breaking news shows: `"category": "MARKETING"`
- Use in article details: `?category=marketing` (will show MARKETING in response)

**Important:** The category parameter in article details API determines the display category in the response. Use the same category that was shown in breaking news.

## 📰 Latest Articles API

### 5. Latest Articles
**Endpoint:** `GET /api/v1/news/latest`
**Description:** Get latest articles from all categories or specific category for grid display
**Query Parameters:**
- `limit` (optional): Number of articles (default: 6)
- `category` (optional): Filter by specific category (business, technology, finance, marketing, leadership, startups)

**Response Format:**
```json
{
  "code": 200,
  "message": "Latest articles fetched successfully",
  "data": [
    {
      "id": "mg7jmwio-u096ax",
      "image": "https://picsum.photos/300/200?random=123456",
      "category": "LEADERSHIP",
      "title": "Latest Article Title",
      "publishedAt": "2025-10-01T05:26:12.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    },
    {
      "id": "mg7flyxc-axdkbf",
      "image": "https://picsum.photos/300/200?random=789012",
      "category": "BUSINESS",
      "title": "Another Latest Article",
      "publishedAt": "2025-10-01T04:15:30.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    }
  ]
}
```

**Note:**
- Response format matches breaking news API exactly
- Each article has a unique ID for article details API
- Articles are fetched from design-specific categories only (same as breaking news)
- Available categories: BUSINESS, TECHNOLOGY, FINANCE, MARKETING, LEADERSHIP, STARTUPS
- Sorted by publication date (newest first)

## 🔧 Sidebar APIs

### 5. Sidebar Latest News
**Endpoint:** `GET /api/v1/news/sidebar/latest`
**Description:** Get latest news for sidebar display
**Query Parameters:**
- `limit` (optional): Number of articles (default: 5)

**Response Format:**
```json
{
  "code": 200,
  "message": "Sidebar latest news fetched successfully",
  "data": {
    "latestNews": [
      {
        "id": "sidebar-latest-1",
        "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
        "title": "The Future of AI in Business: Transforming...",
        "date": "3/15/2024",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 5
  }
}
```

### 6. Trending News API
**Endpoint:** `GET /api/v1/news/sidebar/trending`
**Description:** Get trending articles for sidebar with category filtering
**Query Parameters:**
- `limit` (optional): Number of articles (default: 4)
- `category` (optional): Filter by specific category (business, technology, finance, marketing, leadership, startups)

**Response Format:**
```json
{
  "code": 200,
  "message": "Sidebar trending fetched successfully",
  "data": [
    {
      "id": "mg7jmwio-u096ax",
      "image": "https://picsum.photos/300/200?random=123456",
      "category": "BUSINESS",
      "title": "Trending Article Title",
      "publishedAt": "2025-10-01T05:26:12.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    },
    {
      "id": "mg7flyxc-axdkbf",
      "image": "https://picsum.photos/300/200?random=789012",
      "category": "TECHNOLOGY",
      "title": "Another Trending Article",
      "publishedAt": "2025-10-01T04:15:30.000Z",
      "link": "https://news.google.com/rss/articles/...",
      "source": "news.google.com"
    }
  ]
}
```

**Note:**
- Response format matches breaking news API exactly
- Each article has a unique ID for article details API
- Articles are fetched from design-specific categories only
- Sorted by publication date (newest first)

### 7. Sidebar Categories
**Endpoint:** `GET /api/v1/news/sidebar/categories`
**Description:** Get available categories for sidebar
**Response Format:**
```json
{
  "code": 200,
  "message": "Sidebar categories fetched successfully",
  "data": {
    "categories": [
      {
        "name": "Business",
        "slug": "business",
        "count": 0
      },
      {
        "name": "Technology",
        "slug": "technology",
        "count": 0
      },
      {
        "name": "Finance",
        "slug": "finance",
        "count": 0
      },
      {
        "name": "Marketing",
        "slug": "marketing",
        "count": 0
      },
      {
        "name": "Leadership",
        "slug": "leadership",
        "count": 0
      },
      {
        "name": "Startups",
        "slug": "startups",
        "count": 0
      }
    ],
    "total": 6
  }
}
```

### 7. Sidebar Trending
**Endpoint:** `GET /api/v1/news/sidebar/trending`
**Description:** Get trending articles for sidebar
**Query Parameters:**
- `limit` (optional): Number of articles (default: 4)

**Response Format:**
```json
{
  "code": 200,
  "message": "Sidebar trending fetched successfully",
  "data": {
    "trending": [
      {
        "id": "trending-1",
        "title": "The Future of AI in Business: Transforming...",
        "date": "3/15/2024",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 4
  }
}
```

## 🚀 Usage Examples

### Frontend Integration Examples

#### 1. Breaking News Carousel
```javascript
// Fetch breaking news for carousel (mixed categories)
const response = await fetch('/api/v1/news/breaking?limit=4');
const data = await response.json();

// Fetch breaking news for specific category
const businessResponse = await fetch('/api/v1/news/breaking?category=business&limit=4');
const businessData = await businessResponse.json();

// Fetch technology breaking news
const techResponse = await fetch('/api/v1/news/breaking?category=technology&limit=4');
const techData = await techResponse.json();

// Fetch finance breaking news
const financeResponse = await fetch('/api/v1/news/breaking?category=finance&limit=4');
const financeData = await financeResponse.json();

// Fetch marketing breaking news
const marketingResponse = await fetch('/api/v1/news/breaking?category=marketing&limit=4');
const marketingData = await marketingResponse.json();

// Fetch leadership breaking news
const leadershipResponse = await fetch('/api/v1/news/breaking?category=leadership&limit=4');
const leadershipData = await leadershipResponse.json();

// Fetch startups breaking news
const startupsResponse = await fetch('/api/v1/news/breaking?category=startups&limit=4');
const startupsData = await startupsResponse.json();

// Display in carousel
data.data.breakingNews.forEach(article => {
  // Create carousel item with article.image, article.title, article.publishedAt
  // Store article.id for later use with article details API
  console.log('Article ID:', article.id);
});

// Get full article details using the Google News ID from breaking news
const articleId = data.data.breakingNews[0].id; // Get first article's Google News ID
const articleDetailResponse = await fetch(`/api/v1/news/article/${articleId}?category=business`);
const articleDetail = await articleDetailResponse.json();

// Use article detail data
console.log('Full article:', articleDetail.data);

// Get related articles for the same article (content-based matching)
const relatedResponse = await fetch(`/api/v1/news/article/${articleId}/related?limit=3`);
const relatedData = await relatedResponse.json();

// Display related articles
relatedData.data.relatedArticles.forEach(relatedArticle => {
  console.log('Related Article ID:', relatedArticle.id);
  console.log('Related Article Title:', relatedArticle.title);
  console.log('Similarity Score:', relatedArticle.similarityScore);
});
```

#### 2. Featured Article
```javascript
// Fetch featured article
const response = await fetch('/api/v1/news/featured');
const data = await response.json();

// Display featured article
const featured = data.data;
// Use featured.image, featured.title, featured.description, featured.author, featured.date
```

#### 3. Latest Articles Grid
```javascript
// Fetch latest articles for grid
const response = await fetch('/api/v1/news/latest?limit=6');
const data = await response.json();

// Display in 2x3 grid
data.data.latestArticles.forEach(article => {
  // Create grid item with article.image, article.category, article.title, article.description
});
```

#### 4. Sidebar Components
```javascript
// Fetch sidebar data
const [latestResponse, categoriesResponse, trendingResponse] = await Promise.all([
  fetch('/api/v1/news/sidebar/latest'),
  fetch('/api/v1/news/sidebar/categories'),
  fetch('/api/v1/news/sidebar/trending')
]);

const latest = await latestResponse.json();
const categories = await categoriesResponse.json();
const trending = await trendingResponse.json();

// Display sidebar components
```

## 📊 Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the article |
| `image` | string | Article thumbnail image URL (placeholder if none) |
| `category` | string | Article category in uppercase |
| `title` | string | Article title |
| `description` | string | Article summary/description (truncated) |
| `author` | string | Article author or source |
| `date` | string | Formatted publication date |
| `timestamp` | string | Relative time (e.g., "2 hours ago") |
| `link` | string | Original article URL |
| `source` | string | News source |

## 🎨 Design Integration

These APIs are specifically designed to match the "Dynamic Business" website layout:

- **Breaking News Carousel**: Horizontal scrolling news with images, categories, and timestamps
- **Featured Article**: Large prominent article with full description
- **Latest Articles Grid**: 2x3 grid layout with images, categories, and descriptions
- **More Articles**: Additional articles in list format
- **Sidebar Components**: Latest news, categories, and trending articles

All responses include proper image handling with placeholder fallbacks and formatted data suitable for frontend display.
