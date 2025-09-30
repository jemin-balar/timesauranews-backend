/**
 * Examples of how to use the Times Aura News API
 * These examples demonstrate various API endpoints and use cases
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Example 1: Get basic news
async function getBasicNews() {
    console.log('📰 Example 1: Getting basic news...');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/news`);
        console.log(`Found ${response.data.data.length} articles`);
        console.log('First article:', response.data.data[0]);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 2: Get technology news with custom limit
async function getTechnologyNews() {
    console.log('\n💻 Example 2: Getting technology news...');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/news?category=technology&limit=10`);
        console.log(`Found ${response.data.data.length} technology articles`);
        
        // Show first few articles
        response.data.data.slice(0, 3).forEach((article, index) => {
            console.log(`${index + 1}. ${article.title}`);
            console.log(`   Source: ${article.source}`);
            console.log(`   Published: ${new Date(article.publishedAt).toLocaleString()}`);
            console.log('');
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 3: Get news from custom RSS feeds
async function getCustomFeeds() {
    console.log('\n🔗 Example 3: Getting news from custom feeds...');
    
    try {
        const customFeeds = [
            'https://feeds.bbci.co.uk/news/rss.xml',
            'https://rss.cnn.com/rss/edition.rss'
        ];
        
        const feedsParam = customFeeds.join(',');
        const response = await axios.get(`${BASE_URL}/api/news?feeds=${feedsParam}&limit=5`);
        console.log(`Found ${response.data.data.length} articles from custom feeds`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 4: Get multiple categories
async function getMultipleCategories() {
    console.log('\n📊 Example 4: Getting multiple categories...');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/news/multiple`, {
            categories: ['technology', 'business', 'health'],
            limit: 5
        });
        
        console.log('Multiple categories result:');
        response.data.data.results.forEach(result => {
            console.log(`${result.category}: ${result.count} articles`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 5: Get available categories
async function getAvailableCategories() {
    console.log('\n📋 Example 5: Getting available categories...');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/news/categories`);
        console.log('Available categories:');
        response.data.data.categories.forEach(category => {
            console.log(`- ${category.name}: ${category.description}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 6: Cache management
async function manageCache() {
    console.log('\n🗄️ Example 6: Cache management...');
    
    try {
        // Get cache stats
        const statsResponse = await axios.get(`${BASE_URL}/api/news/cache/stats`);
        console.log('Cache statistics:', statsResponse.data.data);
        
        // Clear cache
        const clearResponse = await axios.delete(`${BASE_URL}/api/news/cache`);
        console.log('Cache cleared:', clearResponse.data.data.message);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example 7: Error handling
async function demonstrateErrorHandling() {
    console.log('\n⚠️ Example 7: Error handling...');
    
    try {
        // Try to get news with invalid category
        const response = await axios.get(`${BASE_URL}/api/news?category=invalid_category`);
        console.log('This should not be reached');
    } catch (error) {
        console.log('Caught expected error:', error.response.data.error.msg);
    }
    
    try {
        // Try to get news with invalid limit
        const response = await axios.get(`${BASE_URL}/api/news?limit=invalid_limit`);
        console.log('This should not be reached');
    } catch (error) {
        console.log('Caught expected error:', error.response.data.error.msg);
    }
}

// Run all examples
async function runExamples() {
    console.log('🚀 Times Aura News API Examples\n');
    console.log('Make sure the server is running on http://localhost:3000\n');
    
    await getBasicNews();
    await getTechnologyNews();
    await getCustomFeeds();
    await getMultipleCategories();
    await getAvailableCategories();
    await manageCache();
    await demonstrateErrorHandling();
    
    console.log('\n✅ All examples completed!');
}

// Export functions for individual use
module.exports = {
    getBasicNews,
    getTechnologyNews,
    getCustomFeeds,
    getMultipleCategories,
    getAvailableCategories,
    manageCache,
    demonstrateErrorHandling,
    runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
    runExamples();
}
