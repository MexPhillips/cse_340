# Render Deployment Guide for CSE 340 App

This guide walks you through deploying your Node.js + Express app to Render.com without JWT errors.

## ✅ Prerequisites

- A Render.com account
- Your project pushed to GitHub/GitLab
- All code changes applied (JWT_SECRET validation, error handling)

---

## 🚀 Step 1: Create a Render Service

1. Log in to [Render.com](https://render.com)
2. Click **+ New** → **Web Service**
3. Connect your GitHub/GitLab repository
4. Select your repository and branch (usually `main` or `master`)

---

## 🔑 Step 2: Set Environment Variables in Render

This is the **most important step** to fix the JWT error.

### Do This:

1. In the Render dashboard, go to **Environment** section
2. Add the following environment variables:

```
NAME: JWT_SECRET
VALUE: (Generate a strong key - see below)

NAME: SESSION_SECRET
VALUE: (Generate a strong key - see below)

NAME: DATABASE_URL
VALUE: (Your PostgreSQL URI from Render)

NAME: NODE_ENV
VALUE: production
```

### Generate Strong Keys:

Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do this **twice** to generate:
- One for `JWT_SECRET`
- One for `SESSION_SECRET`

**Example output:**
```
a7f3d9c2e1b4f8a5c7d9e2f4b6a8c0d1e3f5a7b9c1d3e5f7a9b0c2d4e6f8a0
```

### Copy Database URL:

Your PostgreSQL database URI is already in use locally. On Render:
- If using Render's PostgreSQL: Copy from Render Postgres dashboard
- If using external provider (e.g., render.com hosted): Copy the connection string

---

## 📝 Step 3: Build and Start Commands

In the Render service settings, ensure:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server.js
```

(These should auto-populate from your `package.json`)

---

## 🔍 Step 4: Verify Deployment

1. Click **Deploy** in Render dashboard
2. Wait for build to complete (usually 2-5 minutes)
3. Check the **Logs** tab for any errors
4. Visit your deployed app URL

### Expected Logs When Successful:

```
app listening on port 5500
```

### JWT Error (What We Fixed):

If you see:
```
Error generating JWT token: secretOrPrivateKey must have a value
```

**Solution:** Go back to Step 2 and ensure `JWT_SECRET` is set in Render's Environment Variables.

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET is not configured"

**Cause:** Environment variable not set in Render  
**Fix:** Go to Render → Your Service → Environment → Add `JWT_SECRET`

### Error: "500 Internal Server Error" on login/register

**Cause:** Multiple possible causes (DB, JWT, validation)  
**Fix:** Check Render Logs for detailed error message

**Examples:**
- JWT error → Set `JWT_SECRET` in Render
- DB connection error → Verify `DATABASE_URL` is correct
- Port error → Ensure Render allocated port (auto-selected)

### Error: "Cannot connect to database"

**Cause:** `DATABASE_URL` not set or incorrect  
**Fix:** 
1. Verify your PostgreSQL URI
2. Ensure IP whitelist allows Render's IP
3. Update `DATABASE_URL` in Render Environment

### App deploys but shows blank page

**Cause:** Usually missing database or routes  
**Fix:** 
1. Ensure database is migrated/initialized
2. Check Render logs for 404 errors
3. Verify all routes match your local setup

---

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] All secrets loaded from `process.env` in code
- [ ] `JWT_SECRET` set in Render Environment Variables
- [ ] `SESSION_SECRET` set in Render Environment Variables
- [ ] `DATABASE_URL` set in Render Environment Variables
- [ ] `NODE_ENV` set to `production` in Render
- [ ] `server.js` is entry point and uses correct imports
- [ ] `.gitignore` includes `.env` (don't commit secrets!)
- [ ] `dotenv` is installed in `package.json`
- [ ] All database migrations applied

---

## 🔐 Security Best Practices

1. **Never commit `.env` to git** - Add to `.gitignore`
2. **Use strong secrets** - Minimum 32 characters, use `crypto.randomBytes()`
3. **Rotate secrets periodically** - Update in Render dashboard
4. **Use different secrets for dev/prod** - Don't reuse local secrets
5. **Monitor logs** - Check Render logs regularly for errors

---

## 📞 Support

If you're still experiencing issues:

1. Check Render documentation: [render.com/docs](https://render.com/docs)
2. Review your app logs in Render dashboard
3. Verify all environment variables one more time
4. Check database connectivity and migrations

---

## Quick Reference

**Your app structure:**
- Entry: `server.js`
- Controllers: `controllers/accountController.js`
- Models: `models/account-model.js`
- Routes: `routes/accountRoute.js`
- Environment: Loaded via `require('dotenv').config()` in `server.js`

**Key files updated for deployment:**
- `utilities/auth-middleware.js` - JWT validation and error handling
- `controllers/accountController.js` - Wrapped JWT generation in try-catch
- `.env` - Local development secrets
- `.env.example` - Template for environment variables

---

Happy deploying! 🎉
