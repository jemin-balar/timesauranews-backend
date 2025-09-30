# Article Detail APIs Documentation

This document describes the APIs for article detail pages that open when clicking on breaking news or other articles.

## 📋 **Available APIs**

### 1. **Get Article Detail**
**Endpoint:** `GET /api/v1/news/article/:id`

**Description:** Fetches detailed information about a specific article.

**Parameters:**
- `id` (path): Article ID (e.g., `breaking-1`, `latest-1`)
- `url` (query, optional): Direct URL to fetch article from

**Response:**
```json
{
  "code": 200,
  "message": "Article detail fetched successfully",
  "data": {
    "id": "breaking-1",
    "title": "The Future of AI in Business: Transforming Industries",
    "description": "An in-depth look at how artificial intelligence is revolutionizing business operations...",
    "content": "Full article content...",
    "image": "https://picsum.photos/300/200?random=1455755447",
    "category": "TECHNOLOGY",
    "author": {
      "name": "John Smith",
      "avatar": "https://ui-avatars.com/api/?name=John%20Smith&background=4A90E2&color=fff&size=40"
    },
    "publishedAt": "2025-09-29T10:13:15.000Z",
    "tags": [
      {
        "name": "AI",
        "slug": "ai",
        "color": "#4A90E2"
      },
      {
        "name": "Technology",
        "slug": "technology",
        "color": "#2ECC71"
      }
    ],
    "link": "https://news.google.com/rss/articles/...",
    "source": "news.google.com",
    "readingTime": "5 min read",
    "views": 9112,
    "likes": 190
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/news/article/breaking-1"
```

---

### 2. **Get Related Articles**
**Endpoint:** `GET /api/v1/news/article/:id/related`

**Description:** Fetches related articles for a specific article.

**Parameters:**
- `id` (path): Article ID
- `limit` (query, optional): Number of related articles (default: 2)

**Response:**
```json
{
  "code": 200,
  "message": "Related articles fetched successfully",
  "data": {
    "relatedArticles": [
      {
        "id": "related-1",
        "title": "Digital Transformation in Small Businesses",
        "description": "How small businesses are leveraging digital transformation to compete...",
        "image": "https://picsum.photos/300/200?random=1691271666",
        "author": "Mike Chen",
        "publishedAt": "2025-09-29T10:13:15.000Z",
        "link": "https://news.google.com/rss/articles/...",
        "source": "news.google.com",
        "readingTime": "3 min read"
      },
      {
        "id": "related-2",
        "title": "Data Privacy and Business Compliance",
        "description": "How businesses can navigate data privacy regulations while maintainin...",
        "image": "https://picsum.photos/300/200?random=79163311",
        "author": "James Wilson",
        "publishedAt": "2025-09-29T10:13:15.000Z",
        "link": "https://news.google.com/rss/articles/...",
        "source": "news.google.com",
        "readingTime": "4 min read"
      }
    ],
    "total": 2
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/news/article/breaking-1/related?limit=2"
```

---

### 3. **Get Article Tags**
**Endpoint:** `GET /api/v1/news/article/:id/tags`

**Description:** Fetches tags associated with a specific article.

**Parameters:**
- `id` (path): Article ID

**Response:**
```json
{
  "code": 200,
  "message": "Article tags fetched successfully",
  "data": {
    "tags": [
      {
        "name": "AI",
        "slug": "ai",
        "color": "#4A90E2"
      },
      {
        "name": "Technology",
        "slug": "technology",
        "color": "#2ECC71"
      },
      {
        "name": "Business Innovation",
        "slug": "business-innovation",
        "color": "#E74C3C"
      },
      {
        "name": "Digital Transformation",
        "slug": "digital-transformation",
        "color": "#9B59B6"
      },
      {
        "name": "Data Privacy",
        "slug": "data-privacy",
        "color": "#F39C12"
      }
    ],
    "total": 5
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/news/article/breaking-1/tags"
```

---

## 🎯 **Frontend Integration**

### **Article Detail Page Structure**

Based on the design, your frontend should display:

1. **Header Section:**
   - Category tag (red background)
   - Article title
   - Description/subtitle
   - Author info with avatar
   - Publication date

2. **Main Content:**
   - Large featured image
   - Article content/body text
   - Tags section with colored tags

3. **Related Articles Section:**
   - Two related articles with images
   - Article titles and descriptions
   - Author and date information

