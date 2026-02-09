const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * Unit 3, Activities
 * *************** */
let pool

// If DATABASE_URL is not set, export a stub that throws a clear error
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set. Database queries will fail until it is configured.')
  module.exports = {
    async query() {
      throw new Error('DATABASE_URL environment variable is not set')
    },
  }
} else {
  // Use SSL for database connections (required by most remote databases like Render)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  // Helpful wrapper to log queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        if (process.env.NODE_ENV !== 'production') console.log('executed query', { text })
        return res
      } catch (error) {
        console.error('error in query', { text, error: error.message })
        throw error
      }
    },
  }
}
