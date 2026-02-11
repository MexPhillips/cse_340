# JWT Secret Deployment Fixes - Summary

## Overview

Fixed the Render deployment error: **"Error generating JWT token: secretOrPrivateKey must have a value."**

This error occurs when `JWT_SECRET` environment variable is not set on Render (even though it works locally with `.env`).

---

## Changes Made

### 1. **utilities/auth-middleware.js** - Enhanced generateToken()

**What was wrong:**
- No validation that `JWT_SECRET` exists before using it
- If `JWT_SECRET` is undefined, `jwt.sign()` fails with cryptic error

**What was fixed:**
- Added explicit validation: checks if `process.env.JWT_SECRET` exists and is not empty
- Throws descriptive error: `"JWT_SECRET is not configured in environment variables."`
- Better error logging for debugging

**Code change:**
```javascript
authMiddleware.generateToken = (userId, email) => {
  try {
    // NEW: Validate JWT_SECRET exists
    const secret = process.env.JWT_SECRET
    if (!secret || secret.trim() === '') {
      const errorMsg = 'JWT_SECRET is not configured in environment variables.'
      console.error('Critical Error: ' + errorMsg)
      throw new Error(errorMsg)
    }

    const token = jwt.sign(
      { accountId: userId, email: email },
      secret,
      { expiresIn: "24h" }
    )
    return token
  } catch (error) {
    console.error("Error generating JWT token: " + error.message)
    throw error
  }
}
```

---

### 2. **controllers/accountController.js** - registerUser()

**What was wrong:**
- Direct call to `generateToken()` without try-catch
- If JWT generation fails, response was generic "registration failed"
- User didn't know it was a JWT_SECRET issue

**What was fixed:**
- Wrapped `generateToken()` call in try-catch block
- Returns specific error: `"Server configuration error"`
- Includes `debugError` in development mode showing `'JWT_SECRET not configured'`

**Code change:**
```javascript
// Generate JWT token for the new user
let token
try {
  token = authMiddleware.generateToken(newUser.account_id, newUser.account_email)
} catch (tokenError) {
  console.error("JWT generation failed during registration: " + tokenError.message)
  return res.status(500).json({
    success: false,
    message: "Server configuration error. Please contact support.",
    debugError: process.env.NODE_ENV === 'development' 
      ? 'JWT_SECRET not configured' 
      : undefined
  })
}
```

---

### 3. **controllers/accountController.js** - loginUser()

**What was wrong:**
- Same issue as registration: no try-catch around JWT generation
- User saw vague error message during login failures

**What was fixed:**
- Same as registration: wrapped in try-catch with clear error messages
- Returns specific error: `"Server configuration error"`
- Includes debugging info in development mode

**Code change:**
```javascript
// Credentials are valid, generate JWT token
let token
try {
  token = authMiddleware.generateToken(user.account_id, user.account_email)
} catch (tokenError) {
  console.error("JWT generation failed during login: " + tokenError.message)
  return res.status(500).json({
    success: false,
    message: "Server configuration error. Please contact support.",
    debugError: process.env.NODE_ENV === 'development' 
      ? 'JWT_SECRET not configured' 
      : undefined
  })
}
```

---

### 4. **RENDER_DEPLOYMENT_GUIDE.md** - New File Created

**Purpose:**
- Step-by-step instructions for deploying to Render
- How to set environment variables in Render dashboard
- How to generate strong secrets
- Troubleshooting guide
- Security best practices

**Key sections:**
1. Create Render service
2. Set environment variables (JWT_SECRET, SESSION_SECRET, DATABASE_URL, NODE_ENV)
3. Build/start commands verify
4. Deployment verification
5. Troubleshooting common errors
6. Deployment checklist

---

## How It Works Now

### Local Development (`.env` file)
```
JWT_SECRET=cse340_dev_jwt_secret_key_change_in_production
```
↓ Loaded by dotenv ↓
```
process.env.JWT_SECRET = "cse340_dev_jwt_secret_key_change_in_production"
```
↓ Validated in generateToken() ✓ ↓
```
JWT token generated successfully
```

### Render Deployment (Environment Variables)
```
JWT_SECRET = [your-strong-secret-key] (set in Render dashboard)
```
↓ Available as process.env.JWT_SECRET ↓
```
process.env.JWT_SECRET = "[your-strong-secret-key]"
```
↓ Validated in generateToken() ✓ ↓
```
JWT token generated successfully
```

### If JWT_SECRET Missing on Render
```
process.env.JWT_SECRET = undefined
```
↓ Validation catch ✗ ↓
```
Error: "JWT_SECRET is not configured in environment variables."
Response: 500 "Server configuration error"
Log: "Critical Error: JWT_SECRET is not configured"
```

User sees clear error message and knows to set JWT_SECRET on Render.

---

## Testing Locally

Before deploying, test that errors are handled correctly:

1. **Test with JWT_SECRET in `.env`:**
   ```bash
   npm run dev
   ```
   - Register/login should work ✓

2. **Test without JWT_SECRET (simulate Render issue):**
   - Temporarily comment out `JWT_SECRET` in `.env`
   - Run tests again
   - Should see: `"Critical Error: JWT_SECRET is not configured in environment variables."`
   - Response shows: `"Server configuration error"`
   - This is the error you'd see on Render if JWT_SECRET isn't set

---

## Files Modified

1. ✅ `utilities/auth-middleware.js` - Added JWT_SECRET validation
2. ✅ `controllers/accountController.js` - Added try-catch for registerUser() and loginUser()
3. ✅ `.env` - Already has JWT_SECRET (no change needed)
4. ✅ `server.js` - Already has dotenv configured (no change needed)
5. ✅ `RENDER_DEPLOYMENT_GUIDE.md` - New comprehensive deployment guide

---

## Next Steps for Render Deployment

1. **Generate strong secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Go to Render dashboard:**
   - Your service → Environment
   - Add `JWT_SECRET` with generated value
   - Add `SESSION_SECRET` with generated value
   - Ensure `DATABASE_URL` is set
   - Set `NODE_ENV=production`

3. **Deploy:**
   - Render will auto-deploy on push or click Deploy button
   - Check logs for success: `"app listening on port..."`

4. **Test:**
   - Try register/login on deployed app
   - Should work without JWT errors

---

## Why This Happened

- **Locally:** `.env` file has `JWT_SECRET`, dotenv loads it automatically
- **On Render:** No `.env` file; must set variables in Render dashboard
- **Mistake:** Forgetting to set `JWT_SECRET` in Render → `process.env.JWT_SECRET` is undefined
- **Bug:** Code wasn't validating `JWT_SECRET` before using it → cryptic "secretOrPrivateKey must have a value" error

**Our fix:** Validate JWT_SECRET exists and provide clear error messages.

---

## Reference

- Render docs: https://render.com/docs
- Environment variables: https://render.com/docs/environment-variables
- Node.js dotenv: https://www.npmjs.com/package/dotenv
- JWT.io: https://jwt.io
