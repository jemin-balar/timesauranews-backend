# Times Aura News - Local Development

## 🚀 **Running Locally**

### **1. Install Dependencies:**
```bash
npm install
```

### **2. Set Environment Variables:**
Create a `.env` file in the root directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/times-aura-news
NODE_ENV=development
```

### **3. Start the Server:**
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

### **4. Test the API:**
```bash
# Test breaking news
curl -X GET "http://localhost:3001/api/v1/news/breaking?limit=4"

# Test featured article
curl -X GET "http://localhost:3001/api/v1/news/featured"

# Test latest articles
curl -X GET "http://localhost:3001/api/v1/news/latest?limit=6"
```

## 📊 **Available Endpoints:**

### **Main Content APIs:**
- `GET /api/v1/news/breaking` - Breaking news carousel
- `GET /api/v1/news/featured` - Featured article
- `GET /api/v1/news/latest` - Latest articles grid
- `GET /api/v1/news/more` - More articles

### **Sidebar APIs:**
- `GET /api/v1/news/sidebar/latest` - Sidebar latest news
- `GET /api/v1/news/sidebar/categories` - Sidebar categories
- `GET /api/v1/news/sidebar/trending` - Sidebar trending

### **Utility APIs:**
- `GET /api/v1/news` - General news endpoint
- `GET /api/v1/news/categories` - Available categories
- `GET /api/v1/news/cache/stats` - Cache statistics
- `DELETE /api/v1/news/cache` - Clear cache

## 🎨 **Features:**

✅ **Content-Related Images** - Uses Unsplash with keywords from article titles
✅ **Unique Thumbnails** - Each article gets a unique image
✅ **Real-time Data** - Direct from Google News RSS feeds
✅ **Caching** - In-memory caching for performance
✅ **Error Handling** - Comprehensive error handling
✅ **Logging** - Detailed logging for debugging

## 🔧 **Development Commands:**

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run examples
npm run examples

# Check API health
curl -X GET "http://localhost:3001/api/health"
```

## 📝 **Notes:**

- Server runs on `http://localhost:3001`
- Images are fetched from Unsplash with content-related keywords
- Cache TTL is 5 minutes by default
- All APIs return JSON responses with proper error handling
