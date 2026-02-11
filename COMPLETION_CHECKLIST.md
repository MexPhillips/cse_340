# W05 Assignment: Account Management - Completion Checklist

Use this checklist to verify that all components are properly implemented and working.

---

## ✅ SETUP & INSTALLATION

- [ ] Cloned repository to local machine
- [ ] Opened project in VS Code
- [ ] Ran `pnpm install` to install dependencies
- [ ] Verified `bcryptjs` and `jsonwebtoken` are in package.json
- [ ] Created `.env` file from `.env.example` template
- [ ] Generated and set JWT_SECRET in .env
- [ ] Generated and set SESSION_SECRET in .env
- [ ] Verified DATABASE_URL is correct in .env
- [ ] Started server with `pnpm run dev`
- [ ] Server running on localhost:5500 without errors

---

## ✅ FILE STRUCTURE VERIFICATION

### Controllers
- [ ] `controllers/accountController.js` exists and has ~400+ lines
- [ ] Contains `buildRegistrationView()` function
- [ ] Contains `buildLoginView()` function
- [ ] Contains `registerUser()` function
- [ ] Contains `loginUser()` function
- [ ] Contains `getUserAccount()` function
- [ ] Contains `updateUserAccount()` function
- [ ] Contains `updateUserPassword()` function
- [ ] Contains `logoutUser()` function
- [ ] All functions are well-commented

### Models
- [ ] `models/account-model.js` exists and has ~150+ lines
- [ ] Contains `registerUser()` function
- [ ] Contains `getUserByEmail()` function
- [ ] Contains `getUserById()` function
- [ ] Contains `updateUserAccount()` function
- [ ] Contains `updateUserPassword()` function
- [ ] Contains `checkEmailExists()` function
- [ ] All database queries have proper error handling

### Routes
- [ ] `routes/accountRoute.js` exists and has ~150+ lines
- [ ] GET `/account/register` - display form
- [ ] GET `/account/login` - display form
- [ ] POST `/account/register` - with validation
- [ ] POST `/account/login` - with validation
- [ ] GET `/account/` - protected route
- [ ] PUT `/account/update` - protected route
- [ ] PUT `/account/update-password` - protected route
- [ ] POST `/account/logout` - protected route

### Utilities
- [ ] `utilities/auth-middleware.js` exists and has ~60+ lines
- [ ] Contains `verifyJWT()` middleware
- [ ] Contains `generateToken()` function
- [ ] JWT middleware properly validates tokens

### Views
- [ ] `views/account/register.ejs` exists with form
- [ ] `views/account/login.ejs` exists with form
- [ ] Registration form has username field
- [ ] Registration form has email field
- [ ] Registration form has password field
- [ ] Login form has email field
- [ ] Login form has password field
- [ ] Forms have proper validation feedback
- [ ] Forms have CSS styling

### Database/Documentation
- [ ] `database/account-setup.sql` exists with documentation
- [ ] `ACCOUNT_MANAGEMENT_GUIDE.js` exists and comprehensive
- [ ] `API_TESTING_GUIDE.md` exists with examples
- [ ] `IMPLEMENTATION_SUMMARY.md` exists
- [ ] `VISUAL_FLOW_DIAGRAMS.md` exists
- [ ] `.env.example` exists with all required variables

### Server Configuration
- [ ] `server.js` imports `accountRoute`
- [ ] `server.js` has `app.use('/account', accountRoutes)`
- [ ] `utilities/validation.js` has account validation rules
- [ ] No errors in server startup

---

## ✅ FEATURE VERIFICATION

### Registration Feature
- [ ] Can access /account/register in browser
- [ ] Registration form displays correctly
- [ ] Can submit form with valid data
- [ ] Password validation enforced (8+ chars, uppercase, number, special char)
- [ ] Email format validation works
- [ ] Username length validation works
- [ ] Duplicate email prevention works
- [ ] Password hashed before storage (not plain text)
- [ ] JWT token generated on successful registration
- [ ] Token received in response

