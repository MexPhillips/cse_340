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

/* *****************************
 * Account Registration Validation Rules
 ***************************** */
const registerRules = () => {
  return [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters"),
    
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character")
  ]
}

/* *****************************
 * Account Login Validation Rules
 ***************************** */
const loginRules = () => {
  return [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    
    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ]
}

/* *****************************
 * Account Update Validation Rules
 ***************************** */
const updateAccountRules = () => {
  return [
    body("firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),
    
    body("lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
    
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
  ]
}

/* *****************************
 * Password Update Validation Rules
 ***************************** */
const updatePasswordRules = () => {
  return [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),
    
    body("confirmPassword")
      .notEmpty()
      .withMessage("Password confirmation is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match")
        }
        return true
      })
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
  registerRules,
  loginRules,
  updateAccountRules,
  updatePasswordRules,
  handleValidationErrors
}
