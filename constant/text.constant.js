const http_codes = {
    badRequest: 400,
    internalError: 500,
    created: 201,
    notFound: 404,
    ok: 200,
    notImplemented: 501,
    forbidden: 403,
    unAuthorized: 401,
    sessionExpire: 440
}

const messages = {
    internalError: "Internal server error",
    created: "Created",
    notFound: "Not found",
    ok: "OK",
    notImplemented: "Not implemented",
    forbidden: "Forbidden",
    unAuthorized: "Unauthorized",
    sessionExpire: "Session expired",
    missingfields: "Missing required fields: @Fields",
    newsFetchSuccess: "News fetched successfully",
    newsFetchError: "Failed to fetch news",
    rssParseError: "Failed to parse RSS feed",
    cacheHit: "Cache hit",
    cacheMiss: "Cache miss"
}

// News-related constants
const newsConstants = {
    defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
    maxArticles: 100,
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    defaultCategory: 'general',
    sortOrder: 'desc'
}

// Google News RSS feed URLs for different categories
const googleNewsFeeds = {
    topStories: 'https://news.google.com/rss',
    world: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
    business: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=b',
    technology: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=tc',
    health: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=m',
    sports: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=s',
    entertainment: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=e',
    science: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en&topic=snc'
}

module.exports = {
    http_codes,
    messages,
    newsConstants,
    googleNewsFeeds
}