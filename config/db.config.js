const { connect } = require('mongoose');
const { MONGODBURL } = process.env;

module.exports = async () => {
    try {
        await connect(MONGODBURL);
        console.log("MongoDB database connected...");
    } catch (error) {
        console.error("MongoDB database connection error:", error);
        process.exit(1); // Exit the process if connection fails
    }
}