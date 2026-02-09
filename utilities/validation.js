const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")

/* ****************************
 * Validation Rules
 **************************** */

/* *****************************
 * Classification Validation Rules
 ***************************** */
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required")
      .matches(/^[A-Za-z0-9\s]+$/)
      .withMessage("Classification name can only contain letters, numbers, and spaces")
      .isLength({ min: 1, max: 100 })
      .withMessage("Classification name must be between 1 and 100 characters")
      .custom(async (value) => {
        const existing = await invModel.getClassificationByName(value)
        if (existing) {
          return Promise.reject("Classification already exists")
        }
      })
  ]
}

/* *****************************
 * Inventory Validation Rules
 ***************************** */
const inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required")
      .isInt()
      .withMessage("Valid classification must be selected"),
    
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Make must be between 1 and 50 characters"),
    
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Model must be between 1 and 50 characters"),
    
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Year is required")
      .isInt({ min: 1920, max: 2100 })
      .withMessage("Year must be a valid number between 1920 and 2100"),
    
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Description must be between 1 and 2000 characters"),
    
    body("inv_image")
      .trim()
      .isLength({ max: 255 })
      .withMessage("Image path must be 255 characters or less"),
    
    body("inv_thumbnail")
      .trim()
      .isLength({ max: 255 })
      .withMessage("Thumbnail path must be 255 characters or less"),
    
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number"),
    
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Miles is required")
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number"),
    
    body("inv_color")
      .trim()
      .isLength({ max: 50 })
      .withMessage("Color must be 50 characters or less")
  ]
}

/* ****************************
 * Check Data and Return Errors
 **************************** */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({ msg: err.msg }))
    return { hasErrors: true, errors: errorMessages }
  }
  return { hasErrors: false, errors: [] }
}

module.exports = {
  classificationRules,
  inventoryRules,
  handleValidationErrors
}
