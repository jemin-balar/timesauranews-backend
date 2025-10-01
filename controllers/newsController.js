const Parser = require('rss-parser');
const { success, error } = require('../common/res.common');
const { http_codes, messages, googleNewsFeeds, newsConstants } = require('../constant/text.constant');
const { info, error: logError, warn, debug } = require('../utils/logger');
const { set, get, generateFeedKey, generateNewsKey } = require('../utils/cacheManager');
const { checkMissingParameters } = require('../utils/utils');

// Initialize RSS parser
const parser = new Parser({
    timeout: 10000, // 10 seconds timeout
    headers: {
        'User-Agent': 'Times-Aura-News/1.0'
    }
});

/**
 * News Controller for handling news-related API endpoints
 * Provides RESTful endpoints for fetching news from RSS feeds
 */

// ==================== SERVICE FUNCTIONS ====================

/**
 * Fetch news from multiple RSS feeds and merge results
 * @param {Array} feedUrls - Array of RSS feed URLs
 * @param {Object} options - Options for fetching (category, limit, etc.)
 * @returns {Promise<Array>} - Formatted news articles
 */
const fetchNews = async (feedUrls = [], options = {}) => {
    try {
        const {
            category = newsConstants.defaultCategory,
            limit = newsConstants.maxArticles,
            useCache = true,
            cacheTTL = newsConstants.defaultCacheTTL
        } = options;

        // Generate cache key
        const cacheKey = generateNewsKey(feedUrls, options);
        
        // Check cache first
        if (useCache) {
            const cachedData = get(cacheKey);
            if (cachedData) {
                info('News fetched from cache', { cacheKey, count: cachedData.length });
                return cachedData;
            }
        }

        info('Fetching news from RSS feeds', { 
            feedCount: feedUrls.length, 
            category, 
            limit 
        });

        // If no URLs provided, use default Google News feeds
        const urlsToFetch = feedUrls.length > 0 ? feedUrls : [googleNewsFeeds.topStories];

        // Fetch all feeds in parallel
        const feedPromises = urlsToFetch.map(url => fetchFeed(url, category));
        const feedResults = await Promise.allSettled(feedPromises);

        // Process results and handle errors
        let allArticles = [];
        const errors = [];

        feedResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allArticles = allArticles.concat(result.value);
                debug(`Successfully fetched feed ${index + 1}`, { 
                    url: urlsToFetch[index], 
                    articleCount: result.value.length 
                });
            } else {
                errors.push({
                    url: urlsToFetch[index],
                    error: result.reason.message
                });
                logError(`Failed to fetch feed ${index + 1}`, result.reason, { 
                    url: urlsToFetch[index] 
                });
            }
        });

        // Log any errors but don't fail the entire request
        if (errors.length > 0) {
            warn('Some feeds failed to fetch', { errors });
        }

        // Process and format articles
        const processedArticles = processArticles(allArticles, category);
        
        // Remove duplicates and sort
        const uniqueArticles = removeDuplicates(processedArticles);
        const sortedArticles = sortArticles(uniqueArticles);
        
        // Limit results
        const limitedArticles = sortedArticles.slice(0, limit);

        // Cache the results
        if (useCache) {
            set(cacheKey, limitedArticles, cacheTTL);
            debug('News cached', { cacheKey, count: limitedArticles.length });
        }

        info('News fetched successfully', { 
            totalArticles: limitedArticles.length,
            uniqueArticles: uniqueArticles.length,
            errors: errors.length
        });

        return limitedArticles;

    } catch (err) {
        logError('Failed to fetch news', err, { feedUrls, options });
        throw new Error(`News fetch failed: ${err.message}`);
    }
};

/**
 * Fetch a single RSS feed
 * @param {string} url - RSS feed URL
 * @param {string} category - Article category
 * @returns {Promise<Array>} - Parsed articles
 */
const fetchFeed = async (url, category = newsConstants.defaultCategory) => {
    try {
        debug('Fetching RSS feed', { url, category });

        // Check cache for individual feed
        const feedCacheKey = generateFeedKey(url, { category });
        const cachedFeed = get(feedCacheKey);
        
        if (cachedFeed) {
            debug('Feed fetched from cache', { url });
            return cachedFeed;
        }

        // Parse RSS feed
        const feed = await parser.parseURL(url);
        
        if (!feed || !feed.items) {
            throw new Error('Invalid RSS feed format');
        }

        // Format articles
        const articles = feed.items.map(item => formatArticle(item, category));
        
        // Cache the feed
        set(feedCacheKey, articles, newsConstants.defaultCacheTTL);
        
        debug('RSS feed parsed successfully', { 
            url, 
            articleCount: articles.length 
        });

        return articles;

    } catch (err) {
        logError('Failed to parse RSS feed', err, { url, category });
        throw new Error(`RSS parse failed for ${url}: ${err.message}`);
    }
};

/**
 * Format a single article from RSS item
 * @param {Object} item - RSS item
 * @param {string} category - Article category
 * @returns {Object} - Formatted article
 */
const formatArticle = (item, category = newsConstants.defaultCategory) => {
    try {
        // Extract Google News unique ID from the link or guid
        const googleNewsId = extractGoogleNewsId(item);
        
        const article = {
            id: googleNewsId,
            title: cleanText(item.title || ''),
            link: item.link || '',
            summary: cleanText(item.contentSnippet || item.content || item.description || ''),
            publishedAt: parseDate(item.pubDate || item.isoDate || new Date().toISOString()),
            source: extractSource(item.link || ''),
            thumbnail: extractThumbnail(item),
            category: category
        };

        return article;

    } catch (err) {
        logError('Failed to format article', err, { item });
        throw new Error(`Article formatting failed: ${err.message}`);
    }
};

/**
 * Extract thumbnail from RSS item
 * @param {Object} item - RSS item
 * @returns {string|null} - Thumbnail URL or null
 */
