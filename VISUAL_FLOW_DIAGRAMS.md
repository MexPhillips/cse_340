# Account Management System - Visual Flow Diagrams

## 1. User Registration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER REGISTRATION                              │
└─────────────────────────────────────────────────────────────────────┘

CLIENT                           SERVER                          DATABASE
  │                                │                                  │
  │  POST /account/register        │                                  │
  │  {username, email, password}   │                                  │
  ├──────────────────────────────>│                                  │
  │                                │                                  │
  │                                │  Validate Input                  │
  │                                │  (email, password strength)      │
  │                                │                                  │
  │                                ├─ Check Email Uniqueness         │
  │                                │                 ┌───────────────>│
  │                                │                 │  SELECT COUNT  │
  │                                │<────────────────┼─ FROM account  │
  │                                │                 │  WHERE email=? │
  │                                │<─────────────────┘                │
  │                                │                                  │
  │                                │  Hash Password (bcrypt)          │
  │                                │  (10 salt rounds)               │
  │                                │                                  │
  │                                ├─ INSERT INTO account            │
  │                                │             ┌───────────────────>│
  │                                │             │  account_firstname,│
  │                                │             │  account_lastname, │
  │                                │             │  account_email,    │
  │                                │             │  account_password  │
  │                                │<────────────┴─────────────────────│
  │                                │                                  │
  │                                │  Generate JWT Token              │
  │                                │  {accountId, email}              │
  │                                │  Expires: 24 hours              │
  │                                │                                  │
  │  201 Created + Token           │                                  │
  │<────────────────────────────────┤                                  │
  │                                │                                  │
  │  Store token in localStorage   │                                  │
  │                                │                                  │

Result: ✅ Account created, JWT token received
```

---

## 2. User Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                                    │
└─────────────────────────────────────────────────────────────────────┘

CLIENT                           SERVER                          DATABASE
  │                                │                                  │
  │  POST /account/login           │                                  │
  │  {email, password}             │                                  │
  ├──────────────────────────────>│                                  │
  │                                │                                  │
  │                                │  Validate Input                  │
  │                                │  (email, password required)      │
  │                                │                                  │
  │                                ├─ SELECT FROM account            │
  │                                │             ┌───────────────────>│
  │                                │             │  WHERE email = ?   │
  │                                │<────────────┼─► (user record)    │
  │                                │             │                   │
  │                                │<────────────┴─────────────────────│
  │                                │                                  │
  │                       Compare Password                            │
  │                   bcrypt.compare(input, stored)                   │
  │                                │                                  │
  │                      ┌─────────┴─────────┐                        │
  │                    Match                 No Match                 │
  │                      │                     │                      │
  │     Generate JWT     │                     │  401 Unauthorized    │
  │                      │                     │                      │
  │  200 OK + Token      │                     │  401 + Error Message │
  │<─────────────────────┤                     ├─────────────────────>│
  │                                            │                      │

Result: ✅ Valid credentials → JWT token | ❌ Invalid → 401 Error
```

---

## 3. Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PROTECTED ROUTE ACCESS                           │
└─────────────────────────────────────────────────────────────────────┘

CLIENT                           SERVER                          DATABASE
  │                                │                                  │
  │  GET /account/                 │                                  │
  │  Authorization: Bearer <TOKEN> │                                  │
  ├──────────────────────────────>│                                  │
  │                                │                                  │
  │                          JWT Middleware                           │
  │                                ├─ Extract Token from Header       │
  │                                │  "Bearer xxxx.yyyy.zzzz"        │
  │                                │                                  │
  │                      ┌─────────┴──────────┐                       │
  │                 Token?              No Token?                     │
  │                   │                    │                          │
  │                   │              401 Unauthorized                 │
  │                   ││                    ├──────────────────────>│
  │                   ││                    │  Send: "Auth required" │
  │                   │                                               │
  │          Verify JWT Signature                                     │
  │          jwt.verify(token, JWT_SECRET)                            │
  │                   │                                               │
  │      ┌────────────┴────────────┐                                  │
  │   Valid                    Invalid/Expired                        │
  │     │                          │                                  │
  │     │                  401 Unauthorized                           │
  │     │                    ├──────────────────────────────────────>│
  │     │                    │  Send: "Token invalid or expired"     │
  │     │                                                             │
  │   Decode Token                                                    │
  │   Extract: accountId, email                                       │
  │   Attach to req.user                                              │
  │     │                                                             │
  │   Call Controller                                                 │
  │   accountController.getUserAccount()                              │
  │     │                        │                                    │
  │     │                   SELECT FROM account                       │
  │     │                        │  ┌─────────────────────────────>│
  │     │                        │  │  WHERE account_id = ?         │
  │     │                        │<─┤  (get user details)           │
  │     │                        │  │                              │
  │     │                        │<─┴──────────────────────────────│
  │     │                        │                                   │
  │  200 OK + User Data          │                                   │
  │<──────────────────────────────┤                                   │
  │  {id, firstname, lastname, email}                                │