### Login Feature
- [ ] Can access /account/login in browser
- [ ] Login form displays correctly
- [ ] Can login with registered email and password
- [ ] JWT token generated on successful login
- [ ] Invalid password returns 401 error
- [ ] Non-existent email returns 401 error
- [ ] Error message is generic (doesn't reveal which field is wrong)
- [ ] Token received in response

### Account Details Feature (Protected)
- [ ] Can retrieve account details with valid JWT
- [ ] Returns correct user information
- [ ] Returns 401 when token missing
- [ ] Returns 401 when token invalid
- [ ] Returns 401 when token expired
- [ ] Account details response has correct structure

### Update Account Feature (Protected)
- [ ] Can update firstname with valid JWT
- [ ] Can update lastname with valid JWT
- [ ] Can update email with valid JWT
- [ ] Can update multiple fields at once
- [ ] Returns updated user data
- [ ] Prevents duplicate email addresses
- [ ] Returns 400 for invalid email format
- [ ] Returns 401 for missing token

### Update Password Feature (Protected)
- [ ] Can access password update endpoint with valid JWT
- [ ] Current password verification works
- [ ] Returns 401 if current password incorrect
- [ ] New password validation enforced
- [ ] Passwords must match (confirmation check)
- [ ] Password hashed before update
- [ ] Returns 200 on success
- [ ] Returns 400 for weak password

### Logout Feature
- [ ] Can call logout endpoint with valid JWT
- [ ] Returns success response
- [ ] Client-side token deletion works

---

## ✅ SECURITY VERIFICATION

### Password Security
- [ ] Passwords hashed with bcrypt
- [ ] Salt rounds = 10
- [ ] Never logged as plain text
- [ ] Validation enforces: 8+ chars, uppercase, number, special char
- [ ] bcrypt.compare() used for login
- [ ] Old passwords can't be reused (new hash generated)

### JWT Security
- [ ] JWT_SECRET is set in .env (not hardcoded)
- [ ] Tokens expire after 24 hours
- [ ] Token signature verified on protected routes
- [ ] Invalid tokens rejected with 401
- [ ] Expired tokens rejected with 401
- [ ] Token payload contains userId and email

### Input Validation
- [ ] Email format validated (express-validator)
- [ ] Password strength validated
- [ ] Username length validated
- [ ] All inputs trimmed (whitespace removed)
- [ ] SQL injection prevented (parameterized queries)
- [ ] Validation errors returned clearly

### Error Handling
- [ ] 400 for validation errors
- [ ] 401 for auth failures
- [ ] 404 for user not found
- [ ] 500 for server errors
- [ ] No stack traces in error responses
- [ ] Generic error messages (no info leaks)
- [ ] Server logs show detailed errors

### Environment Variables
- [ ] JWT_SECRET in .env
- [ ] SESSION_SECRET in .env
- [ ] DATABASE_URL in .env
- [ ] .env file not in git (check .gitignore)
- [ ] Secrets are strong (32+ characters)
- [ ] No hardcoded secrets in code

---

## ✅ API ENDPOINT TESTING

### Registration Endpoint
- [ ] POST /account/register returns 201 on success
- [ ] Response includes JWT token
- [ ] Response includes user data
- [ ] 400 returned for invalid input
- [ ] 400 returned for weak password
- [ ] 400 returned for duplicate email

### Login Endpoint
- [ ] POST /account/login returns 200 on success
- [ ] Response includes JWT token
- [ ] Response includes user data
- [ ] 401 returned for invalid password
- [ ] 401 returned for non-existent email
- [ ] Error messages are generic

### Get Account Endpoint
- [ ] GET /account/ returns 200 with valid token
- [ ] Returns user details in correct format
- [ ] 401 returned without token
- [ ] 401 returned with invalid token

### Update Account Endpoint
- [ ] PUT /account/update returns 200 on success
- [ ] Returns updated user data
- [ ] 400 returned for invalid email format
- [ ] 400 returned for duplicate email
- [ ] 401 returned without token

### Update Password Endpoint
- [ ] PUT /account/update-password returns 200 on success
- [ ] 400 returned for weak password
- [ ] 401 returned if current password wrong
- [ ] 401 returned without token

### Logout Endpoint
- [ ] POST /account/logout returns 200 with valid token
- [ ] 401 returned without token

---

## ✅ DATABASE VERIFICATION

### Account Table
- [ ] Table exists in PostgreSQL
- [ ] Has account_id (primary key)
- [ ] Has account_firstname
- [ ] Has account_lastname
- [ ] Has account_email
- [ ] Has account_password
- [ ] Has account_type

### Data Integrity
- [ ] New accounts appear in database
- [ ] Email is unique per account
- [ ] Password is hashed (starts with $2b$)
- [ ] account_type defaults to 'Client'
- [ ] Can update account details
- [ ] Can update password

---

## ✅ CODE QUALITY

### Comments & Documentation
- [ ] All functions have comment blocks
- [ ] Complex logic has inline comments
- [ ] Parameters documented in comments
- [ ] Return values documented
- [ ] ACCOUNT_MANAGEMENT_GUIDE.js comprehensive
- [ ] API_TESTING_GUIDE.md complete
- [ ] Code is readable and maintainable

### Code Organization
- [ ] Follows MVC pattern
- [ ] Models handle database
- [ ] Controllers handle business logic
- [ ] Routes handle request routing
- [ ] Middleware handles authentication/validation
- [ ] No hardcoded values (use environment variables)
- [ ] DRY principle followed (no code duplication)

### Error Handling
- [ ] Try/catch blocks used appropriately
- [ ] Database errors logged
- [ ] Validation errors handled
- [ ] Auth errors handled
- [ ] Server errors don't expose internals

---

## ✅ TESTING COVERAGE

### Manual Testing
- [ ] Tested registration with valid data ✓
- [ ] Tested registration with invalid data ✓
- [ ] Tested login with correct password ✓
- [ ] Tested login with wrong password ✓
- [ ] Tested protected routes with token ✓
- [ ] Tested protected routes without token ✓
- [ ] Tested protected routes with invalid token ✓
- [ ] Tested account update ✓
- [ ] Tested password change ✓

### curl/Fetch Testing
- [ ] Tested endpoints with curl commands ✓
- [ ] Tested endpoints with JavaScript fetch ✓
- [ ] Verified response formats ✓
- [ ] Verified status codes ✓

### Edge Cases
- [ ] Tested empty form submission
- [ ] Tested duplicate email registration
- [ ] Tested expired token
- [ ] Tested tampered token
- [ ] Tested concurrent requests
- [ ] Tested large data inputs

---

## ✅ DOCUMENTATION REVIEW

- [ ] README or setup instructions exist
- [ ] API endpoints documented
- [ ] Request/response examples provided
- [ ] Error codes documented
- [ ] Security practices documented
- [ ] Setup steps documented
- [ ] Testing guide provided
- [ ] Troubleshooting guide provided

---

## ✅ DEPLOYMENT PREPARATION

- [ ] All secrets in .env (not hardcoded)
- [ ] .env.example provided for reference
- [ ] Dependencies listed in package.json
- [ ] No console.logs left in production code
- [ ] Error handling covers all cases
- [ ] Database migrations documented
- [ ] Server starts without warnings

---

## ✅ FINAL VERIFICATION

### Before Submission
- [ ] All features working correctly
- [ ] All tests passing
- [ ] Code is clean and well-commented
- [ ] Documentation is complete
- [ ] No console errors in server logs
- [ ] No console errors in browser
- [ ] All endpoints tested
- [ ] Security checklist passed
- [ ] Code ready for review

### Performance Check
- [ ] Server responds quickly
- [ ] No memory leaks
- [ ] Password hashing completes in reasonable time
- [ ] Database queries efficient

### Browser Compatibility
- [ ] Registration form works in Chrome
- [ ] Login form works in Chrome
- [ ] Forms work in Firefox (if accessible)
- [ ] Forms work on mobile (if time permits)

---

## 📝 NOTES & ISSUES

Use this space to track any issues or notes during implementation:

```
Issue: ___________________________________________________
Resolution: ___________________________________________________

Issue: ___________________________________________________
Resolution: ___________________________________________________

Issue: ___________________________________________________
Resolution: ___________________________________________________
```

---

## 🎯 SUBMISSION CHECKLIST

- [ ] All files created and in correct directories
- [ ] All functions implemented and tested
- [ ] Documentation complete and accurate
- [ ] Code commented and readable
- [ ] No security vulnerabilities
- [ ] All endpoints working
- [ ] Database schema verified
- [ ] Environment variables configured
- [ ] Project ready for evaluation
- [ ] Assignment requirements met

---

## 📊 PROGRESS SUMMARY

| Component | Status | Notes |
|-----------|--------|-------|
| Setup & Installation | ⬜ | |
| Controllers | ⬜ | |
| Models | ⬜ | |
| Routes | ⬜ | |
| Views | ⬜ | |
| Utilities | ⬜ | |
| Database | ⬜ | |
| Security | ⬜ | |
| Testing | ⬜ | |
| Documentation | ⬜ | |
| **Overall** | **⬜** | |

Legend: ⬜ Not Started | 🟨 In Progress | 🟩 Complete

---

**Assignment:** W05 - Account Management
**Due Date:** [Your due date]
**Status:** [Your status]
**Last Updated:** [Today's date]

---