4. **Footer:**
   - Back to articles link
   - Navigation links

### **JavaScript Integration Example**

```javascript
// Fetch article detail
async function loadArticleDetail(articleId) {
  try {
    const response = await fetch(`/api/v1/news/article/${articleId}`);
    const data = await response.json();
    
    if (data.code === 200) {
      const article = data.data;
      
      // Update page content
      document.querySelector('.article-title').textContent = article.title;
      document.querySelector('.article-description').textContent = article.description;
      document.querySelector('.article-content').innerHTML = article.content;
      document.querySelector('.article-image').src = article.image;
      document.querySelector('.author-name').textContent = article.author.name;
      document.querySelector('.author-avatar').src = article.author.avatar;
      document.querySelector('.publish-date').textContent = new Date(article.publishedAt).toLocaleDateString();
      
      // Update tags
      const tagsContainer = document.querySelector('.article-tags');
      tagsContainer.innerHTML = article.tags.map(tag => 
        `<span class="tag" style="background-color: ${tag.color}">${tag.name}</span>`
      ).join('');
      
      // Load related articles
      loadRelatedArticles(articleId);
    }
  } catch (error) {
    console.error('Error loading article:', error);
  }
}

// Fetch related articles
async function loadRelatedArticles(articleId) {
  try {
    const response = await fetch(`/api/v1/news/article/${articleId}/related`);
    const data = await response.json();
    
    if (data.code === 200) {
      const relatedContainer = document.querySelector('.related-articles');
      relatedContainer.innerHTML = data.data.relatedArticles.map(article => `
        <div class="related-article">
          <img src="${article.image}" alt="${article.title}">
          <h3>${article.title}</h3>
          <p>${article.description}</p>
          <div class="article-meta">
            <span class="author">${article.author}</span>
            <span class="date">${new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading related articles:', error);
  }
}
```

---

## 🔧 **Features**

### **Smart Tag Generation**
- Automatically generates relevant tags based on article title
- Supports AI, Technology, Business, Digital Transformation, Data Privacy tags
- Color-coded tags for better visual distinction

### **Reading Time Calculation**
- Automatically calculates reading time based on content length
- Uses 200 words per minute reading speed
- Returns formatted string like "5 min read"

### **Author Avatars**
- Generates avatar images using UI Avatars service
- Uses author name initials with consistent styling
- Fallback to default avatar if needed

### **Content-Related Images**
- Generates unique, content-related images for each article
- Uses keyword-based seeding for image relevance
- Fallback to placeholder images when needed

### **Mock Analytics**
- Provides mock view counts and like counts
- Simulates engagement metrics for frontend display
- Randomized but realistic numbers

---

## 📱 **Usage Examples**

### **Complete Article Detail Page Flow**

```javascript
// 1. Get article ID from URL or click event
const articleId = 'breaking-1';

// 2. Load article detail
const articleResponse = await fetch(`/api/v1/news/article/${articleId}`);
const articleData = await articleResponse.json();

// 3. Load related articles
const relatedResponse = await fetch(`/api/v1/news/article/${articleId}/related`);
const relatedData = await relatedResponse.json();

// 4. Load article tags
const tagsResponse = await fetch(`/api/v1/news/article/${articleId}/tags`);
const tagsData = await tagsResponse.json();

// 5. Render all data to the page
renderArticleDetail(articleData.data);
renderRelatedArticles(relatedData.data.relatedArticles);
renderTags(tagsData.data.tags);
```

---

## 🚀 **Performance Features**

- **Caching:** All APIs use intelligent caching to reduce RSS fetch frequency
- **Error Handling:** Comprehensive error handling with meaningful messages
- **Logging:** Detailed logging for debugging and monitoring
- **Validation:** Input validation and sanitization
- **Rate Limiting:** Built-in rate limiting to prevent abuse

---

## 📊 **Response Times**

- **Article Detail:** ~2-3 seconds (first request), ~100ms (cached)
- **Related Articles:** ~2-3 seconds (first request), ~100ms (cached)
- **Article Tags:** ~50ms (instant response)

---

## 🔗 **Integration with Existing APIs**

These APIs work seamlessly with the existing news APIs:

- Use article IDs from `getBreakingNews` API
- Use article IDs from `getLatestArticles` API
- Use article IDs from `getFeaturedArticle` API
- Consistent data structure across all APIs
- Same caching and error handling patterns
