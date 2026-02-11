const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const authMiddleware = require("../utilities/auth-middleware")
const { body, validationResult } = require("express-validator")

/* ***************************
 *  Validation Rules
 *  These rules are applied to request data before controller runs
 * ************************** */

// Registration validation rules
const registerValidationRules = () => {
  return [
    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    
    body("email")
      .trim()
      .isEmail().withMessage("Please provide a valid email address")
      .normalizeEmail(),
    
    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/).withMessage("Password must contain at least one number")
  ]
}

// Login validation rules
const loginValidationRules = () => {
  return [
    body("email")
      .trim()
      .isEmail().withMessage("Please provide a valid email address")
      .normalizeEmail(),
    
    body("password")
      .notEmpty().withMessage("Password is required")
  ]
}

// Account update validation rules
const updateAccountValidationRules = () => {
  return [
    body("firstname")
      .trim()
      .notEmpty().withMessage("First name is required")
      .isLength({ min: 1 }).withMessage("First name must not be empty"),
    
    body("lastname")
      .trim()
      .notEmpty().withMessage("Last name is required")
      .isLength({ min: 1 }).withMessage("Last name must not be empty"),
    
    body("email")
      .trim()
      .isEmail().withMessage("Please provide a valid email address")
      .normalizeEmail()
  ]
}

// Password update validation rules
const updatePasswordValidationRules = () => {
  return [
    body("currentPassword")
      .notEmpty().withMessage("Current password is required"),
    
    body("newPassword")
      .notEmpty().withMessage("New password is required")
      .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/).withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character (!@#$%^&*)"),
    
    body("confirmPassword")
      .notEmpty().withMessage("Password confirmation is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match")
        }
        return true
      })
  ]
}

/* ***************************
 *  ROUTES
 * ************************** */

// Display registration form
router.get("/register", accountController.buildRegistrationView)

// Display login form
router.get("/login", accountController.buildLoginView)

// Display account creation success page
router.get("/success", accountController.buildSuccessView)

// Display account detail page (protected)
router.get("/details", accountController.buildAccountDetailView)

// POST register - Create new user account
// Uses validation middleware to check input before controller
router.post(
  "/register",
  registerValidationRules(),
  accountController.registerUser
)

// POST login - Authenticate user and return JWT token
router.post(
  "/login",
  loginValidationRules(),
  accountController.loginUser
)

// GET account details - Protected route (requires JWT)
// authMiddleware.verifyJWT checks for valid token before controller runs
router.get(
  "/",
  authMiddleware.verifyJWT,
  accountController.getUserAccount
)

// PUT update account - Protected route (requires JWT)
// Updates firstname, lastname, email
router.put(
  "/update",
  authMiddleware.verifyJWT,
  updateAccountValidationRules(),
  accountController.updateUserAccount
)

// PUT update password - Protected route (requires JWT)
// Separate endpoint for password updates (requires current password verification)
router.put(
  "/update-password",
  authMiddleware.verifyJWT,
  updatePasswordValidationRules(),
  accountController.updateUserPassword
)

// POST logout - Protected route (optional)
// Client-side JWT deletion is recommended approach
router.post(
  "/logout",
  authMiddleware.verifyJWT,
  accountController.logoutUser
)

module.exports = router
