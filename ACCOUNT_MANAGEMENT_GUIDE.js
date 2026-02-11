// ======================================
//  ACCOUNT MANAGEMENT SYSTEM - SETUP GUIDE
//  CSE 340 - W05 Assignment
// ======================================

/*
  This file provides step-by-step instructions for:
  1. Setting up the account management system
  2. Using the API endpoints
  3. Understanding the authentication flow
  4. Examples of client-side implementation
*/

// ======================================
// STEP 1: ENVIRONMENT VARIABLES
// ======================================
/*
  Add these to your .env file:

  # JWT Configuration
  JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

  # Session Configuration
  SESSION_SECRET=your_session_secret_key_here

  # Database Configuration (should already exist)
  DATABASE_URL=postgres://username:password@localhost:5432/database_name

  # Server Configuration
  PORT=5500
  NODE_ENV=development

  Security Tips:
  - Use strong, random secrets (minimum 32 characters)
  - Never commit .env file to git
  - Use different secrets for development and production
  - Rotate secrets periodically in production
*/

// ======================================
// STEP 2: INSTALL DEPENDENCIES
// ======================================
/*
  Run in terminal:
  
  pnpm install
  
  This will install:
  - bcryptjs: Password hashing library
  - jsonwebtoken: JWT token generation/verification
  - express-validator: Input validation
  - (and existing dependencies)
*/

// ======================================
// STEP 3: API ENDPOINTS REFERENCE
// ======================================

/*
  ===== REGISTRATION ENDPOINT =====
  
  URL: POST /account/register
  No Authentication Required
  
  Request Body (JSON):
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  
  Validation Rules:
  - username: Required, min 3 chars, max 50 chars
  - email: Required, must be valid email format
  - password: Required, min 8 chars, must contain:
      * At least 1 uppercase letter
      * At least 1 number
      * At least 1 special character (!@#$%^&*)
  
  Success Response (201 Created):
  {
    "success": true,
    "message": "Account created successfully. You are now logged in.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  
  Error Response (400 Bad Request):
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      { "msg": "Password must be at least 8 characters long" }
    ]
  }
*/

/*
  ===== LOGIN ENDPOINT =====
  
  URL: POST /account/login
  No Authentication Required
  
  Request Body (JSON):
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  
  Success Response (200 OK):
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  
  Error Response (401 Unauthorized):
  {
    "success": false,
    "message": "Invalid email or password."
  }
*/

/*
  ===== GET ACCOUNT DETAILS ENDPOINT =====
  
  URL: GET /account/
  Authentication: Required (JWT Token)
  
  Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  Success Response (200 OK):
  {
    "success": true,
    "user": {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    }
  }
  
  Error Response (401 Unauthorized):
  {
    "success": false,
    "message": "Authentication required. Please log in."
  }
*/

/*
  ===== UPDATE ACCOUNT ENDPOINT =====
  
  URL: PUT /account/update
  Authentication: Required (JWT Token)
  
  Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  Request Body (JSON):
  {
    "firstname": "John",
    "lastname": "Smith",
    "email": "john.smith@example.com"
  }
  
  All fields are optional - only send fields you want to update
  
  Success Response (200 OK):
  {
    "success": true,
    "message": "Account updated successfully.",
    "user": {
      "id": 1,
      "firstname": "John",
      "lastname": "Smith",
      "email": "john.smith@example.com"
    }
  }
  
  Error Response (400 Bad Request):
  {
    "success": false,
    "message": "Email address is already in use. Please use a different email."
  }
*/

/*
  ===== UPDATE PASSWORD ENDPOINT =====
  
  URL: PUT /account/update-password
  Authentication: Required (JWT Token)
  
  Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  Request Body (JSON):
  {
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }
  
  New Password Requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
  
  Success Response (200 OK):
  {
    "success": true,
    "message": "Password updated successfully."
  }
  
  Error Response (401 Unauthorized):
  {
    "success": false,
    "message": "Current password is incorrect."
  }
*/

/*
  ===== LOGOUT ENDPOINT =====
  
  URL: POST /account/logout
  Authentication: Required (JWT Token)
  
  Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  Note: With JWT, logout is client-side!
  Client should delete the token from localStorage/sessionStorage
  
  Response (200 OK):
  {
    "success": true,
    "message": "Logout successful. Please delete your token from client storage."
  }
*/

// ======================================
// STEP 4: CLIENT-SIDE IMPLEMENTATION EXAMPLES
// ======================================

/*
  ===== EXAMPLE 1: USER REGISTRATION =====
*/

// Function to register a new user
async function registerUser(username, email, password) {
  try {
    const response = await fetch('/account/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    })

    const data = await response.json()

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.token)
      console.log('Registration successful!')
      console.log('User:', data.user)
      // Redirect to dashboard or home page
      // window.location.href = '/dashboard'
      return data
    } else {
      // Handle errors
      console.error('Registration failed:', data.message)
      console.error('Errors:', data.errors)
      return null
    }
  } catch (error) {
    console.error('Registration error:', error)
    return null
  }
}

/*
  ===== EXAMPLE 2: USER LOGIN =====
*/

