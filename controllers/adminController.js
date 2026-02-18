const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const pool = require("../database")
const utilities = require("../utilities")

const adminController = {}

/* ***************************
 *  Build Admin Dashboard
 *  Shows overview stats and quick actions
 * ************************** */
adminController.buildDashboard = async function (req, res, next) {
  try {
    // Get inventory statistics
    const allInventory = await invModel.getAllInventory()
    const totalVehicles = allInventory.length
    
    // Get classifications
    const classResult = await pool.query(`
      SELECT COUNT(*) as count FROM public.classification
    `)
    const totalClassifications = classResult.rows[0].count
    
    // Get total accounts
    const accountResult = await pool.query(`
      SELECT COUNT(*) as count FROM public.account
    `)
    const totalAccounts = accountResult.rows[0].count
    
    // Get total admin accounts
    const adminResult = await pool.query(`
      SELECT COUNT(*) as count FROM public.account WHERE account_type = 'Admin'
    `)
    const totalAdmins = adminResult.rows[0].count
    
    // Get cart items count
    const cartResult = await pool.query(`
      SELECT COUNT(*) as count FROM public.cart
    `)
    const totalCartItems = cartResult.rows[0].count
    
    // Get inventory value (sum of prices)
    const valueResult = await pool.query(`
      SELECT COALESCE(SUM(inv_price * inv_miles / 1000), 0) as value FROM public.inventory
    `)
    const inventoryValue = Math.round(valueResult.rows[0].value)
    
    // Get recent vehicles (last 5 added)
    const recentVehicles = allInventory.slice(0, 5).map(v => ({
      inv_id: v.inv_id,
      inv_year: v.inv_year,
      inv_make: v.inv_make,
      inv_model: v.inv_model,
      inv_price: v.inv_price
    }))
    
    // Get price range info
    const priceStats = await pool.query(`
      SELECT 
        MIN(inv_price) as min_price,
        MAX(inv_price) as max_price,
        AVG(inv_price) as avg_price
      FROM public.inventory
    `)
    const priceInfo = priceStats.rows[0]

    res.render("./admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        totalVehicles,
        totalClassifications,
        totalAccounts,
        totalAdmins,
        totalCartItems,
        inventoryValue,
        minPrice: Math.round(priceInfo.min_price || 0),
        maxPrice: Math.round(priceInfo.max_price || 0),
        avgPrice: Math.round(priceInfo.avg_price || 0)
      },
      recentVehicles,
      message: null
    })
  } catch (error) {
    console.error("Dashboard error: " + error)
    next(error)
  }
}

module.exports = adminController