const extractThumbnail = (item) => {
    try {
        debug('Extracting thumbnail from item', { 
            hasMediaContent: !!item['media:content'],
            hasEnclosure: !!item.enclosure,
            hasMediaThumbnail: !!item['media:thumbnail'],
            hasContent: !!(item.content || item.description)
        });

        // Check for media:content
        if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
            debug('Found media:content thumbnail', { url: item['media:content']['$'].url });
            return item['media:content']['$'].url;
        }

        // Check for enclosure
        if (item.enclosure && item.enclosure.url) {
            const url = item.enclosure.url;
            const isImage = newsConstants.supportedImageFormats.some(format => 
                url.toLowerCase().includes(`.${format}`)
            );
            if (isImage) {
                debug('Found enclosure thumbnail', { url });
                return url;
            }
        }

        // Check for media:thumbnail
        if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
            debug('Found media:thumbnail', { url: item['media:thumbnail']['$'].url });
            return item['media:thumbnail']['$'].url;
        }

            // Check content for images with multiple patterns
            const content = item.content || item.description || item.contentSnippet || '';

            // Try different image patterns with priority for news-related images
            const patterns = [
                // High priority: News and content images
                /<img[^>]+src="([^"]*(?:news|article|story|photo|image)[^"]*\.(?:jpg|jpeg|png|gif|webp))"/i,
                /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"[^>]*alt="[^"]*(?:news|article|story|photo)[^"]*"/i,
                /<img[^>]+alt="[^"]*(?:news|article|story|photo)[^"]*"[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"/i,
                
                // Reuters, AP, Getty Images, etc.
                /<img[^>]+src="([^"]*(?:reuters|ap|getty|bloomberg|cnn|bbc)[^"]*\.(?:jpg|jpeg|png|gif|webp))"/i,
                /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"[^>]*alt="[^"]*(?:reuters|ap|getty|bloomberg)[^"]*"/i,
                
                // Standard image patterns
                /<img[^>]+src="([^"]+)"/i,
                /<img[^>]+src='([^']+)'/i,
                /background-image:\s*url\(['"]?([^'"]+)['"]?\)/i,
                /<img[^>]+data-src="([^"]+)"/i,
                /<img[^>]+data-lazy-src="([^"]+)"/i,
                /<img[^>]+data-original="([^"]+)"/i,
                /<img[^>]+data-srcset="([^"]+)"/i,
                /<img[^>]+data-lazy="([^"]+)"/i,
                /<img[^>]+data-defer-src="([^"]+)"/i,
                
                // Additional patterns for news sites
                /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"[^>]*class="[^"]*(?:news|article|story|photo|image)[^"]*"/i,
                /<img[^>]+class="[^"]*(?:news|article|story|photo|image)[^"]*"[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"/i
            ];

            for (const pattern of patterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                    let imageUrl = match[1];
                    
                    // Handle srcset (take first URL)
                    if (imageUrl.includes(',')) {
                        imageUrl = imageUrl.split(',')[0].trim();
                    }
                    
                    // Clean up the URL
                    imageUrl = imageUrl.replace(/['"]/g, '').trim();
                    
                    // Skip placeholder images
                    if (imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')) {
                        continue;
                    }
                    
                    // Validate that it's a proper image URL
                    if (imageUrl.startsWith('http') &&
                        (newsConstants.supportedImageFormats.some(format =>
                            imageUrl.toLowerCase().includes(`.${format}`)
                        ) || imageUrl.includes('image') || imageUrl.includes('photo') || imageUrl.includes('img'))) {
                        debug('Found real image in content', { url: imageUrl, pattern: pattern.toString() });
                        return imageUrl;
                    }
                }
            }

        // For Google News, try to extract from the link structure and content
        if (item.link && item.link.includes('news.google.com')) {
            // Google News sometimes has image URLs in the link parameters
            const linkMatch = item.link.match(/[?&]img=([^&]+)/);
            if (linkMatch && linkMatch[1]) {
                const imageUrl = decodeURIComponent(linkMatch[1]);
                debug('Found Google News image in link', { url: imageUrl });
                return imageUrl;
            }
            
            // Try to extract from Google News specific patterns
            const googleImagePatterns = [
                /<img[^>]+src="([^"]*googleusercontent[^"]*)"/i,
                /<img[^>]+src="([^"]*ggpht[^"]*)"/i,
                /<img[^>]+src="([^"]*blogspot[^"]*)"/i,
                /<img[^>]+src="([^"]*news[^"]*\.(jpg|jpeg|png|gif|webp))"/i
            ];
            
            for (const pattern of googleImagePatterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                    let imageUrl = match[1];
                    if (imageUrl.startsWith('//')) {
                        imageUrl = 'https:' + imageUrl;
                    }
                    if (imageUrl.startsWith('http')) {
                        debug('Found Google News content image', { url: imageUrl });
                        return imageUrl;
                    }
                }
            }
        }

        // Always generate a unique placeholder thumbnail based on title and link
        const title = item.title || 'News';
        const link = item.link || '';
        const source = extractSource(link);
        
        // Create a unique identifier from title and link
        const uniqueId = title + link;
        const hash = createSimpleHash(uniqueId);
        
        // Generate unique color and text
        const colors = ['4A90E2', 'E74C3C', '2ECC71', 'F39C12', '9B59B6', '1ABC9C', 'E67E22', '34495E', 'E91E63', 'FF5722', '795548', '607D8B'];
        const color = colors[hash % colors.length];
        
        // Create short title for placeholder
        const shortTitle = title.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
        const displayText = shortTitle || 'News';
        
        // Generate news-related image URL with content-based seeding
        const placeholderUrl = generateNewsImageUrl(title, hash);
        debug('Using unique placeholder thumbnail', { 
            url: placeholderUrl, 
            source, 
            title: shortTitle,
            hash: hash % colors.length,
            color 
        });
        return placeholderUrl;

        debug('No thumbnail found for item', { 
            title: item.title?.substring(0, 50),
            link: item.link?.substring(0, 50)
        });

        return null;

    } catch (err) {
        debug('Failed to extract thumbnail', { error: err.message, item: item.title });
        return null;
    }
};

/**
 * Extract Google News unique ID from RSS item
 * @param {Object} item - RSS item
 * @returns {string} - Google News unique ID
 */
