const jwt = require("jsonwebtoken")

const authMiddleware = {}

/* ***************************
 *  Verify JWT Token Middleware
 *  Checks for valid JWT token in Authorization header
 *  Token format: "Bearer <token>"
 *  If valid: adds decoded token data to req.user
 *  If invalid: returns 401 Unauthorized response
 * ************************** */
authMiddleware.verifyJWT = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Get token after "Bearer "

    // If no token provided, return 401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      })
    }

    // Verify the token using JWT_SECRET from environment variables
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token. Please log in again."
        })
      }

      // Token is valid, attach decoded data to request object
      req.user = decoded
      next()
    })
  } catch (error) {
    console.error("JWT verification error: " + error)
    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication."
    })
  }
}

/* ***************************
 *  Generate JWT Token
 *  Creates a JWT token with user information
 *  Expires in 24 hours (86400 seconds)
 *  Validates JWT_SECRET before attempting to sign
 *  Returns: JWT token string
 * ************************** */
authMiddleware.generateToken = (userId, email, accountType = 'Client') => {
  try {
    // Validate that JWT_SECRET is configured
    const secret = process.env.JWT_SECRET
    if (!secret || secret.trim() === '') {
      const errorMsg = 'JWT_SECRET is not configured in environment variables.'
      console.error('Critical Error: ' + errorMsg)
      throw new Error(errorMsg)
    }

    const token = jwt.sign(
      {
        accountId: userId,
        email: email,
        accountType: accountType
      },
      secret,
      { expiresIn: "24h" } // Token valid for 24 hours
    )
    return token
  } catch (error) {
    console.error("Error generating JWT token: " + error.message)
    throw error
  }
}

/* ***************************
 *  Check if User is Admin Middleware
 *  Verifies that authenticated user has 'Admin' account type
 *  Must be used after authentication middleware
 *  If not admin: returns 403 Forbidden response
 * ************************** */
authMiddleware.checkAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated and has accountType
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Check if user is an Admin
    if (req.user.accountType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have permission to perform this action.'
      })
    }

    // User is admin, continue to next middleware/route handler
    next()
  } catch (error) {
    console.error("Admin check error: " + error)
    return res.status(500).json({
      success: false,
      message: "An error occurred during authorization check."
    })
  }
}

module.exports = authMiddleware
