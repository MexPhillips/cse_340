const pool = require("../database/")

const cartModel = {}

cartModel.addItem = async function (accountId, invId, quantity) {
  try {
    const result = await pool.query(
      `INSERT INTO public.cart (account_id, inv_id, cart_quantity, cart_unit_price)
       VALUES ($1, $2, $3, (SELECT inv_price FROM public.inventory WHERE inv_id = $2))
       ON CONFLICT (account_id, inv_id)
       DO UPDATE SET cart_quantity = public.cart.cart_quantity + EXCLUDED.cart_quantity
       RETURNING *`,
      [accountId, invId, quantity]
    )
    return result.rows[0]
  } catch (error) {
    console.error("cartModel.addItem error", error)
    throw error
  }
}

cartModel.getItemsByAccountId = async function (accountId) {
  try {
    const result = await pool.query(
      `SELECT c.cart_id, c.inv_id, c.cart_quantity, c.cart_unit_price,
              i.inv_make, i.inv_model, i.inv_thumbnail, i.inv_image
       FROM public.cart c
       JOIN public.inventory i ON c.inv_id = i.inv_id
       WHERE c.account_id = $1
       ORDER BY c.created_at DESC`,
      [accountId]
    )
    // map to friendly keys
    return result.rows.map(r => ({
      cart_id: r.cart_id,
      inv_id: r.inv_id,
      cart_quantity: r.cart_quantity,
      cart_unit_price: Number(r.cart_unit_price),
      name: `${r.inv_make} ${r.inv_model}`,
      thumbnail: r.inv_thumbnail || r.inv_image || '/images/vehicles/no-image.png'
    }))
  } catch (error) {
    console.error("cartModel.getItemsByAccountId error", error)
    throw error
  }
}

cartModel.updateItemQuantity = async function (accountId, invId, quantity) {
  try {
    const result = await pool.query(
      `UPDATE public.cart
       SET cart_quantity = $3
       WHERE account_id = $1 AND inv_id = $2
       RETURNING *`,
      [accountId, invId, quantity]
    )
    return result.rows[0]
  } catch (error) {
    console.error("cartModel.updateItemQuantity error", error)
    throw error
  }
}

cartModel.removeItem = async function (accountId, invId) {
  try {
    const result = await pool.query(
      `DELETE FROM public.cart WHERE account_id = $1 AND inv_id = $2 RETURNING *`,
      [accountId, invId]
    )
    return result.rows[0]
  } catch (error) {
    console.error("cartModel.removeItem error", error)
    throw error
  }
}

cartModel.getItemCount = async function (accountId) {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(cart_quantity), 0) AS count FROM public.cart WHERE account_id = $1`,
      [accountId]
    )
    return Number(result.rows[0].count)
  } catch (error) {
    console.error("cartModel.getItemCount error", error)
    throw error
  }
}

cartModel.clearCart = async function (accountId) {
  try {
    await pool.query(`DELETE FROM public.cart WHERE account_id = $1`, [accountId])
    return true
  } catch (error) {
    console.error("cartModel.clearCart error", error)
    throw error
  }
}

module.exports = cartModel