const extractGoogleNewsId = (item) => {
    try {
        // Create a truly unique ID by combining multiple factors
        const title = item.title || '';
        const link = item.link || '';
        const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
        const source = extractSource(link);
        
        // Create a unique string combining all available data
        const uniqueString = `${title}-${link}-${pubDate}-${source}`;
        const hash = createSimpleHash(uniqueString);
        
        // Create a shorter, more readable ID with timestamp
        const timestamp = new Date(pubDate).getTime().toString(36);
        const shortHash = hash.toString(36).substring(0, 8);
        
        // Return a unique ID that combines timestamp and hash
        return `${timestamp}-${shortHash}`;
        
    } catch (err) {
        debug('Failed to extract Google News ID', { error: err.message, item: item.title });
        // Fallback: use current timestamp with random component
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${random}`;
    }
};

/**
 * Extract source from article link
 * @param {string} link - Article link
 * @returns {string} - Source name
 */
const extractSource = (link) => {
    try {
        if (!link) return 'Unknown';
        
        const url = new URL(link);
        return url.hostname.replace('www.', '');
    } catch (err) {
        debug('Failed to extract source', { error: err.message, link });
        return 'Unknown';
    }
};

/**
 * Clean and sanitize text content
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
    if (!text) return '';
    
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp;
        .replace(/&amp;/g, '&') // Replace &amp;
        .replace(/&lt;/g, '<') // Replace &lt;
        .replace(/&gt;/g, '>') // Replace &gt;
        .replace(/&quot;/g, '"') // Replace &quot;
        .replace(/&#39;/g, "'") // Replace &#39;
        .trim();
};

/**
 * Parse date string to ISO format
 * @param {string} dateString - Date string
 * @returns {string} - ISO date string
 */
const parseDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return new Date().toISOString();
        }
        return date.toISOString();
    } catch (err) {
        debug('Failed to parse date', { error: err.message, dateString });
        return new Date().toISOString();
    }
};

/**
 * Process and validate articles
 * @param {Array} articles - Raw articles
 * @param {string} category - Article category
 * @returns {Array} - Processed articles
 */
const processArticles = (articles, category) => {
    return articles
        .filter(article => article && article.title && article.link)
        .map(article => ({
            ...article,
            category: article.category || category
        }));
};

/**
 * Remove duplicate articles based on link
 * @param {Array} articles - Articles array
 * @returns {Array} - Unique articles
 */
const removeDuplicates = (articles) => {
    const seen = new Set();
    return articles.filter(article => {
        if (seen.has(article.link)) {
            return false;
        }
        seen.add(article.link);
        return true;
    });
};

/**
 * Sort articles by published date
 * @param {Array} articles - Articles array
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted articles
 */
const sortArticles = (articles, order = newsConstants.sortOrder) => {
    return articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        
        if (order === 'desc') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });
};

// ==================== DESIGN-SPECIFIC APIS ====================

/**
 * Get breaking news for carousel
 * GET /api/v1/news/breaking
 * Query parameters:
 * - limit: Number of articles (optional, default: 4)
 * - category: Filter by specific category (optional)
 */
const getBreakingNews = async (req, res) => {
    try {
        const { limit = 4, category } = req.query;
        
        info('Breaking news API request received', { limit, category });

        let allArticles = [];
        
        // If category is specified, fetch only from that category
        if (category) {
            // Validate category - only allow design-specific categories
            const designCategories = ['business', 'technology', 'finance', 'marketing', 'leadership', 'startups'];
            if (!designCategories.includes(category)) {
                return error({
                    code: http_codes.badRequest,
                    msg: `Invalid category. Available categories: ${designCategories.join(', ')}`,
                    res,
                    method: 'getBreakingNews'
                });
            }
            
            // Map design categories to specific RSS feeds for better differentiation
            let feedUrl = '';
            switch (category) {
                case 'business':
                    feedUrl = googleNewsFeeds.business;
                    break;
                case 'technology':
                    feedUrl = googleNewsFeeds.technology;
                    break;
                case 'finance':
                    feedUrl = googleNewsFeeds.finance; // Specific finance RSS feed
                    break;
                case 'marketing':
                    feedUrl = googleNewsFeeds.marketing; // Specific marketing RSS feed
                    break;
                case 'leadership':
                    feedUrl = googleNewsFeeds.leadership; // Specific leadership RSS feed
                    break;
                case 'startups':
                    feedUrl = googleNewsFeeds.startups; // Specific startup RSS feed
                    break;
                default:
                    feedUrl = googleNewsFeeds.business;
            }
            
            if (feedUrl) {
                try {
                    const articles = await fetchFeed(feedUrl, category);
                    allArticles = articles;
                } catch (err) {
                    warn('Failed to fetch from category', { category, error: err.message });
                    return error({
                        code: http_codes.internalError,
                        msg: `Failed to fetch breaking news for category: ${category}`,
                        res,
                        error: err,
                        method: 'getBreakingNews'
                    });
                }
            }
        } else {
            // Default behavior: fetch from all available categories for variety
            const designCategories = ['business', 'technology'];
            
            // Fetch from each design category separately
            for (const cat of designCategories) {
                const feedUrl = googleNewsFeeds[cat];
                if (feedUrl) {
                    try {
                        const articles = await fetchFeed(feedUrl, cat);
                        allArticles.push(...articles);
                    } catch (err) {
                        warn('Failed to fetch from category', { category: cat, error: err.message });
                    }
                }
            }
        }
        
        // Remove duplicates based on link and title
        const uniqueArticles = removeDuplicates(allArticles);
        
        // Sort by date and limit
        const articles = uniqueArticles
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, parseInt(limit));

        // Format for carousel display with proper category mapping
        const formattedArticles = articles.map((article) => {
            // Map RSS categories to design categories
            let displayCategory = article.category.toUpperCase();
            
            // If a specific category was requested, use it directly
            if (category) {
                displayCategory = category.toUpperCase();
            } else {
                // Default mapping for mixed categories
            if (article.category === 'business') {
                // Randomly assign business articles to different design categories
                const businessCategories = ['BUSINESS', 'FINANCE', 'MARKETING', 'LEADERSHIP'];
                displayCategory = businessCategories[Math.floor(Math.random() * businessCategories.length)];
            } else if (article.category === 'technology') {
                // Randomly assign technology articles to tech/startup categories
                const techCategories = ['TECHNOLOGY', 'STARTUPS'];
                displayCategory = techCategories[Math.floor(Math.random() * techCategories.length)];
                }
            }
            
            return {
                id: article.id,
                image: article.thumbnail,
                category: displayCategory,
                title: article.title,
                publishedAt: article.publishedAt,
                link: article.link,
                source: article.source
            };
        });

        return success({
            code: http_codes.ok,
            data: {
                breakingNews: formattedArticles,
                total: formattedArticles.length,
                category: category || 'mixed',
                lastUpdated: new Date().toISOString()
            },
            msg: 'Breaking news fetched successfully',
            res
        });

    } catch (err) {
        logError('Breaking news API error', err, { method: 'getBreakingNews' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch breaking news',
            res,
            error: err,
            method: 'getBreakingNews'
        });
    }
};

/**
 * Get featured article
 * GET /api/v1/news/featured
 */
const getFeaturedArticle = async (req, res) => {
    try {
        info('Featured article API request received');

        // Get the most recent article from business category
        const articles = await fetchNews([googleNewsFeeds.business], {
            limit: 1,
            useCache: true,
            sort: 'desc'
        });

        if (articles.length === 0) {
            return error({
                code: http_codes.notFound,
                msg: 'No featured article found',
                res,
                method: 'getFeaturedArticle'
            });
        }

        const article = articles[0];
        const featuredArticle = {
            id: 'featured-1',
            image: article.thumbnail,
            category: 'BUSINESS',
            title: article.title,
            description: article.summary,
            author: `By ${article.source}`,
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        };

        return success({
            code: http_codes.ok,
            data: featuredArticle,
            msg: 'Featured article fetched successfully',
            res
        });

    } catch (err) {
        logError('Featured article API error', err, { method: 'getFeaturedArticle' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch featured article',
            res,
            error: err,
            method: 'getFeaturedArticle'
        });
    }
};

/**
 * Get latest articles for grid display
 * GET /api/v1/news/latest
 */
const getLatestArticles = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        info('Latest articles API request received', { limit });

        // Fetch from design-specific categories only (same as breaking news)
        const designCategories = ['business', 'technology', 'finance', 'marketing', 'leadership', 'startups'];
        let allArticles = [];
        
        // Fetch from each category individually to maintain proper category assignment
        for (const category of designCategories) {
            const feedUrl = googleNewsFeeds[category];
            if (feedUrl) {
                try {
                    const articles = await fetchFeed(feedUrl, category);
                    allArticles.push(...articles);
                    debug(`Fetched ${articles.length} articles from ${category}`);
                } catch (err) {
                    warn('Failed to fetch from category for latest articles', { category, error: err.message });
                }
            }
        }
        
        // Remove duplicates and sort
        const uniqueArticles = removeDuplicates(allArticles);
        const sortedArticles = sortArticles(uniqueArticles);
        
        // Limit results
        const articles = sortedArticles.slice(0, parseInt(limit));

        // Format like breaking news API with proper unique IDs and category
        const formattedArticles = articles.map((article) => ({
            id: article.id,
            image: article.thumbnail,
            category: article.category.toUpperCase(),
            title: article.title,
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        }));

        return success({
            code: http_codes.ok,
            data: formattedArticles,
            msg: 'Latest articles fetched successfully',
            res
        });

    } catch (err) {
        logError('Latest articles API error', err, { method: 'getLatestArticles' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch latest articles',
            res,
            error: err,
            method: 'getLatestArticles'
        });
    }
};

/**
 * Get more articles for additional content
 * GET /api/v1/news/more
 */
const getMoreArticles = async (req, res) => {
    try {
        const { limit = 4 } = req.query;
        
        info('More articles API request received', { limit });

        // Fetch from different categories
        const categories = Object.keys(googleNewsFeeds);
        const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
        
        const articles = await fetchNews(feedUrls, {
            limit: parseInt(limit),
            useCache: true,
            sort: 'desc'
        });

        // Format for list display
        const formattedArticles = articles.map((article, index) => ({
            id: `more-${index + 1}`,
            image: article.thumbnail,
            title: article.title,
            description: truncateText(article.summary, 80),
            author: article.source,
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        }));

        return success({
            code: http_codes.ok,
            data: {
                moreArticles: formattedArticles,
                total: formattedArticles.length
            },
            msg: 'More articles fetched successfully',
            res
        });

    } catch (err) {
        logError('More articles API error', err, { method: 'getMoreArticles' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch more articles',
            res,
            error: err,
            method: 'getMoreArticles'
        });
    }
};

/**
 * Get sidebar latest news
 * GET /api/v1/news/sidebar/latest
 */
const getSidebarLatest = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        info('Sidebar latest news API request received', { limit });

        const articles = await fetchNews([googleNewsFeeds.topStories], {
            limit: parseInt(limit),
            useCache: true,
            sort: 'desc'
        });

        const formattedArticles = articles.map((article, index) => ({
            id: `sidebar-latest-${index + 1}`,
            image: article.thumbnail,
            title: truncateText(article.title, 60),
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        }));

        return success({
            code: http_codes.ok,
            data: {
                latestNews: formattedArticles,
                total: formattedArticles.length
            },
            msg: 'Sidebar latest news fetched successfully',
            res
        });

    } catch (err) {
        logError('Sidebar latest API error', err, { method: 'getSidebarLatest' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch sidebar latest news',
            res,
            error: err,
            method: 'getSidebarLatest'
        });
    }
};

/**
 * Get categories for sidebar
 * GET /api/v1/news/sidebar/categories
 */
const getSidebarCategories = async (req, res) => {
    try {
        info('Sidebar categories API request received');

        const categories = [
            { name: 'Business', slug: 'business', count: 0 },
            { name: 'Technology', slug: 'technology', count: 0 },
            { name: 'Finance', slug: 'finance', count: 0 },
            { name: 'Marketing', slug: 'marketing', count: 0 },
            { name: 'Leadership', slug: 'leadership', count: 0 },
            { name: 'Startups', slug: 'startups', count: 0 }
        ];

        return success({
            code: http_codes.ok,
            data: {
                categories: categories,
                total: categories.length
            },
            msg: 'Sidebar categories fetched successfully',
            res
        });

    } catch (err) {
        logError('Sidebar categories API error', err, { method: 'getSidebarCategories' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch sidebar categories',
            res,
            error: err,
            method: 'getSidebarCategories'
        });
    }
};

/**
 * Get trending articles for sidebar
 * GET /api/v1/news/sidebar/trending
 */
const getSidebarTrending = async (req, res) => {
    try {
        const { limit = 4 } = req.query;
        
        info('Sidebar trending API request received', { limit });

        // Get trending articles from multiple categories
        const categories = Object.keys(googleNewsFeeds);
        const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
        
        const articles = await fetchNews(feedUrls, {
            limit: parseInt(limit),
            useCache: true,
            sort: 'desc'
        });

        const formattedArticles = articles.map((article, index) => ({
            id: `trending-${index + 1}`,
            title: truncateText(article.title, 50),
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        }));

        return success({
            code: http_codes.ok,
            data: {
                trending: formattedArticles,
                total: formattedArticles.length
            },
            msg: 'Sidebar trending fetched successfully',
            res
        });

    } catch (err) {
        logError('Sidebar trending API error', err, { method: 'getSidebarTrending' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch sidebar trending',
            res,
            error: err,
            method: 'getSidebarTrending'
        });
    }
};

// ==================== ARTICLE DETAIL APIS ====================

/**
 * Get article detail by ID or URL
 * GET /api/v1/news/article/:id
 */
const getArticleDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.query;
        
        info('Article detail API request received', { id, url });

        // If URL is provided, fetch article by URL
        if (url) {
            const articles = await fetchNews([url], {
                limit: 1,
                useCache: true,
                sort: 'desc'
            });

            if (articles.length === 0) {
                return error({
                    code: http_codes.notFound,
                    msg: 'Article not found',
                    res,
                    method: 'getArticleDetail'
                });
            }

            const article = articles[0];
            const articleDetail = {
                id: `article-${Date.now()}`,
                title: article.title,
                description: article.summary,
                content: article.content || article.summary,
                image: article.thumbnail,
                category: article.category.toUpperCase(),
                author: {
                    name: article.source,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=4A90E2&color=fff&size=40`
                },
                publishedAt: article.publishedAt,
                tags: generateArticleTags(article.title, article.category),
                link: article.link,
                source: article.source,
                readingTime: calculateReadingTime(article.content || article.summary),
                views: Math.floor(Math.random() * 10000) + 1000, // Mock views
                likes: Math.floor(Math.random() * 500) + 50 // Mock likes
            };

            return success({
                code: http_codes.ok,
                data: articleDetail,
                msg: 'Article detail fetched successfully',
                res
            });
        }

        // If ID is provided, fetch from the same source as the original API
        let article = null;
        
        // Check if it's a Google News ID (not starting with breaking- but is a Google News ID)
        // We'll try to find the article by ID in all available feeds
        if (!id.startsWith('latest-') && !id.startsWith('featured-') && !id.startsWith('more-') && !id.startsWith('trending-') && !id.startsWith('sidebar-latest-')) {
            // This is likely a Google News ID from breaking news
            let allArticles = [];
            
            // Check if there's a category parameter in the request to match the breaking news logic
            const { category } = req.query;
            
            if (category) {
                // Map display categories to specific RSS feeds for better differentiation
                const categoryMapping = {
                    'business': 'business',
                    'technology': 'technology', 
                    'finance': 'finance',      // Finance articles from specific finance feed
                    'marketing': 'marketing',   // Marketing articles from specific marketing feed
                    'leadership': 'leadership', // Leadership articles from specific leadership feed
                    'startups': 'startups'     // Startup articles from specific startup feed
                };
                
                const rssCategory = categoryMapping[category] || 'business';
                const feedUrl = googleNewsFeeds[rssCategory];
                
                if (feedUrl) {
                    try {
                        allArticles = await fetchFeed(feedUrl, rssCategory);
                    } catch (err) {
                        warn('Failed to fetch from specific category', { category: rssCategory, error: err.message });
                    }
                }
            }
            
            // Find the article with matching Google News ID in specific category first
            article = allArticles.find(art => art.id === id);
            
            if (article) {
                info('Article found in specific category', { id, category, foundIn: category });
            } else {
                info('Article not found in specific category, searching all feeds', { id, category });
                
                // Search across all available feeds
                const allFeedCategories = ['business', 'technology', 'finance', 'marketing', 'leadership', 'startups'];
                
                for (const feedCategory of allFeedCategories) {
                    const feedUrl = googleNewsFeeds[feedCategory];
                    if (feedUrl) {
                        try {
                            const articles = await fetchFeed(feedUrl, feedCategory);
                            allArticles.push(...articles);
                            debug(`Fetched ${articles.length} articles from ${feedCategory}`);
                        } catch (err) {
                            warn('Failed to fetch from feed in article detail', { feedCategory, error: err.message });
                        }
                    }
                }
                
                // Find the article with matching Google News ID across all feeds
                article = allArticles.find(art => art.id === id);
                
                if (article) {
                    info('Article found in all feeds search', { id, totalArticles: allArticles.length });
                } else {
                    warn('Article not found in any feed', { id, totalArticles: allArticles.length });
                }
            }
            
            if (!article) {
                return error({
                    code: http_codes.notFound,
                    msg: 'Article not found in any feed',
                    res,
                    method: 'getArticleDetail'
                });
            }
        }
        // Check if it's a latest articles ID
        else if (id.startsWith('latest-')) {
            const latestIndex = parseInt(id.split('-')[1]) - 1;
            // Use the exact same feed URLs as the latest articles API
            const categories = Object.keys(googleNewsFeeds);
            const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
            const latestArticles = await fetchNews(feedUrls, {
                limit: 20,
                useCache: true,
                sort: 'desc'
            });
            article = latestArticles[latestIndex];
        }
        // Check if it's a featured article ID
        else if (id.startsWith('featured-')) {
            // Use the exact same feed URLs as the featured article API
            const categories = Object.keys(googleNewsFeeds);
            const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
            const featuredArticles = await fetchNews(feedUrls, {
                limit: 1,
                useCache: true,
                sort: 'desc'
            });
            article = featuredArticles[0];
        }
        // Check if it's a more articles ID
        else if (id.startsWith('more-')) {
            const moreIndex = parseInt(id.split('-')[1]) - 1;
            // Use the exact same feed URLs as the more articles API
            const categories = Object.keys(googleNewsFeeds);
            const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
            const moreArticles = await fetchNews(feedUrls, {
                limit: 20,
                useCache: true,
                sort: 'desc'
            });
            article = moreArticles[moreIndex];
        }
        // Check if it's a sidebar trending ID
        else if (id.startsWith('trending-')) {
            const trendingIndex = parseInt(id.split('-')[1]) - 1;
            // Use the exact same feed URLs as the sidebar trending API
            const categories = ['business', 'technology', 'finance'];
            const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
            const trendingArticles = await fetchNews(feedUrls, {
                limit: 20,
                useCache: true,
                sort: 'desc'
            });
            article = trendingArticles[trendingIndex];
        }
        // Check if it's a sidebar latest ID
        else if (id.startsWith('sidebar-latest-')) {
            const sidebarIndex = parseInt(id.split('-')[2]) - 1;
            // Use the exact same feed URLs as the sidebar latest API
            const categories = Object.keys(googleNewsFeeds);
            const feedUrls = categories.map(cat => googleNewsFeeds[cat]).filter(Boolean);
            const sidebarArticles = await fetchNews(feedUrls, {
                limit: 20,
                useCache: true,
                sort: 'desc'
            });
            article = sidebarArticles[sidebarIndex];
        }

        if (!article) {
            return error({
                code: http_codes.notFound,
                msg: 'Article not found',
                res,
                method: 'getArticleDetail'
            });
        }

        // Determine the display category based on the request context
        let displayCategory = article.category.toUpperCase();
        
        // If category was passed in query, use that for consistency
        if (req.query.category) {
            displayCategory = req.query.category.toUpperCase();
        }
        
        const articleDetail = {
            id: id,
            title: article.title,
            description: article.summary,
            content: article.content || article.summary,
            image: article.thumbnail,
            category: displayCategory,
            author: {
                name: article.source,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=4A90E2&color=fff&size=40`
            },
            publishedAt: article.publishedAt,
            tags: generateArticleTags(article.title, article.category),
            link: article.link,
            source: article.source,
            readingTime: calculateReadingTime(article.content || article.summary),
            views: Math.floor(Math.random() * 10000) + 1000,
            likes: Math.floor(Math.random() * 500) + 50
        };

        return success({
            code: http_codes.ok,
            data: articleDetail,
            msg: 'Article detail fetched successfully',
            res
        });

    } catch (err) {
        logError('Article detail API error', err, { method: 'getArticleDetail' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch article detail',
            res,
            error: err,
            method: 'getArticleDetail'
        });
    }
};

/**
 * Get related articles for an article
 * GET /api/v1/news/article/:id/related
 */
const getRelatedArticles = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 2 } = req.query;
        
        info('Related articles API request received', { id, limit });

        // First, find the original article to understand its characteristics
        let originalArticle = null;
        let allArticles = [];
        
        // Search for the original article across all feeds using specific feed URLs
        const designCategories = ['business', 'technology', 'finance', 'marketing', 'leadership', 'startups'];
        
        for (const category of designCategories) {
            const feedUrl = googleNewsFeeds[category];
            
            if (feedUrl) {
                try {
                    const articles = await fetchFeed(feedUrl, category);
                    allArticles.push(...articles);
                    
                    // Find the original article
                    if (!originalArticle) {
                        originalArticle = articles.find(article => article.id === id);
                    }
                    
                    debug(`Fetched ${articles.length} articles from ${category} for related articles`);
                } catch (err) {
                    warn('Failed to fetch from category for related articles', { category, error: err.message });
                }
            }
        }

        if (!originalArticle) {
            return error({
                code: http_codes.notFound,
                msg: 'Original article not found',
                res,
                method: 'getRelatedArticles'
            });
        }

        // Find related articles based on content similarity
        const relatedArticles = findRelatedArticles(originalArticle, allArticles, parseInt(limit));

        return success({
            code: http_codes.ok,
            data: relatedArticles,
            msg: 'Related articles fetched successfully',
            res
        });

    } catch (err) {
        logError('Related articles API error', err, { method: 'getRelatedArticles' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch related articles',
            res,
            error: err,
            method: 'getRelatedArticles'
        });
    }
};

/**
 * Find related articles based on content similarity
 * @param {Object} originalArticle - The original article
 * @param {Array} allArticles - All available articles
 * @param {number} limit - Number of related articles to return
 * @returns {Array} - Related articles with similarity scores
 */
const findRelatedArticles = (originalArticle, allArticles, limit) => {
    try {
        // Filter out the original article
        const otherArticles = allArticles.filter(article => article.id !== originalArticle.id);
        
        // Calculate similarity scores for each article
        const articlesWithScores = otherArticles.map(article => {
            const similarityScore = calculateArticleSimilarity(originalArticle, article);
            return {
                ...article,
                similarityScore
            };
        });
        
        // Sort by similarity score (highest first)
        const sortedArticles = articlesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
        
        // Take the top related articles and format like breaking news API with category
        const relatedArticles = sortedArticles.slice(0, limit).map((article) => ({
            id: article.id,
            image: article.thumbnail,
            category: article.category.toUpperCase(),
            title: article.title,
            publishedAt: article.publishedAt,
            link: article.link,
            source: article.source
        }));
        
        return relatedArticles;
        
    } catch (err) {
        logError('Failed to find related articles', err, { originalArticle: originalArticle.title });
        return [];
    }
};

/**
 * Calculate similarity between two articles
 * @param {Object} article1 - First article
 * @param {Object} article2 - Second article
 * @returns {number} - Similarity score (0-1)
 */
const calculateArticleSimilarity = (article1, article2) => {
    try {
        let score = 0;
        let factors = 0;
        
        // 1. Title similarity (40% weight)
        const titleSimilarity = calculateTextSimilarity(article1.title, article2.title);
        score += titleSimilarity * 0.4;
        factors += 0.4;
        
        // 2. Summary/description similarity (30% weight)
        const summarySimilarity = calculateTextSimilarity(article1.summary, article2.summary);
        score += summarySimilarity * 0.3;
        factors += 0.3;
        
        // 3. Source similarity (10% weight)
        const sourceSimilarity = article1.source === article2.source ? 1 : 0;
        score += sourceSimilarity * 0.1;
        factors += 0.1;
        
        // 4. Category similarity (10% weight)
        const categorySimilarity = article1.category === article2.category ? 1 : 0;
        score += categorySimilarity * 0.1;
        factors += 0.1;
        
        // 5. Keyword similarity (10% weight)
        const keywordSimilarity = calculateKeywordSimilarity(article1.title, article2.title);
        score += keywordSimilarity * 0.1;
        factors += 0.1;
        
        return factors > 0 ? score / factors : 0;
        
    } catch (err) {
        debug('Failed to calculate article similarity', { error: err.message });
        return 0;
    }
};

/**
 * Calculate text similarity between two strings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score (0-1)
 */
const calculateTextSimilarity = (text1, text2) => {
    try {
        if (!text1 || !text2) return 0;
        
        const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = new Set([...words1, ...words2]).size;
        
        return commonWords.length / totalWords;
        
    } catch (err) {
        debug('Failed to calculate text similarity', { error: err.message });
        return 0;
    }
};

/**
 * Calculate keyword similarity between two titles
 * @param {string} title1 - First title
 * @param {string} title2 - Second title
 * @returns {number} - Similarity score (0-1)
 */
const calculateKeywordSimilarity = (title1, title2) => {
    try {
        if (!title1 || !title2) return 0;
        
        // Extract important keywords from titles
        const keywords1 = extractKeywordsFromTitle(title1);
        const keywords2 = extractKeywordsFromTitle(title2);
        
        if (keywords1.length === 0 || keywords2.length === 0) return 0;
        
        const commonKeywords = keywords1.filter(keyword => 
            keywords2.some(kw => kw.includes(keyword) || keyword.includes(kw))
        );
        
        const totalKeywords = new Set([...keywords1, ...keywords2]).size;
        
        return commonKeywords.length / totalKeywords;
        
    } catch (err) {
        debug('Failed to calculate keyword similarity', { error: err.message });
        return 0;
    }
};

/**
 * Get article tags
 * GET /api/v1/news/article/:id/tags
 */
const getArticleTags = async (req, res) => {
    try {
        const { id } = req.params;
        
        info('Article tags API request received', { id });

        // Mock tags based on article content
        const tags = [
            { name: 'AI', slug: 'ai', color: '#4A90E2' },
            { name: 'Technology', slug: 'technology', color: '#2ECC71' },
            { name: 'Business Innovation', slug: 'business-innovation', color: '#E74C3C' },
            { name: 'Digital Transformation', slug: 'digital-transformation', color: '#9B59B6' },
            { name: 'Data Privacy', slug: 'data-privacy', color: '#F39C12' }
        ];

        return success({
            code: http_codes.ok,
            data: {
                tags: tags,
                total: tags.length
            },
            msg: 'Article tags fetched successfully',
            res
        });

    } catch (err) {
        logError('Article tags API error', err, { method: 'getArticleTags' });
        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch article tags',
            res,
            error: err,
            method: 'getArticleTags'
        });
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate article tags based on title and category
 */
const generateArticleTags = (title, category) => {
    const tags = [];
    const titleLower = title.toLowerCase();
    
    // Technology tags
    if (titleLower.includes('ai') || titleLower.includes('artificial intelligence')) {
        tags.push({ name: 'AI', slug: 'ai', color: '#4A90E2' });
    }
    if (titleLower.includes('technology') || titleLower.includes('tech')) {
        tags.push({ name: 'Technology', slug: 'technology', color: '#2ECC71' });
    }
    if (titleLower.includes('digital') || titleLower.includes('transformation')) {
        tags.push({ name: 'Digital Transformation', slug: 'digital-transformation', color: '#9B59B6' });
    }
    
    // Business tags
    if (titleLower.includes('business') || titleLower.includes('innovation')) {
        tags.push({ name: 'Business Innovation', slug: 'business-innovation', color: '#E74C3C' });
    }
    if (titleLower.includes('privacy') || titleLower.includes('data')) {
        tags.push({ name: 'Data Privacy', slug: 'data-privacy', color: '#F39C12' });
    }
    
    // Default tags if none found
    if (tags.length === 0) {
        tags.push(
            { name: 'AI', slug: 'ai', color: '#4A90E2' },
            { name: 'Technology', slug: 'technology', color: '#2ECC71' },
            { name: 'Business Innovation', slug: 'business-innovation', color: '#E74C3C' }
        );
    }
    
    return tags.slice(0, 3); // Return max 3 tags
};

/**
 * Calculate reading time for an article
 */
const calculateReadingTime = (content) => {
    if (!content) return '2 min read';
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return `${readingTime} min read`;
};

/**
 * Format date to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Format date to relative time
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Create a simple hash from string
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
const createSimpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};


/**
 * Try to fetch image from article URL (async)
 * @param {string} articleUrl - Article URL
 * @returns {Promise<string|null>} - Image URL or null
 */
const fetchImageFromArticle = async (articleUrl) => {
    try {
        if (!articleUrl || !articleUrl.startsWith('http')) {
            return null;
        }

        // Skip Google News redirects for now to avoid complexity
        if (articleUrl.includes('news.google.com')) {
            return null;
        }

        debug('Attempting to fetch image from article', { url: articleUrl });
        
        // This would require axios to fetch the article content
        // For now, we'll rely on RSS content extraction
        return null;
        
    } catch (err) {
        debug('Failed to fetch image from article', { error: err.message, url: articleUrl });
        return null;
    }
};

/**
 * Generate news-related image URL with better keyword matching
 * @param {string} title - Article title
 * @param {number} hash - Hash for uniqueness
 * @returns {string} - Image URL
 */
const generateNewsImageUrl = (title, hash) => {
    const keywords = extractKeywordsFromTitle(title);
    
    // Create a more sophisticated image URL based on content
    if (keywords.includes('spacex') || keywords.includes('rocket') || keywords.includes('space')) {
        return `https://picsum.photos/300/200?random=${hash + 1000}`; // Space-related seed
    } else if (keywords.includes('stock') || keywords.includes('market') || keywords.includes('finance')) {
        return `https://picsum.photos/300/200?random=${hash + 2000}`; // Finance-related seed
    } else if (keywords.includes('typhoon') || keywords.includes('storm') || keywords.includes('weather')) {
        return `https://picsum.photos/300/200?random=${hash + 3000}`; // Weather-related seed
    } else if (keywords.includes('business') || keywords.includes('company') || keywords.includes('office')) {
        return `https://picsum.photos/300/200?random=${hash + 4000}`; // Business-related seed
    } else {
        return `https://picsum.photos/300/200?random=${hash}`; // General news seed
    }
};

