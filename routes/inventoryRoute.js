// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const authMiddleware = require("../utilities/auth-middleware")
const { classificationRules, inventoryRules, handleValidationErrors } = require("../utilities/validation")

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
 * Route to build inventory view (all vehicles)
 **************************************** */
router.get("/", utilities.handleErrors(invController.buildInventory));

/* ****************************************
 * Route to build inventory management view
 **************************************** */
router.get("/management", authMiddleware.verifyJWT, requireAdmin, utilities.handleErrors(invController.buildManagement));

/* ****************************************
 * Route to build add classification view
 **************************************** */
router.get("/add-classification", authMiddleware.verifyJWT, requireAdmin, utilities.handleErrors(invController.buildAddClassification));

/* ****************************************
 * Route to process add classification form
 **************************************** */
router.post("/add-classification", authMiddleware.verifyJWT, requireAdmin, classificationRules(), utilities.handleErrors(invController.addClassification));

/* ****************************************
 * Route to build add inventory view
 **************************************** */
router.get("/add-inventory", authMiddleware.verifyJWT, requireAdmin, utilities.handleErrors(invController.buildAddInventory));

/* ****************************************
 * Route to process add vehicle form
 **************************************** */
router.post("/add-inventory", authMiddleware.verifyJWT, requireAdmin, inventoryRules(), utilities.handleErrors(invController.addInventory));

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


/* ****************************************
 * Route to build vehicle detail view
 **************************************** */
router.get("/detail/:id", 
utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get(
  "/broken",
  utilities.handleErrors(invController.throwError)
)


module.exports = router;