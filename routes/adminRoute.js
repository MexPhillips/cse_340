const express = require("express")
const router = new express.Router()
const adminController = require("../controllers/adminController")
const utilities = require("../utilities")
const authMiddleware = require("../utilities/auth-middleware")

/* *************************************
 * Admin Authorization Middleware
 * Checks if user is authenticated and has Admin role
 * *************************************/
const requireAdmin = (req, res, next) => {
  // If user has JWT token in req.user, check admin status
  if (req.user && req.user.accountType === 'Admin') {
    return next()
  }
  
  // If no authentication or not admin, return 403
  res.status(403).render('errors/error', {
    title: 'Access Denied',
    message: 'Admin access required. You do not have permission to perform this action.'
  })
}

/* ****************************************
 * Route to build admin dashboard
 **************************************** */
router.get("/dashboard", authMiddleware.verifyJWT, requireAdmin, utilities.handleErrors(adminController.buildDashboard))

module.exports = router