/**
 * Extract keywords from title for content-related images
 * @param {string} title - Article title
 * @returns {string[]} - Array of keywords
 */
const extractKeywordsFromTitle = (title) => {
    if (!title) return ['news', 'business'];
    
    // Enhanced news keywords with visual relevance
    const newsKeywords = [
        'business', 'technology', 'finance', 'politics', 'economy', 'sports', 
        'health', 'science', 'world', 'breaking', 'market', 'stock', 'crypto',
        'ai', 'artificial', 'intelligence', 'climate', 'environment', 'energy',
        'space', 'tech', 'startup', 'company', 'government', 'election',
        'spacex', 'rocket', 'launch', 'typhoon', 'storm', 'weather', 'gold',
        'money', 'bank', 'office', 'meeting', 'conference', 'building',
        'city', 'urban', 'people', 'crowd', 'protest', 'election'
    ];
    
    // Extract words from title
    const words = title.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    // Find matching news keywords
    const foundKeywords = words.filter(word => 
        newsKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
    );
    
    // If no news keywords found, use the most important words
    if (foundKeywords.length === 0) {
        const importantWords = words.slice(0, 3).filter(word => word.length > 3);
        return importantWords.length > 0 ? importantWords : ['news', 'business'];
    }
    
    // Add some general news terms for better image results
    const result = foundKeywords.slice(0, 2);
    if (!result.includes('news') && !result.includes('business')) {
        result.push('news');
    }
    
    return result;
};

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * Get news from RSS feeds
 * GET /api/v1/news
 * Query parameters:
 * - category: News category (optional)
 * - limit: Maximum number of articles (optional, default: 100)
 * - feeds: Comma-separated list of custom RSS feed URLs (optional)
 * - useCache: Whether to use cache (optional, default: true)
 * - sort: Sort order 'asc' or 'desc' (optional, default: 'desc')
 */
