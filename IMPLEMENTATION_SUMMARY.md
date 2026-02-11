# W05 Assignment: Account Management - Implementation Summary

## 📋 Overview

This implementation provides a complete, production-ready Account Management system for your CSE 340 Node.js application with:

- ✅ User Registration with validation and password hashing
- ✅ User Login with JWT token authentication
- ✅ Account Detail viewing (read)
- ✅ Account Information updates
- ✅ Password change functionality
- ✅ JWT-based API authentication
- ✅ Security best practices (bcrypt, environment variables, error handling)
- ✅ Input validation with express-validator
- ✅ Clean, well-documented code with comments

---

## 📁 Files Created & Modified

### New Files Created:

**Controllers:**
- `controllers/accountController.js` - All business logic (registration, login, account operations)

**Models:**
- `models/account-model.js` - Database queries for account operations

**Routes:**
- `routes/accountRoute.js` - API endpoints with validation and authentication middleware

**Utilities:**
- `utilities/auth-middleware.js` - JWT token generation and verification

**Views:**
- `views/account/register.ejs` - Registration form HTML/CSS
- `views/account/login.ejs` - Login form HTML/CSS

**Database:**
- `database/account-setup.sql` - SQL documentation and useful queries

**Documentation:**
- `ACCOUNT_MANAGEMENT_GUIDE.js` - Comprehensive setup guide with code examples
- `API_TESTING_GUIDE.md` - Testing instructions with curl/Postman examples
- `.env.example` - Environment variables template

### Files Modified:

**Dependencies:**
- `package.json` - Added `bcryptjs` and `jsonwebtoken`

**Configuration:**
- `server.js` - Added account routes integration
- `utilities/validation.js` - Added account validation rules

---

## 🔐 Security Features Implemented

1. **Password Security**
   - Passwords hashed with bcryptjs (salt rounds = 10)
   - Never stored as plain text
   - Password requirements enforced: 8+ chars, uppercase, number, special char

2. **JWT Authentication**
   - Tokens generated on successful login
   - Token expiration: 24 hours
   - Used to protect sensitive routes
   - Included in Authorization header

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Username length restrictions
   - Duplicate email checking

4. **Error Handling**
   - Proper HTTP status codes (400, 401, 404, 500)
   - Generic error messages for auth failures
   - Detailed validation error responses

5. **Environment Variables**
   - Secrets stored in `.env` file
   - JWT_SECRET, SESSION_SECRET, DATABASE_URL
   - Never exposed in code

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set:
JWT_SECRET=your_random_secret_key_here
SESSION_SECRET=your_session_secret_key
DATABASE_URL=postgres://user:password@localhost:5432/database
```

### Step 3: Start the Server
```bash
pnpm run dev
```

### Step 4: Test the API
- Visit `http://localhost:5500/account/register` to see registration form
- Visit `http://localhost:5500/account/login` to see login form
- Use curl commands from `API_TESTING_GUIDE.md` to test endpoints

---

## 📚 API Endpoints Reference

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/account/register` | No | Display registration form |
| GET | `/account/login` | No | Display login form |
| POST | `/account/register` | No | Create new account |
| POST | `/account/login` | No | Authenticate and get JWT |
| GET | `/account/` | Yes | Get account details |
| PUT | `/account/update` | Yes | Update name and email |
| PUT | `/account/update-password` | Yes | Change password |
| POST | `/account/logout` | Yes | Client-side logout |

---

## 💡 Key Implementation Details

### 1. Authentication Flow

```
User Registration
    ↓
Input Validation (email, password strength)
    ↓
Check Email Uniqueness
    ↓
Hash Password (bcrypt)
    ↓
Save to Database
    ↓
Generate JWT Token
    ↓
Return Token & User Data
```

### 2. Login Flow

```
User Login
    ↓
Validate Input (email, password)
    ↓
Find User by Email
    ↓
Compare Password (bcrypt.compare)
    ↓
Generate JWT Token
    ↓
Return Token & User Data
```

### 3. Protected Route Flow

```
Client Request with Token
    ↓
Extract Token from Authorization Header
    ↓
Verify JWT Signature
    ↓
Check Token Expiration
    ↓
Decode Token (get userId)
    ↓
Process Request
    ↓