Result: ✅ Valid token → User data | ❌ No/Invalid token → 401 Error
```

---

## 4. API Response Status Codes

```
┌──────────────────────────────────────────────────────────────┐
│                    HTTP STATUS CODES                          │
└──────────────────────────────────────────────────────────────┘

SUCCESS RESPONSES:
  200 OK              ✅ Successful GET, PUT requests
  201 Created         ✅ Successful account registration

CLIENT ERROR RESPONSES:
  400 Bad Request     ❌ Invalid input data or validation failed
                         - Missing required fields
                         - Invalid email format
                         - Weak password
                         - Email already exists
                         - Password mismatch

  401 Unauthorized    ❌ Authentication failed
                         - Invalid email/password
                         - Missing JWT token
                         - Invalid/expired token
                         - Authentication required

  404 Not Found       ❌ Resource not found
                         - User account doesn't exist

SERVER ERROR RESPONSES:
  500 Internal Error  ❌ Server-side errors
                         - Database connection error
                         - Unexpected exceptions
                         - Password hashing failure
```

---

## 5. JWT Token Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    JWT TOKEN STRUCTURE                        │
└──────────────────────────────────────────────────────────────┘

Complete JWT Token (3 parts separated by dots):
┌──────────┬──────────┬──────────────┐
│ HEADER   │ PAYLOAD  │ SIGNATURE    │
└──────────┴──────────┴──────────────┘

EXAMPLE TOKEN:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJhY2NvdW50SWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcwMTIwNjAzMywiZXhwIjoxNzAxMjkyNDMzfQ.
a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0

┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "alg": "HS256",     ← Algorithm (HMAC SHA256)             │
│   "typ": "JWT"        ← Type                                │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ PAYLOAD (Claims)                                             │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "accountId": 1,              ← User ID                    │
│   "email": "john@example.com", ← User Email                │
│   "iat": 1701206033,           ← Issued At (timestamp)     │
│   "exp": 1701292433            ← Expires At (24 hrs later) │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SIGNATURE                                                    │
├──────────────────────────────────────────────────────────────┤
│ HMACSHA256(                                                 │
│   base64UrlEncode(header) + "." +                           │
│   base64UrlEncode(payload),                                 │
│   JWT_SECRET                                                │
│ )                                                            │
│                                                              │
│ Used to verify token hasn't been tampered with              │
└──────────────────────────────────────────────────────────────┘

USAGE IN REQUESTS:
┌──────────────────────────────────────────────────────────────┐
│ Authorization: Bearer <token>                               │
│                                                              │
│ Example:                                                     │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
└──────────────────────────────────────────────────────────────┘

TOKEN LIFESPAN:
  Generated: Login successful (24:00:00)
  Expires: 24 hours later
  Validation: Checked on every protected route request
```

---

## 6. Password Hashing with bcrypt

```
┌──────────────────────────────────────────────────────────────┐
│              PASSWORD HASHING WITH BCRYPT                    │
└──────────────────────────────────────────────────────────────┘

REGISTRATION:

┌─────────────────────────────────────────────────────────────┐
│ User enters:  MyPassword123!                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ bcrypt.hash(password, 10)                                   │
│ (10 = salt rounds)                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Generated Hash:                                             │
│ $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86.qvvu5.4m │
│                                                             │
│ $2b    = bcrypt algorithm identifier                       │
│ $10    = salt rounds (10)                                  │
│ $N9qo8uLOickgx2ZMRZoMye = salt (16 bytes, base64 encoded) │
│ IjZAgcg7b3XeKeUxWdeS86.qvvu5.4m = hash                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Stored in database:                                         │
│ account_password = $2b$10$N9qo8...                         │
│                                                             │
│ ⚠️  Original password is NEVER stored!                     │
│ ⚠️  Hash cannot be reversed to get password                │
└─────────────────────────────────────────────────────────────┘

LOGIN:

┌─────────────────────────────────────────────────────────────┐
│ User enters:  MyPassword123!                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Retrieve hash from database:                                │
│ hash = $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3Xe...        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ bcrypt.compare(inputPassword, storedHash)                   │
│                                                             │
│ 1. Extract salt from stored hash                           │
│ 2. Hash input password with same salt                      │
│ 3. Compare hashes                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
          Match                   No Match
            │                       │
      ✅ Login Success      ❌ 401 Unauthorized
```

---

## 7. Database Schema Relationship

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│         public.account              │
├─────────────────────────────────────┤
│ account_id (PK, AUTO)       INTEGER │  ← Unique identifier
│ account_firstname           VARCHAR │  ← User's first name
│ account_lastname            VARCHAR │  ← User's last name
│ account_email (UNIQUE)      VARCHAR │  ← Login email
│ account_password            VARCHAR │  ← Hashed password
│ account_type                 ENUM   │  ← Role (Client/Employee/Admin)
│                                     │
│ Created by: Database initialization │
│ Used by: Account management system  │
└─────────────────────────────────────┘

SAMPLE DATA (DO NOT USE IN PRODUCTION):

INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type)
VALUES (
  'John',
  'Doe',
  'john@example.com',
  '$2b$10$...',  ← Hashed password
  'Client'
);
```

---

## 8. Complete Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────┐
│            COMPLETE REQUEST/RESPONSE CYCLE                   │
└──────────────────────────────────────────────────────────────┘

EXAMPLE: UPDATE ACCOUNT ENDPOINT

CLIENT SENDS:
┌────────────────────────────────────────────────────────────┐
│ PUT /account/update HTTP/1.1                               │
│ Host: localhost:5500                                      │
│ Content-Type: application/json                             │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...     │
│                                                            │
│ {                                                          │
│   "firstname": "Jane",                                    │
│   "lastname": "Smith",                                   │
│   "email": "jane.smith@example.com"                      │
│ }                                                          │
└────────────────────────────────────────────────────────────┘
                        ↓
               SERVER PROCESSING
                        ↓
┌────────────────────────────────────────────────────────────┐
│ 1. Verify JWT in Authorization header                      │
│    ✅ Token valid → Continue                               │
│    ❌ Token invalid → Return 401                           │
│                                                            │
│ 2. Extract accountId from token                            │
│    req.user.accountId = 1                                 │
│                                                            │
│ 3. Validate input data                                     │
│    ✅ All fields valid → Continue                         │
│    ❌ Validation errors → Return 400                      │
│                                                            │
│ 4. Check email uniqueness                                  │
│    ✅ Email available → Continue                          │
│    ❌ Email taken → Return 400                            │
│                                                            │
│ 5. Update database                                         │
│    UPDATE account SET firstname='Jane', ... WHERE id=1     │
│                                                            │
│ 6. Return updated user data                                │
└────────────────────────────────────────────────────────────┘
                        ↓
SERVER RESPONDS:
┌────────────────────────────────────────────────────────────┐
│ HTTP/1.1 200 OK                                            │
│ Content-Type: application/json                             │
│                                                            │
│ {                                                          │
│   "success": true,                                         │
│   "message": "Account updated successfully.",              │
│   "user": {                                                │
│     "id": 1,                                               │
│     "firstname": "Jane",                                  │
│     "lastname": "Smith",                                 │
│     "email": "jane.smith@example.com"                    │
│   }                                                        │
│ }                                                          │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING FLOW                         │
└──────────────────────────────────────────────────────────────┘

REQUEST
  ↓
  ├─ VALIDATION ERROR?
  │  ├─ Yes → 400 Bad Request
  │  │        Return: validation errors array
  │  └─ No → Continue
  │
  ├─ AUTHENTICATION ERROR?
  │  ├─ No token → 401 Unauthorized
  │  │            "Authentication required"
  │  ├─ Invalid token → 401 Unauthorized
  │  │                  "Invalid or expired token"
  │  └─ No → Continue
  │
  ├─ DATABASE ERROR?
  │  ├─ User not found → 404 Not Found
  │  │                   "User not found"
  │  ├─ Email duplicate → 400 Bad Request
  │  │                    "Email already in use"
  │  └─ No → Continue
  │
  ├─ SERVER ERROR?
  │  ├─ Database connection → 500 Internal Error
  │  ├─ Password hashing → 500 Internal Error
  │  ├─ Token generation → 500 Internal Error
  │  └─ No → Continue
  │
  └─ SUCCESS
     200 OK or 201 Created
     Return: success data
```

---

## 10. Security Checklist

```
┌──────────────────────────────────────────────────────────────┐
│                  SECURITY CHECKLIST                          │
└──────────────────────────────────────────────────────────────┘

PASSWORDS:
  ✅ Hashed with bcrypt (salt rounds = 10)
  ✅ Never logged or displayed
  ✅ Strong validation requirements enforced
  ✅ Compared safely with bcrypt.compare()
  ✅ Never stored in plain text

TOKENS:
  ✅ Generated securely with crypto
  ✅ Signed with JWT_SECRET
  ✅ Expires after 24 hours
  ✅ Validated on every protected request
  ✅ Included in Authorization header

INPUT VALIDATION:
  ✅ Email format validated
  ✅ Password strength checked
  ✅ Username length verified
  ✅ Duplicate email prevented
  ✅ SQL injection prevented (parameterized queries)

ENVIRONMENT:
  ✅ Secrets stored in .env file
  ✅ .env not committed to git
  ✅ Different secrets per environment
  ✅ No hardcoded credentials

ERROR HANDLING:
  ✅ Generic error messages (no info leaks)
  ✅ Detailed logs on server
  ✅ Appropriate HTTP status codes
  ✅ No stack traces in responses

DATABASE:
  ✅ Parameterized queries (prevent SQL injection)
  ✅ Unique email constraint
  ✅ Proper data types
  ✅ Connection pooling

API:
  ✅ HTTPS required in production
  ✅ CORS configured if needed
  ✅ Rate limiting recommended
  ✅ Request size limits
```

---

**These diagrams help visualize the system and should aid in understanding the flow and design.**