const getNews = async (req, res) => {
    try {
        const {
            category = 'topStories',
            limit = 100,
            feeds = '',
            useCache = 'true',
            sort = 'desc'
        } = req.query;

        info('News API request received', { 
            category, 
            limit, 
            hasCustomFeeds: !!feeds,
            useCache,
            sort
        });

        // Validate limit
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
            return error({
                code: http_codes.badRequest,
                msg: 'Limit must be a number between 1 and 500',
                res,
                method: 'getNews'
            });
        }

        // Prepare feed URLs
        let feedUrls = [];
        
        if (feeds) {
            // Use custom feeds if provided
            feedUrls = feeds.split(',').map(url => url.trim()).filter(url => url);
            
            if (feedUrls.length === 0) {
                return error({
                    code: http_codes.badRequest,
                    msg: 'Invalid feed URLs provided',
                    res,
                    method: 'getNews'
                });
            }
        } else {
            // Use predefined Google News feeds
            const feedUrl = googleNewsFeeds[category];
            if (!feedUrl) {
                return error({
                    code: http_codes.badRequest,
                    msg: `Invalid category. Available categories: ${Object.keys(googleNewsFeeds).join(', ')}`,
                    res,
                    method: 'getNews'
                });
            }
            feedUrls = [feedUrl];
        }

        // Fetch news
        const options = {
            category,
            limit: parsedLimit,
            useCache: useCache === 'true',
            sort
        };

        const articles = await fetchNews(feedUrls, options);

        // Return success response
        return success({
            code: http_codes.ok,
            data: articles,
            msg: messages.newsFetchSuccess,
            res,
            extra: {
                meta: {
                    total: articles.length,
                    category,
                    limit: parsedLimit,
                    cached: useCache === 'true'
                }
            }
        });

    } catch (err) {
        logError('News API error', err, { 
            query: req.query,
            method: 'getNews'
        });

        return error({
            code: http_codes.internalError,
            msg: messages.newsFetchError,
            res,
            error: err,
            method: 'getNews'
        });
    }
};

