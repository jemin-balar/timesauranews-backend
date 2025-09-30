const express = require('express');
const app = express()
const cors = require('cors')
const dotenv = require('dotenv').config()
const { PORT } = process.env
const db = require('./config/db.config')

// Import routes
const routes = require('./routes/index')

app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: true }))
app.use(cors())

// Serve static files from images directory
app.use('/images', express.static('images'))

// Initialize database
db()

// Initialize routes
routes({ app })

let server = app.listen(PORT, () => {
    console.log(`🚀 Times Aura News API is live on port ${PORT}`)
    console.log(`📰 News endpoint: http://localhost:${PORT}/api/v1/news`)
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
    console.log(`📋 API info: http://localhost:${PORT}/api`)
})