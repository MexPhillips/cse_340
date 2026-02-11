const pool = require("../database/")

const accountModel = {}

/* ***************************
 *  Register New User
 *  Inserts a new user account into the database
 *  Expects: username, email, passwordHash
 *  Returns: result object from database
 * ************************** */
accountModel.registerUser = async function(username, email, passwordHash) {
  try {
    const result = await pool.query(
      `INSERT INTO public.account 
       (account_firstname, account_lastname, account_email, account_password)
       VALUES ($1, $2, $3, $4)
       RETURNING account_id, account_firstname, account_email`,
      [username, username, email, passwordHash]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error registering user: " + error)
    throw error
  }
}

/* ***************************
 *  Get User by Email
 *  Retrieves a user record by email address
 *  Used for login authentication
 *  Returns: user object or undefined if not found
 * ************************** */
accountModel.getUserByEmail = async function(email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_email, account_password
       FROM public.account
       WHERE account_email = $1`,
      [email]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error getting user by email: " + error)
    throw error
  }
}

/* ***************************
 *  Get User by ID
 *  Retrieves full user account details by account ID
 *  Returns: user object or undefined if not found
 * ************************** */
accountModel.getUserById = async function(accountId) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email
       FROM public.account
       WHERE account_id = $1`,
      [accountId]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error getting user by ID: " + error)
    throw error
  }
}

/* ***************************
 *  Update User Account
 *  Updates user account details (firstname, lastname, email)
 *  NOTE: Password updates should use a separate function for security
 *  Returns: updated user object
 * ************************** */
accountModel.updateUserAccount = async function(accountId, firstname, lastname, email) {
  try {
    const result = await pool.query(
      `UPDATE public.account
       SET account_firstname = $1,
           account_lastname = $2,
           account_email = $3
       WHERE account_id = $4
       RETURNING account_id, account_firstname, account_lastname, account_email`,
      [firstname, lastname, email, accountId]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error updating user account: " + error)
    throw error
  }
}

/* ***************************
 *  Update User Password
 *  Updates user password with newly hashed password
 *  Should ONLY be called or updates that need password change
 *  Returns: confirmation boolean
 * ************************** */
accountModel.updateUserPassword = async function(accountId, passwordHash) {
  try {
    const result = await pool.query(
      `UPDATE public.account
       SET account_password = $1
       WHERE account_id = $2
       RETURNING account_id`,
      [passwordHash, accountId]
    )
    return result.rows[0] ? true : false
  } catch (error) {
    console.error("Error updating password: " + error)
    throw error
  }
}

/* ***************************
 *  Check Email Exists
 *  Checks if an email address is already registered
 *  Returns: true if email exists, false if not
 * ************************** */
accountModel.checkEmailExists = async function(email) {
  try {
    const result = await pool.query(
      `SELECT account_email FROM public.account WHERE account_email = $1`,
      [email]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error("Error checking email: " + error)
    throw error
  }
}

module.exports = accountModel
