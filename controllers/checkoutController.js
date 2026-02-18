const cartModel = require("../models/cart-model")
const pool = require("../database")

const checkoutController = {}

/* ***************************
 *  Process Checkout
 *  Creates order and clears cart
 * ************************** */
checkoutController.processCheckout = async function (req, res, next) {
  try {
    const accountId = req.user.accountId
    const email = req.user.email

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Get cart items
    const cartItems = await cartModel.getItemsByAccountId(accountId)
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      })
    }

    // Calculate total
    const subtotal = cartItems.reduce((s, i) => s + Number(i.cart_unit_price) * i.cart_quantity, 0)
    const TAX_RATE = 0.08875
    const tax = Number((subtotal * TAX_RATE).toFixed(2))
    const total = Number((subtotal + tax).toFixed(2))

    // Create order record (can be expanded later with order table)
    // For now, we'll store order info in a session or return confirmation
    
    // Clear cart
    await cartModel.clearCart(accountId)

    // TODO: Send confirmation email to user

    return res.json({
      success: true,
      message: 'Order received! You will receive an email confirmation shortly.',
      orderTotal: total,
      userEmail: email,
      itemCount: cartItems.length
    })
  } catch (error) {
    console.error('Checkout error:', error)
    next(error)
  }
}

module.exports = checkoutController
