const express = require("express")
const router = new express.Router()
const checkoutController = require("../controllers/checkoutController")
const utilities = require("../utilities")
const authMiddleware = require("../utilities/auth-middleware")

/* ****************************************
 * Route to process checkout
 **************************************** */
router.post("/process", authMiddleware.verifyJWT, utilities.handleErrors(checkoutController.processCheckout))

module.exports = router
