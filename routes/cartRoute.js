const express = require("express")
const router = new express.Router()
const cartController = require("../controllers/cartController")
const authMiddleware = require("../utilities/auth-middleware")

// display cart page (server-rendered; client may fetch DB cart if authenticated)
router.get("/", cartController.buildCart)

// Session-backed add (guest fallback)
router.post('/add-session', cartController.addToCart)
router.post('/update-session', cartController.updateSessionItem)
router.post('/remove-session', cartController.removeSessionItem)

// Authenticated (DB-backed) API endpoints
router.post('/add', authMiddleware.verifyJWT, cartController.addToCartDB)
router.get('/items', authMiddleware.verifyJWT, cartController.getCartItemsAPI)
router.post('/update', authMiddleware.verifyJWT, cartController.updateCartItemAPI)
router.delete('/remove', authMiddleware.verifyJWT, cartController.removeCartItemAPI)
router.get('/count', authMiddleware.verifyJWT, cartController.getCartCountAPI)

module.exports = router
