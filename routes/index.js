const { http_codes, messages } = require('../constant/text.constant');
const { error, success } = require('../common/res.common');
const news = require('./news.routes');

const routes = ({ app }) => {
    // Mount all route modules
    app.use('/api/v1/news', news);

    // Health check route
    app.get('/api/health', (req, res) => {
        return success({
            code: http_codes.ok,
            data: {
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Times-Aura-News',
                version: '1.0.0'
            },
            msg: 'Service is healthy',
            res
        });
    });

    // API info route
    app.get('/api', (req, res) => {
        return success({
            code: http_codes.ok,
            data: {
                message: 'Times Aura News API',
                version: '1.0.0',
                endpoints: {
                    news: '/api/v1/news',
                    categories: '/api/v1/news/categories',
                    health: '/api/health'
                },
                documentation: 'See README.md for detailed API documentation'
            },
            msg: 'API Information',
            res
        });
    });

    // Root route
    app.get('/', (req, res) => {
        return success({
            code: http_codes.ok,
            data: {
                message: 'Times Aura News API',
                version: '1.0.0',
                endpoints: {
                    api: '/api',
                    news: '/api/v1/news',
                    health: '/api/health'
                }
            },
            msg: 'Welcome to Times Aura News API',
            res
        });
    });

    // 404 handler for unmatched routes
    app.use((req, res) => {
        return error({
            code: http_codes.notFound,
            msg: `Route ${req.originalUrl} not found`,
            req,
            res
        });
    });
};

module.exports = routes;
