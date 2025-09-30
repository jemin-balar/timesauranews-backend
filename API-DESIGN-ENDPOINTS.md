# Times Aura News API - Design-Specific Endpoints

This document outlines the design-specific APIs created to match the "Dynamic Business" website design.

## 🎯 Design-Specific APIs

### 1. Breaking News Carousel
**Endpoint:** `GET /api/v1/news/breaking`
**Description:** Get breaking news articles for horizontal carousel display
**Query Parameters:**
- `limit` (optional): Number of articles (default: 4)

**Response Format:**
```json
{
  "code": 200,
  "message": "Breaking news fetched successfully",
  "data": {
    "breakingNews": [
      {
        "id": "breaking-1",
        "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=news.google.com",
        "category": "BUSINESS",
        "title": "Market Analysis: Tech Stocks Surge",
        "timestamp": "2 hours ago",
        "link": "https://example.com/article",
        "source": "news.google.com"
      }
    ],
    "total": 4
  }
}
```

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

### 6. Sidebar Categories
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
// Fetch breaking news for carousel
const response = await fetch('/api/v1/news/breaking?limit=4');
const data = await response.json();

// Display in carousel
data.data.breakingNews.forEach(article => {
  // Create carousel item with article.image, article.title, article.timestamp
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
