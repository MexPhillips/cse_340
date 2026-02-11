/* ****************************
 *  Client-Side Authentication Helper
 *  Manages JWT tokens and authenticated API requests
 * **************************** */

/**
 * Get the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
function getAuthToken() {
  return localStorage.getItem('authToken')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token and userData
 */
function isAuthenticated() {
  const token = localStorage.getItem('authToken')
  const userData = localStorage.getItem('userData')
  return !!(token && userData)
}

/**
 * Make an authenticated API request
 * Automatically includes JWT token in Authorization header
 * 
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} Response json
 */
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken()
  
  // If no token, redirect to login
  if (!token) {
    console.warn('No auth token found. Redirecting to login.')
    window.location.href = '/account/login'
    return
  }

  // Set up headers with Authorization
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    // If 401 Unauthorized, token expired - clear storage and redirect
    if (response.status === 401) {
      console.warn('Token expired or invalid. Redirecting to login.')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      window.location.href = '/account/login'
      return
    }

    return await response.json()
  } catch (error) {
    console.error('Authenticated fetch error:', error)
    throw error
  }
}

/**
 * Logout user
 * Clears localStorage and redirects to home
 */
function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userData')
  window.location.href = '/'
}

/**
 * Get user data from localStorage
 * @returns {object|null} User data object or null
 */
function getUserData() {
  const userData = localStorage.getItem('userData')
  return userData ? JSON.parse(userData) : null
}
