const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 *  Assignment 3, Task 1
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const invId = req.params.id
  let vehicle = await invModel.getInventoryById(invId)
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
  let nav = await utilities.getNav()
  const vehicleTitle =
    vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleTitle,
    message: null,
    htmlData,
  })
}

/* ***************************
 *  Build all inventory view
 * ************************** */
invCont.buildInventory = async function (req, res, next) {
  let data = await invModel.getAllInventory()
  // Group inventory by classification for filters
  const classifications = [...new Set(data.map(item => item.classification_name))]
  res.render("./inventory/inventory", {
    title: "Vehicle Inventory",
    inventory: data,
    classifications,
    currentFilter: null,
    page: "inventory"
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let inventory = await invModel.getAllInventory()
  
  res.render("./inventory/management", {
    title: "Inventory Management",
    inventory,
    flashMessage: req.query.message || null,
    messageType: req.query.type || null
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    errors: null
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg)
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      errors: errorMessages,
      classification_name
    })
  }
  
  try {
    const result = await invModel.addClassification(classification_name)
    req.session.messages = req.session.messages || []
    req.session.messages.push({
      type: "success",
      message: `Classification "${classification_name}" added successfully!`
    })
    res.redirect("/inv/management")
  } catch (error) {
    req.session.messages = req.session.messages || []
    req.session.messages.push({
      type: "error",
      message: "Failed to add classification. Please try again."
    })
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      errors: ["Failed to add classification"],
      classification_name
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    classificationSelect,
    errors: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: ""
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg)
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    return res.render("./inventory/add-inventory", {
      title: "Add Vehicle",
      classificationSelect,
      errors: errorMessages,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
  
  try {
    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image || null,
      inv_thumbnail || null,
      inv_price,
      inv_miles,
      inv_color || null,
      classification_id
    )
    req.session.messages = req.session.messages || []
    req.session.messages.push({
      type: "success",
      message: `${inv_year} ${inv_make} ${inv_model} added successfully!`
    })
    res.redirect("/inv/management")
  } catch (error) {
    req.session.messages = req.session.messages || []
    req.session.messages.push({
      type: "error",
      message: "Failed to add vehicle. Please try again."
    })
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    return res.render("./inventory/add-inventory", {
      title: "Add Vehicle",
      classificationSelect,
      errors: ["Failed to add vehicle"],
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ****************************************
 *  Error Route
 *  Assignment 3, Task 3
 **************************************** */
invCont.throwError = async function (req, res) {
  throw new Error("I made this error on purpose")
}

module.exports = invCont