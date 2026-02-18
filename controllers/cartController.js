const utilities = require("../utilities")
const cartModel = require("../models/cart-model")
const invModel = require("../models/inventory-model")

const cartController = {}

/* Render cart page (server-side session fallback)
   - If user is logged in the client will fetch DB cart via API.
*/
cartController.buildCart = async function (req, res, next) {
  try {
    const cartItems = req.session.cart || []
    let nav = await utilities.getNav()
    res.render("./cart/cart", {
      title: "Shopping Cart",
      nav,
      cartItems,
      message: null
    })
  } catch (error) {
    next(error)
  }
}

/* Session-backed add (guest fallback). Keeps previous behavior. */
cartController.addToCart = async function (req, res, next) {
  try {
    const { invId, name, price, image, quantity = 1 } = req.body
    const qty = parseInt(quantity, 10) || 1
    let cart = req.session.cart || []
    const existing = cart.find(i => Number(i.invId) === Number(invId))
    if (existing) {
      existing.quantity = (existing.quantity || 0) + qty
    } else {
      cart.push({ invId: Number(invId), name, price: Number(price), image, quantity: qty })
    }
    req.session.cart = cart
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

/* DB-backed add (authenticated API)
   Expects: { invId, quantity }
*/
cartController.addToCartDB = async function (req, res, next) {
  try {
    const accountId = req.user && req.user.accountId
    if (!accountId) return res.status(401).json({ success: false, message: 'Authentication required' })

    const { invId, quantity = 1, name, price, image } = req.body
    const qty = parseInt(quantity, 10)
    if (Number.isNaN(qty) || qty < 1) return res.status(400).json({ success: false, message: 'Invalid quantity' })

    // Try to verify inventory exists. If DB is unavailable, fall back to session when possible.
    let inv = null
    let dbError = null
    try {
      inv = await invModel.getInventoryById(invId)
    } catch (err) {
      dbError = err
      console.warn('Inventory lookup failed — will attempt session fallback if possible:', err.message)
    }

    if (!inv) {
      if (dbError) {
        // Database appears to be down — fallback to session cart if client supplied item details
        if (name && price !== undefined) {
          req.session.cart = req.session.cart || []
          const existing = req.session.cart.find(i => Number(i.invId) === Number(invId))
          if (existing) {
            existing.quantity = (existing.quantity || 0) + qty
          } else {
            req.session.cart.push({ invId: Number(invId), name, price: Number(price), image: image || '/images/vehicles/no-image.png', quantity: qty })
          }
          return res.json({ success: true, fallback: true, message: 'Database temporarily unavailable — item saved to your session cart.' })
        }
        return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please try again later.' })
      }
      return res.status(404).json({ success: false, message: 'Item not found' })
    }

    // Attempt DB insert; if it fails (missing table or DB error), fall back to session
    try {
      const added = await cartModel.addItem(accountId, invId, qty)
      return res.json({ success: true, item: added })
    } catch (dbErr) {
      console.warn('Failed to write cart to DB — falling back to session cart:', dbErr.message)
      // use inventory data (we have `inv`) or request body fields to populate session
      const itemName = (inv && (inv.inv_make + ' ' + inv.inv_model)) || name || 'Item'
      const unitPrice = (inv && inv.inv_price) || (price ? Number(price) : 0)
      const img = (inv && (inv.inv_thumbnail || inv.inv_image)) || image || '/images/vehicles/no-image.png'
      req.session.cart = req.session.cart || []
      const existing = req.session.cart.find(i => Number(i.invId) === Number(invId))
      if (existing) {
        existing.quantity = (existing.quantity || 0) + qty
      } else {
        req.session.cart.push({ invId: Number(invId), name: itemName, price: Number(unitPrice), image: img, quantity: qty })
      }
      return res.json({ success: true, fallback: true, message: 'Database error — item saved to your session cart.' })
    }
  } catch (error) {
    next(error)
  }
}

/* Get cart items (authenticated API) */
cartController.getCartItemsAPI = async function (req, res, next) {
  try {
    const accountId = req.user.accountId
    const items = await cartModel.getItemsByAccountId(accountId)
    const subtotal = Number((items.reduce((s, i) => s + Number(i.cart_unit_price) * i.cart_quantity, 0)).toFixed(2))
    const TAX_RATE = 0.08875 // configurable if you want
    const tax = Number((subtotal * TAX_RATE).toFixed(2))
    const total = Number((subtotal + tax).toFixed(2))
    res.json({ success: true, items, subtotal, tax, total })
  } catch (error) {
    next(error)
  }
}

/* Update quantity (authenticated API) */
cartController.updateCartItemAPI = async function (req, res, next) {
  try {
    const accountId = req.user.accountId
    const { invId, quantity } = req.body
    const qty = parseInt(quantity, 10)
    if (Number.isNaN(qty) || qty < 0) return res.status(400).json({ success: false, message: 'Invalid quantity' })

    if (qty === 0) {
      await cartModel.removeItem(accountId, invId)
      return res.json({ success: true, removed: true })
    }

    const updated = await cartModel.updateItemQuantity(accountId, invId, qty)
    res.json({ success: true, item: updated })
  } catch (error) {
    next(error)
  }
}

/* Remove item (authenticated API) */
cartController.removeCartItemAPI = async function (req, res, next) {
  try {
    const accountId = req.user.accountId
    const { invId } = req.body
    await cartModel.removeItem(accountId, invId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

/* Count items (authenticated API) */
cartController.getCartCountAPI = async function (req, res, next) {
  try {
    const accountId = req.user.accountId
    const count = await cartModel.getItemCount(accountId)
    res.json({ success: true, count })
  } catch (error) {
    next(error)
  }
}

/* Session update/remove endpoints for guests */
cartController.updateSessionItem = async function (req, res, next) {
  try {
    const { invId, quantity } = req.body
    const qty = parseInt(quantity, 10)
    if (Number.isNaN(qty) || qty < 0) return res.redirect('/cart')
    let cart = req.session.cart || []
    const existing = cart.find(i => Number(i.invId) === Number(invId))
    if (!existing) return res.redirect('/cart')
    if (qty === 0) {
      cart = cart.filter(i => Number(i.invId) !== Number(invId))
    } else {
      existing.quantity = qty
    }
    req.session.cart = cart
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

cartController.removeSessionItem = async function (req, res, next) {
  try {
    const { invId } = req.body
    let cart = req.session.cart || []
    cart = cart.filter(i => Number(i.invId) !== Number(invId))
    req.session.cart = cart
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

module.exports = cartController
