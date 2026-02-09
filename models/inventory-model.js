const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get inventory and classification data by inv_id
 *   * ************************** */
async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error(error)
  }
}

/* ***************************
 *  Get all inventory with classification data
 * ************************** */
async function getAllInventory() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      ORDER BY c.classification_name, i.inv_make, i.inv_model`
    )
    return data.rows
  } catch (error) {
    console.error("getAllInventory error " + error)
  }
}

/* ***************************
 *  Get classification by name
 * ************************** */
async function getClassificationByName(classificationName) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification WHERE LOWER(classification_name) = LOWER($1)",
      [classificationName]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationByName error " + error)
  }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function addClassification(classificationName) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classificationName]
    )
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error " + error)
    throw error
  }
}

/* ***************************
 *  Insert new inventory
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const result = await pool.query(
      `INSERT INTO public.inventory 
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]
    )
    return result.rows[0]
  } catch (error) {
    console.error("addInventory error " + error)
    throw error
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryById, getAllInventory, getClassificationByName, addClassification, addInventory};