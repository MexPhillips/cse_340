const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const authMiddleware = require("../utilities/auth-middleware")
const { validationResult } = require("express-validator")

const accountController = {}

/* ***************************
 *  Build Registration View
 *  Displays the registration form page
 * ************************** */
accountController.buildRegistrationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./account/register", {
      title: "Register",
      nav,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Login View
 *  Displays the login form page
 * ************************** */
accountController.buildLoginView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./account/login", {
      title: "Log In",
      nav,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Success View
 *  Displays the account creation success page
 * ************************** */
accountController.buildSuccessView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./account/success", {
      title: "Account Created",
      nav,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Register User
 *  POST /account/register
 *  
 *  Process:
 *  1. Validate input data (email format, password length, etc.)
 *  2. Check if email already exists in database
 *  3. Hash password using bcrypt with salt rounds = 10
 *  4. Insert new user into database
 *  5. Generate JWT token
 *  6. Return success response with token
 * ************************** */
accountController.registerUser = async function (req, res, next) {
  try {
    // Check for validation errors from middleware
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      })
    }

    const { username, email, password } = req.body

    // Check if email already exists
    const emailExists = await accountModel.checkEmailExists(email)
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email address is already registered. Please use a different email or log in."
      })
    }

    // Hash password using bcrypt
    // Salt rounds: 10 (higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user into database
    const newUser = await accountModel.registerUser(username, email, hashedPassword)

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to create account. Please try again."
      })
    }

    // Generate JWT token for the new user
    let token
    try {
      const accountType = newUser.account_type || 'Client'
      token = authMiddleware.generateToken(newUser.account_id, newUser.account_email, accountType)
    } catch (tokenError) {
      console.error("JWT generation failed during registration: " + tokenError.message)
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support.",
        debugError: process.env.NODE_ENV === 'development' ? 'JWT_SECRET not configured' : undefined
      })
    }

    // Return success response with token
    return res.status(201).json({
      success: true,
      message: "Account created successfully. You are now logged in.",
      token: token,
      user: {
        id: newUser.account_id,
        username: newUser.account_firstname,
        email: newUser.account_email
      }
    })

  } catch (error) {
    console.error("Registration error: " + error.message)
    console.error("Registration error details: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again.",
      debugError: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/* ***************************
 *  Login User
 *  POST /account/login
 *  
 *  Process:
 *  1. Validate input (email and password provided)
 *  2. Query database for user by email
 *  3. If user not found, return 401 error
 *  4. Compare provided password with stored hash using bcrypt
 *  5. If password doesn't match, return 401 error
 *  6. If credentials valid, generate JWT token
 *  7. Return token to client (client stores in localStorage/sessionStorage)
 * ************************** */
accountController.loginUser = async function (req, res, next) {
  try {
    const { email, password } = req.body

    // Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      })
    }

    // Query database for user with provided email
    const user = await accountModel.getUserByEmail(email)

    // If user not found, return 401 (Unauthorized)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      })
    }

    // Compare provided password with stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.account_password)

    // If password doesn't match, return 401
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      })
    }

    // Credentials are valid, generate JWT token
    let token
    try {
      const accountType = user.account_type || 'Client'
      token = authMiddleware.generateToken(user.account_id, user.account_email, accountType)
    } catch (tokenError) {
      console.error("JWT generation failed during login: " + tokenError.message)
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support.",
        debugError: process.env.NODE_ENV === 'development' ? 'JWT_SECRET not configured' : undefined
      })
    }

    // Return success response with token
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: token,
      user: {
        id: user.account_id,
        username: user.account_firstname,
        email: user.account_email
      }
    })

  } catch (error) {
    console.error("Login error: " + error.message)
    console.error("Full error: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
      debugError: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/* ***************************
 *  Get User Account Details
 *  GET /account/
 *  Protected Route (requires valid JWT)
 *  
 *  Returns current user's account information from database
 *  User ID is extracted from JWT token (req.user.accountId)
 * ************************** */
accountController.getUserAccount = async function (req, res, next) {
  try {
    // Get user ID from JWT token (set by authMiddleware.verifyJWT)
    const accountId = req.user.accountId

    // Query database for user details
    const user = await accountModel.getUserById(accountId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      })
    }

    // Return user account details (note: password NOT included for security)
    return res.status(200).json({
      success: true,
      user: {
        id: user.account_id,
        firstname: user.account_firstname,
        lastname: user.account_lastname,
        email: user.account_email
      }
    })

  } catch (error) {
    console.error("Get account error: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving account details."
    })
  }
}