/**
 * Get news from multiple categories
 * GET /api/v1/news/multiple
 * Body parameters:
 * - categories: Array of categories (required)
 * - limit: Maximum number of articles per category (optional, default: 20)
 * - useCache: Whether to use cache (optional, default: true)
 */
const getMultipleCategories = async (req, res) => {
    try {
        const { categories, limit = 20, useCache = true } = req.body;

        // Validate required parameters
        const missingParams = checkMissingParameters(req, res, {
            body: ['categories']
        });

        if (missingParams) {
            return missingParams;
        }

        // Validate categories
        if (!Array.isArray(categories) || categories.length === 0) {
            return error({
                code: http_codes.badRequest,
                msg: 'Categories must be a non-empty array',
                res,
                method: 'getMultipleCategories'
            });
        }

        // Validate limit
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            return error({
                code: http_codes.badRequest,
                msg: 'Limit must be a number between 1 and 100',
                res,
                method: 'getMultipleCategories'
            });
        }

        info('Multiple categories news request', { 
            categories, 
            limit: parsedLimit,
            useCache
        });

        // Fetch news for each category
        const categoryPromises = categories.map(async (category) => {
            try {
                const feedUrl = googleNewsFeeds[category];
                if (!feedUrl) {
                    warn('Invalid category requested', { category });
                    return { category, articles: [], error: 'Invalid category' };
                }

                const articles = await fetchNews([feedUrl], {
                    category,
                    limit: parsedLimit,
                    useCache
                });

                return { category, articles };
            } catch (err) {
                logError('Failed to fetch category news', err, { category });
                return { category, articles: [], error: err.message };
            }
        });

        const results = await Promise.all(categoryPromises);

        // Format response
        const response = {
            results: results.map(({ category, articles, error }) => ({
                category,
                count: articles.length,
                articles: error ? [] : articles,
                error: error || null
            })),
            summary: {
                totalCategories: categories.length,
                successfulCategories: results.filter(r => !r.error).length,
                totalArticles: results.reduce((sum, r) => sum + r.articles.length, 0)
            }
        };

        return success({
            code: http_codes.ok,
            data: response,
            msg: 'Multiple categories news fetched successfully',
            res
        });

    } catch (err) {
        logError('Multiple categories news API error', err, { 
            body: req.body,
            method: 'getMultipleCategories'
        });

        return error({
            code: http_codes.internalError,
            msg: 'Failed to fetch multiple categories news',
            res,
            error: err,
            method: 'getMultipleCategories'
        });
    }
};

