const express = require('express');
const router = express.Router();
const { newsController } = require('../controllers');

/**
 * News Routes
 * All routes are prefixed with /api/v1/news
 */

// ==================== ORIGINAL APIS ====================

// GET /api/v1/news - Get news from RSS feeds
router.route('/').get(newsController.getNews);

// GET /api/v1/news/categories - Get available news categories
router.route('/categories').get(newsController.getCategories);

// GET /api/v1/news/cache/stats - Get cache statistics
router.route('/cache/stats').get(newsController.getCacheStats);

// POST /api/v1/news/multiple - Get news from multiple categories
router.route('/multiple').post(newsController.getMultipleCategories);

// DELETE /api/v1/news/cache - Clear cache
router.route('/cache').delete(newsController.clearCache);

// ==================== DESIGN-SPECIFIC APIS ====================

// GET /api/v1/news/breaking - Get breaking news for carousel
router.route('/breaking').get(newsController.getBreakingNews);

// GET /api/v1/news/featured - Get featured article
router.route('/featured').get(newsController.getFeaturedArticle);

// GET /api/v1/news/latest - Get latest articles for grid
router.route('/latest').get(newsController.getLatestArticles);

// GET /api/v1/news/more - Get more articles
router.route('/more').get(newsController.getMoreArticles);

// ==================== SIDEBAR APIS ====================

// GET /api/v1/news/sidebar/latest - Get sidebar latest news
router.route('/sidebar/latest').get(newsController.getSidebarLatest);

// GET /api/v1/news/sidebar/categories - Get sidebar categories
router.route('/sidebar/categories').get(newsController.getSidebarCategories);

// GET /api/v1/news/sidebar/trending - Get sidebar trending
router.route('/sidebar/trending').get(newsController.getSidebarTrending);

// ==================== ARTICLE DETAIL ROUTES ====================

// GET /api/v1/news/article/:id - Get article detail
router.route('/article/:id').get(newsController.getArticleDetail);

// GET /api/v1/news/article/:id/related - Get related articles
router.route('/article/:id/related').get(newsController.getRelatedArticles);

// GET /api/v1/news/article/:id/tags - Get article tags
router.route('/article/:id/tags').get(newsController.getArticleTags);

module.exports = router;