/* ***************************
 *  Update User Account Details
 *  PUT /account/update
 *  Protected Route (requires valid JWT)
 *  
 *  Updates user firstname, lastname, and/or email
 *  Password updates are NOT handled here (use /account/update-password)
 *  
 *  Validations:
 *  - Email must be unique (if changed)
 *  - All fields must be non-empty strings
 * ************************** */
accountController.updateUserAccount = async function (req, res, next) {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      })
    }

    const accountId = req.user.accountId
    const { firstname, lastname, email } = req.body

    // If email is being changed, verify it doesn't already exist
    if (email) {
      const currentUser = await accountModel.getUserById(accountId)
      if (currentUser.account_email !== email) {
        const emailExists = await accountModel.checkEmailExists(email)
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Email address is already in use. Please use a different email."
          })
        }
      }
    }

    // Update user account in database
    const updatedUser = await accountModel.updateUserAccount(
      accountId,
      firstname,
      lastname,
      email
    )

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update account. Please try again."
      })
    }

    // Return success response with updated user data
    return res.status(200).json({
      success: true,
      message: "Account updated successfully.",
      user: {
        id: updatedUser.account_id,
        firstname: updatedUser.account_firstname,
        lastname: updatedUser.account_lastname,
        email: updatedUser.account_email
      }
    })

  } catch (error) {
    console.error("Update account error: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred while updating your account."
    })
  }
}

/* ***************************
 *  Update User Password
 *  PUT /account/update-password
 *  Protected Route (requires valid JWT)
 *  
 *  Process:
 *  1. Get current password from user for verification
 *  2. Verify current password is correct
 *  3. Validate new password (min length, format)
 *  4. Hash new password with bcrypt
 *  5. Update password in database
 *  
 *  This is separate from other updates for security best practices
 * ************************** */
accountController.updateUserPassword = async function (req, res, next) {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      })
    }

    const accountId = req.user.accountId
    const { currentPassword, newPassword } = req.body

    // Get user from database to verify current password
    const user = await accountModel.getUserByEmail(req.user.email)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      })
    }

    // Verify current password is correct
    const passwordMatch = await bcrypt.compare(currentPassword, user.account_password)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    const updateSuccess = await accountModel.updateUserPassword(accountId, hashedPassword)

    if (!updateSuccess) {
      return res.status(500).json({
        success: false,
        message: "Failed to update password. Please try again."
      })
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully."
    })

  } catch (error) {
    console.error("Update password error: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred while updating your password."
    })
  }
}

/* ***************************
 *  Logout User
 *  POST /account/logout
 *  
 *  Note: With JWT tokens, logout is client-side
 *  Client simply deletes the token from localStorage/sessionStorage
 *  This endpoint is optional but can be used for logging purposes
 * ************************** */
accountController.logoutUser = async function (req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful. Please delete your token from client storage."
    })
  } catch (error) {
    console.error("Logout error: " + error)
    res.status(500).json({
      success: false,
      message: "An error occurred during logout."
    })
  }
}

/* ***************************
 *  Build Account Detail View
 *  Displays the account detail page with account info loading via API
 * ************************** */
accountController.buildAccountDetailView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./account/account-detail", {
      title: "My Account",
      nav,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = accountController