Return Response
```

---

## 📋 Validation Rules

### Registration
- **Username**: Required, 3-50 characters
- **Email**: Required, valid format, unique
- **Password**: Required, 8+ chars, 1 uppercase, 1 number, 1 special char

### Login
- **Email**: Required, valid format
- **Password**: Required

### Account Update
- **Firstname**: Required, 1-50 characters
- **Lastname**: Required, 1-50 characters
- **Email**: Required, valid format, unique (if changed)

### Password Update
- **Current Password**: Required, must be correct
- **New Password**: Required, 8+ chars, 1 uppercase, 1 number, 1 special char
- **Confirm Password**: Must match new password

---

## 📦 Project Structure

```
cse_340/
├── controllers/
│   ├── accountController.js      ← Account operations
│   ├── baseController.js
│   └── inventoryController.js
├── models/
│   ├── account-model.js          ← Account database queries
│   └── inventory-model.js
├── routes/
│   ├── accountRoute.js           ← Account API routes
│   ├── inventoryRoute.js
│   └── pages.js
├── utilities/
│   ├── auth-middleware.js        ← JWT middleware
│   ├── index.js
│   └── validation.js
├── views/account/
│   ├── register.ejs              ← Registration form
│   ├── login.ejs                 ← Login form
│   └── ...
├── database/
│   ├── account-setup.sql         ← SQL documentation
│   └── ...
├── server.js                     ← Main server file
├── package.json                  ← Dependencies
├── .env                          ← Configuration (not in git)
├── .env.example                  ← Template
├── ACCOUNT_MANAGEMENT_GUIDE.js   ← Full documentation
└── API_TESTING_GUIDE.md          ← Testing guide
```

---

## 🧪 Testing

### Manual Testing

1. **Test Registration:**
   - Open `http://localhost:5500/account/register`
   - Fill in form with valid data
   - Should see success message

2. **Test Login:**
   - Open `http://localhost:5500/account/login`
   - Enter registered email and password
   - Should receive JWT token

3. **Test Protected Routes:**
   - Use API token in Authorization header
   - Should access account details
   - Should be able to update info

### Automated Testing
See `API_TESTING_GUIDE.md` for:
- curl command examples
- JavaScript fetch examples
- Postman collection setup
- Error scenario testing

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/cse340

# Server
PORT=5500
NODE_ENV=development

# Security
SESSION_SECRET=generate_strong_random_string_here
JWT_SECRET=generate_strong_random_string_here
```

### Generate Strong Secrets
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module 'bcryptjs'` | Run `pnpm install` |
| `Cannot find database` | Check DATABASE_URL in .env |
| `JWT verify error` | Check JWT_SECRET, ensure token not expired |
| `Email already exists` | Use different email for registration |
| `Password too weak` | Must have 8+ chars, uppercase, number, special char |
| `CORS errors` | Check server headers and client origin |

---

## 📖 Documentation Files

1. **ACCOUNT_MANAGEMENT_GUIDE.js** (This Project)
   - Complete setup instructions
   - API endpoint documentation
   - Code examples for all operations
   - Security best practices
   - Error codes and file structure

2. **API_TESTING_GUIDE.md**
   - curl command examples
   - Postman setup instructions
   - JavaScript fetch examples
   - Error testing scenarios
   - Performance testing notes

3. **.env.example**
   - Environment variable template
   - Security configuration guide
   - How to generate secrets

4. **database/account-setup.sql**
   - Database schema documentation
   - Example queries
   - Troubleshooting queries

---

## 🎓 Learning Outcomes

By studying this implementation, you'll understand:

1. **Authentication & Authorization**
   - JWT token implementation
   - Protected route middleware
   - Session management

2. **Security**
   - Password hashing with bcrypt
   - Input validation
   - Environment variable management
   - Error handling best practices

3. **API Design**
   - RESTful endpoint design
   - HTTP status codes
   - Request/response formats
   - Error responses

4. **Database Integration**
   - SQL queries with parameters
   - Database model pattern
   - Error handling

5. **Code Organization**
   - MVC pattern
   - Separation of concerns
   - Middleware usage
   - Validation layers

---

## 🚀 Next Steps

### Enhancements to Consider

1. **Email Verification**
   - Send confirmation email on registration
   - Verify email before account activation

2. **Password Reset**
   - Implement "Forgot Password" flow
   - Send password reset link via email

3. **Account Roles**
   - Implement role-based access control (Admin, Employee, Client)
   - Authorization checks on protected routes

4. **User Profile**
   - Store additional user information
   - Profile picture upload
   - Preferences/settings

5. **Activity Logging**
   - Log login attempts
   - Track account changes
   - Audit trail

6. **Two-Factor Authentication**
   - SMS or email verification
   - Authenticator app support

7. **Rate Limiting**
   - Limit login attempts
   - Prevent brute force attacks

---

## 📞 Support

For questions about:
- **Code**: See inline comments in each file
- **API**: Check `API_TESTING_GUIDE.md`
- **Setup**: Check `.env.example`
- **Security**: See "Security & Best Practices" in each file
- **Database**: See `database/account-setup.sql`

---

## ✅ Checklist

- [x] User Registration endpoint
- [x] User Login endpoint
- [x] JWT token generation
- [x] Protected account routes
- [x] Get account details
- [x] Update account info
- [x] Change password
- [x] Input validation
- [x] Password hashing
- [x] Error handling
- [x] Environment configuration
- [x] Comprehensive documentation
- [x] Testing guide
- [x] Code comments

---

## 📝 Notes

- All passwords are bcrypt hashed before storage
- JWT tokens expire after 24 hours
- Tokens should be stored in client localStorage
- Always use HTTPS in production
- Keep secrets secure and never commit .env to git
- Test all endpoints before deployment
- Review security checklist before production

---

**Created:** February 11, 2026
**Assignment:** W05 - Account Management
**Status:** ✅ Complete

---
