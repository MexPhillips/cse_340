const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkIds() {
  try {
    const cart = await pool.query('SELECT inv_id, cart_quantity FROM public.cart LIMIT 5')
    const inv = await pool.query('SELECT inv_id, inv_make, inv_model FROM public.inventory LIMIT 5')
    
    console.log('Cart inv_ids:', cart.rows.map(r => r.inv_id))
    console.log('Inventory inv_ids:', inv.rows.map(r => r.inv_id))
    
    await pool.end()
  } catch(e) {
    console.error(e.message)
  }
}

checkIds()
