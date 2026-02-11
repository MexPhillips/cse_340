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
 *  Returns: JWT token string
 * ************************** */
authMiddleware.generateToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        accountId: userId,
        email: email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token valid for 24 hours
    )
    return token
  } catch (error) {
    console.error("Error generating JWT token: " + error)
    throw error
  }
}

module.exports = authMiddleware