/**
 * Get available news categories
 * GET /api/v1/news/categories
 */
const getCategories = async (req, res) => {
    try {
        // Define specific categories for the design
        const specificCategories = [
            { name: 'Business', slug: 'business' },
            { name: 'Technology', slug: 'technology' },
            { name: 'Finance', slug: 'finance' },
            { name: 'Marketing', slug: 'marketing' },
            { name: 'Leadership', slug: 'leadership' },
            { name: 'Startups', slug: 'startups' }
        ];

        // Get article counts for each category
        const categoryDetails = await Promise.all(
            specificCategories.map(async (category) => {
                try {
                    // Map design categories to actual RSS feeds
                    let feedUrl = '';
                    switch (category.slug) {
                        case 'business':
                            feedUrl = googleNewsFeeds.business;
                            break;
                        case 'technology':
                            feedUrl = googleNewsFeeds.technology;
                            break;
                        case 'finance':
                            feedUrl = googleNewsFeeds.business; // Finance news from business feed
                            break;
                        case 'marketing':
                            feedUrl = googleNewsFeeds.business; // Marketing news from business feed
                            break;
                        case 'leadership':
                            feedUrl = googleNewsFeeds.business; // Leadership news from business feed
                            break;
                        case 'startups':
                            feedUrl = googleNewsFeeds.technology; // Startup news from technology feed
                            break;
                        default:
                            feedUrl = googleNewsFeeds.business;
                    }

                    if (feedUrl) {
                        const articles = await fetchFeed(feedUrl, category.slug);
                        return {
                            name: category.name,
                            slug: category.slug,
                            count: articles.length
                        };
                    } else {
                        return {
                            name: category.name,
                            slug: category.slug,
                            count: 0
                        };
                    }
                } catch (err) {
                    warn('Failed to fetch count for category', { category: category.slug, error: err.message });
                    return {
                        name: category.name,
                        slug: category.slug,
                        count: 0
                    };
                }
            })
        );

        return success({
            code: http_codes.ok,
            data: {
                categories: categoryDetails,
                total: categoryDetails.length
            },
            msg: 'Categories retrieved successfully',
            res
        });

    } catch (err) {
        logError('Categories API error', err, { method: 'getCategories' });

        return error({
            code: http_codes.internalError,
            msg: 'Failed to retrieve categories',
            res,
            error: err,
            method: 'getCategories'
        });
    }
};

