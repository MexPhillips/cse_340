# Account Management API - Testing Guide

This document provides examples for testing the Account Management API endpoints using curl, Postman, or JavaScript fetch.

## Base URL
```
http://localhost:5500
```

## Quick Start - Testing Endpoints

### 1. Test Registration Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:5500/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Using JavaScript Fetch:**
```javascript
const response = await fetch('http://localhost:5500/account/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'SecurePass123!'
  })
})
const data = await response.json()
console.log(data)
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. You are now logged in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

---

### 2. Test Login Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:5500/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Using JavaScript Fetch:**
```javascript
const response = await fetch('http://localhost:5500/account/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123!'
  })
})
const data = await response.json()
console.log(data.token) // Save this token!
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Store the token for subsequent requests:**
```javascript
localStorage.setItem('authToken', data.token)
```

---

### 3. Test Get Account Details (Protected Route)

**Note:** Replace `YOUR_TOKEN_HERE` with the actual JWT token from login

**Using curl:**
```bash
curl -X GET http://localhost:5500/account/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using JavaScript Fetch:**
```javascript
const token = localStorage.getItem('authToken')
const response = await fetch('http://localhost:5500/account/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const data = await response.json()
console.log(data.user)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com"
  }
}
```

---

### 4. Test Update Account Details (Protected Route)

**Using curl:**
```bash
curl -X PUT http://localhost:5500/account/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com"
  }'
```

**Using JavaScript Fetch:**
```javascript
const token = localStorage.getItem('authToken')
const response = await fetch('http://localhost:5500/account/update', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com'
  })
})
const data = await response.json()
console.log(data)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Account updated successfully.",
  "user": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com"
  }
}
```

---

### 5. Test Update Password (Protected Route)

**Using curl:**
```bash
curl -X PUT http://localhost:5500/account/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'
```

**Using JavaScript Fetch:**
```javascript
const token = localStorage.getItem('authToken')
const response = await fetch('http://localhost:5500/account/update-password', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    currentPassword: 'SecurePass123!',
    newPassword: 'NewSecurePass456!',
    confirmPassword: 'NewSecurePass456!'
  })
})
const data = await response.json()
console.log(data)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

### 6. Test Logout (Protected Route)

**Using curl:**
```bash
curl -X POST http://localhost:5500/account/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using JavaScript Fetch:**
```javascript
const token = localStorage.getItem('authToken')
await fetch('http://localhost:5500/account/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
// Delete token from localStorage
localStorage.removeItem('authToken')
console.log('Logged out!')
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful. Please delete your token from client storage."
}
```

---

## Error Testing

### Test With Invalid Credentials

```bash
curl -X POST http://localhost:5500/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

### Test Without Authentication Token

```bash
curl -X GET http://localhost:5500/account/
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Authentication required. Please log in."
}
```

### Test With Invalid Token

```bash
curl -X GET http://localhost:5500/account/ \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid or expired token. Please log in again."
}
```

### Test With Weak Password

```bash
curl -X POST http://localhost:5500/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "weak"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 8 characters long"
    },
    {
      "msg": "Password must contain at least one uppercase letter"
    },
    {
      "msg": "Password must contain at least one number"
    }
  ]
}
```

---

## Testing Workflow

### Complete User Journey Test

1. **Register new user:**
   ```bash
   # Request registration
   TOKEN=$(curl -s -X POST http://localhost:5500/account/register \
     -H "Content-Type: application/json" \
     -d '{...}' | jq -r '.token')
   ```

2. **Get account details:**
   ```bash
   curl -X GET http://localhost:5500/account/ \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Update account:**
   ```bash
   curl -X PUT http://localhost:5500/account/update \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{...}'
   ```

4. **Change password:**
   ```bash
   curl -X PUT http://localhost:5500/account/update-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{...}'
   ```

5. **Logout:**
   ```bash
   curl -X POST http://localhost:5500/account/logout \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## Using Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Register**
   - Method: POST
   - URL: `http://localhost:5500/account/register`
   - Headers: `Content-Type: application/json`
   - Body: See examples above

2. **Login**
   - Method: POST
   - URL: `http://localhost:5500/account/login`
   - Headers: `Content-Type: application/json`
   - Body: See examples above

3. **Get Account**
   - Method: GET
   - URL: `http://localhost:5500/account/`
   - Headers: `Authorization: Bearer {{token}}`

4. **Update Account**
   - Method: PUT
   - URL: `http://localhost:5500/account/update`
   - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
   - Body: See examples above

5. **Update Password**
   - Method: PUT
   - URL: `http://localhost:5500/account/update-password`
   - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
   - Body: See examples above

### Postman Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:5500`
- `token`: (Will be set after login)

Use `{{base_url}}` and `{{token}}` in your requests.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot POST /account/register` | Check that server is running on port 5500 and routes are properly configured |
| `Invalid token` | Ensure token hasn't expired (24 hours) or token is properly formatted with "Bearer " prefix |
| `Database error` | Check DATABASE_URL in .env and ensure PostgreSQL is running |
| `Password validation failed` | Ensure password meets requirements (8+ chars, uppercase, number, special char) |
| `Email already exists` | Use a different email address for registration |

---

## Performance Testing

Load testing with Apache Bench:

```bash
# Test registration endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p data.json -T application/json http://localhost:5500/account/register
```

---
