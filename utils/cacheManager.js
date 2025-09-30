const logger = require('./logger');

/**
 * In-memory cache manager for RSS feeds and news data
 * Provides TTL (Time To Live) support and automatic cleanup
 */

// Cache storage
const cache = new Map();
const defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const cleanupInterval = 60 * 1000; // 1 minute cleanup interval

/**
 * Set a value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
const set = (key, value, ttl = defaultTTL) => {
    const expiry = Date.now() + ttl;
    cache.set(key, {
        value,
        expiry,
        createdAt: Date.now()
    });
    
    logger.debug(`Cache set for key: ${key}`, { ttl, expiry });
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found/expired
 */
const get = (key) => {
    const item = cache.get(key);
    
    if (!item) {
        logger.debug(`Cache miss for key: ${key}`);
        return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
        cache.delete(key);
        logger.debug(`Cache expired for key: ${key}`);
        return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return item.value;
};

/**
 * Check if a key exists in cache and is not expired
 * @param {string} key - Cache key
 * @returns {boolean} - True if key exists and is valid
 */
const has = (key) => {
    const item = cache.get(key);
    
    if (!item) {
        return false;
    }

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return false;
    }

    return true;
};

/**
 * Delete a specific key from cache
 * @param {string} key - Cache key to delete
 * @returns {boolean} - True if key was deleted
 */
const deleteKey = (key) => {
    const deleted = cache.delete(key);
    logger.debug(`Cache delete for key: ${key}`, { deleted });
    return deleted;
};

/**
 * Clear all cache entries
 */
const clear = () => {
    cache.clear();
    logger.info('Cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
const getStats = () => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, item] of cache.entries()) {
        if (now > item.expiry) {
            expiredEntries++;
        } else {
            validEntries++;
        }
    }

    return {
        totalEntries: cache.size,
        validEntries,
        expiredEntries,
        memoryUsage: process.memoryUsage()
    };
};

/**
 * Clean up expired entries
 */
const cleanup = () => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of cache.entries()) {
        if (now > item.expiry) {
            cache.delete(key);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        logger.debug(`Cache cleanup completed`, { cleanedCount });
    }
};

/**
 * Start automatic cleanup of expired entries
 */
const startCleanup = () => {
    setInterval(() => {
        cleanup();
    }, cleanupInterval);
    
    logger.info('Cache cleanup started', { interval: cleanupInterval });
};

/**
 * Generate cache key for RSS feed
 * @param {string} url - RSS feed URL
 * @param {Object} options - Additional options
 * @returns {string} - Generated cache key
 */
const generateFeedKey = (url, options = {}) => {
    const optionsStr = JSON.stringify(options);
    return `rss_feed:${Buffer.from(url + optionsStr).toString('base64')}`;
};

/**
 * Generate cache key for merged news
 * @param {Array} urls - Array of RSS feed URLs
 * @param {Object} options - Additional options
 * @returns {string} - Generated cache key
 */
const generateNewsKey = (urls, options = {}) => {
    const urlsStr = urls.sort().join(',');
    const optionsStr = JSON.stringify(options);
    return `news_merged:${Buffer.from(urlsStr + optionsStr).toString('base64')}`;
};

// Start cleanup on module load
startCleanup();

module.exports = {
    set,
    get,
    has,
    delete: deleteKey,
    clear,
    getStats,
    cleanup,
    generateFeedKey,
    generateNewsKey
};