/**
 * Get cache statistics
 * GET /api/v1/news/cache/stats
 */
const getCacheStats = async (req, res) => {
    try {
        const { getStats } = require('../utils/cacheManager');
        const stats = getStats();

        return success({
            code: http_codes.ok,
            data: stats,
            msg: 'Cache statistics retrieved successfully',
            res
        });

    } catch (err) {
        logError('Cache stats API error', err, { method: 'getCacheStats' });

        return error({
            code: http_codes.internalError,
            msg: 'Failed to retrieve cache statistics',
            res,
            error: err,
            method: 'getCacheStats'
        });
    }
};

/**
 * Clear cache
 * DELETE /api/v1/news/cache
 */
const clearCache = async (req, res) => {
    try {
        const { clear } = require('../utils/cacheManager');
        clear();

        info('Cache cleared via API');

        return success({
            code: http_codes.ok,
            data: { message: 'Cache cleared successfully' },
            msg: 'Cache cleared successfully',
            res
        });

    } catch (err) {
        logError('Clear cache API error', err, { method: 'clearCache' });

        return error({
            code: http_codes.internalError,
            msg: 'Failed to clear cache',
            res,
            error: err,
            method: 'clearCache'
        });
    }
};

/**
 * Get category description
 * @param {string} category - Category name
 * @returns {string} - Category description
 */
const getCategoryDescription = (category) => {
    const descriptions = {
        topStories: 'Top stories from Google News',
        world: 'World news and international events',
        business: 'Business and financial news',
        technology: 'Technology and innovation news',
        health: 'Health and medical news',
        sports: 'Sports news and updates',
        entertainment: 'Entertainment and celebrity news',
        science: 'Science and research news'
    };

    return descriptions[category] || 'News category';
};

module.exports = {
    // Original APIs
    getNews,
    getMultipleCategories,
    getCategories,
    getCacheStats,
    clearCache,
    
    // Design-specific APIs
    getBreakingNews,
    getFeaturedArticle,
    getLatestArticles,
    getMoreArticles,
    getSidebarLatest,
    getSidebarCategories,
    getSidebarTrending,
    
    // Article Detail APIs
    getArticleDetail,
    getRelatedArticles,
    getArticleTags
};