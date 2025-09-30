const { DEBUG } = process.env;

/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and debug mode
 */

const isDebug = DEBUG === 'true';

/**
 * Log info messages
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const info = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

/**
 * Log error messages
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} data - Additional data to log
 */
const error = (message, error = null, data = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`);
    
    if (error) {
        console.error(`[${timestamp}] [ERROR] Stack:`, error.stack);
    }
    
    if (data) {
        console.error(`[${timestamp}] [ERROR] Data:`, JSON.stringify(data, null, 2));
    }
};

/**
 * Log warning messages
 * @param {string} message - Warning message
 * @param {Object} data - Additional data to log
 */
const warn = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

/**
 * Log debug messages (only in debug mode)
 * @param {string} message - Debug message
 * @param {Object} data - Additional data to log
 */
const debug = (message, data = null) => {
    if (isDebug) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
};

/**
 * Log success messages
 * @param {string} message - Success message
 * @param {Object} data - Additional data to log
 */
const success = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SUCCESS] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

module.exports = {
    info,
    error,
    warn,
    debug,
    success
};