// Function to login a user
async function loginUser(email, password) {
  try {
    const response = await fetch('/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })

    const data = await response.json()

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.token)
      console.log('Login successful!')
      return data
    } else {
      console.error('Login failed:', data.message)
      return null
    }
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

/*
  ===== EXAMPLE 3: GET ACCOUNT DETAILS =====
*/

// Function to fetch user account details
async function getAccountDetails() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken')

    if (!token) {
      console.error('No authentication token found')
      return null
    }

    const response = await fetch('/account/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (data.success) {
      console.log('Account details:', data.user)
      return data.user
    } else {
      console.error('Failed to get account details:', data.message)
      return null
    }
  } catch (error) {
    console.error('Error fetching account details:', error)
    return null
  }
}

/*
  ===== EXAMPLE 4: UPDATE ACCOUNT DETAILS =====
*/

// Function to update user account information
async function updateAccount(firstname, lastname, email) {
  try {
    const token = localStorage.getItem('authToken')

    if (!token) {
      console.error('No authentication token found')
      return null
    }

    const response = await fetch('/account/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        email: email
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('Account updated:', data.user)
      return data.user
    } else {
      console.error('Update failed:', data.message)
      return null
    }
  } catch (error) {
    console.error('Update error:', error)
    return null
  }
}

/*
  ===== EXAMPLE 5: UPDATE PASSWORD =====
*/

// Function to change user password
async function updatePassword(currentPassword, newPassword, confirmPassword) {
  try {
    const token = localStorage.getItem('authToken')

    if (!token) {
      console.error('No authentication token found')
      return false
    }

    const response = await fetch('/account/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('Password updated successfully!')
      return true
    } else {
      console.error('Password update failed:', data.message)
      return false
    }
  } catch (error) {
    console.error('Update error:', error)
    return false
  }
}

/*
  ===== EXAMPLE 6: LOGOUT =====
*/

// Function to logout user
async function logoutUser() {
  try {
    const token = localStorage.getItem('authToken')

    if (token) {
      // Call logout endpoint (optional)
      await fetch('/account/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }

    // Delete token from localStorage
    localStorage.removeItem('authToken')
    console.log('Logged out successfully!')
    // Redirect to home page
    // window.location.href = '/'
    return true
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

// ======================================
// STEP 5: SECURITY BEST PRACTICES
// ======================================

/*
  1. TOKEN STORAGE
     - Store JWT in localStorage or sessionStorage
     - Only in browser (not in server-side cookies for JWT)
     - Consider using httpOnly cookies for even better security
  
  2. TOKEN TRANSMISSION
     - Always use HTTPS in production
     - Include token in Authorization header: "Bearer <token>"
     - Never include token in URL parameters
  
  3. PASSWORD SECURITY
     - Enforce minimum password strength
     - Hash passwords with bcrypt (salt rounds = 10)
     - Never log or display passwords
     - Implement password reset mechanism
  
  4. VALIDATION
     - Validate all inputs on client AND server
     - Use whitelisting rather than blacklisting
     - Check email format, password strength, etc.
  
  5. ERROR HANDLING
     - Don't reveal sensitive information in errors
     - Use generic messages for auth failures
     - Log detailed errors on server for debugging
  
  6. RATE LIMITING
     - Implement rate limiting on login/register
     - Prevents brute force attacks
     - Limit failed login attempts
  
  7. CSRF PROTECTION
     - Use CSRF tokens for form submissions
     - Validate origin headers
     - Use SameSite cookie attribute
*/

// ======================================
// STEP 6: ERROR CODES REFERENCE
// ======================================

/*
  200 OK
    - Successful GET, PUT requests for account operations
  
  201 Created
    - Successful account registration
  
  400 Bad Request
    - Invalid input data (validation errors)
    - Missing required fields
    - Email already exists
  
  401 Unauthorized
    - Invalid credentials
    - Invalid or expired JWT token
    - Missing authentication header
  
  404 Not Found
    - User account not found
  
  500 Internal Server Error
    - Server-side errors
    - Database errors
    - Unexpected failures
*/

// ======================================
// STEP 7: TESTING THE SYSTEM
// ======================================

/*
  1. Test Registration
     - Create account with valid data
     - Test password validation rules
     - Test duplicate email prevention
  
  2. Test Login
     - Login with correct credentials
     - Try wrong password
     - Try non-existent email
  
  3. Test Protected Routes
     - Access account endpoint without token
     - Access with invalid token
     - Access with valid token
  
  4. Test Update Functions
     - Update account details
     - Update password
     - Try duplicate email
  
  5. Test Logout
     - Delete token from storage
     - Try accessing protected routes after logout
*/

// ======================================
// PROJECT FILE STRUCTURE
// ======================================

/*
  controllers/
    └─ accountController.js      # Business logic for account operations
  
  models/
    └─ account-model.js          # Database queries for accounts
  
  routes/
    └─ accountRoute.js           # API endpoints and routing
  
  utilities/
    ├─ auth-middleware.js        # JWT verification and token generation
    └─ validation.js             # Input validation rules
  
  views/account/
    ├─ register.ejs              # Registration form view
    └─ login.ejs                 # Login form view
  
  database/
    └─ account-setup.sql         # SQL schema documentation
  
  .env file should contain:
    JWT_SECRET=your_secret_key
    SESSION_SECRET=your_session_secret
    DATABASE_URL=postgres://...
    PORT=5500
*/
