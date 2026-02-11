-- =========================================
--  ACCOUNT MANAGEMENT SYSTEM - SQL SETUP
--  CSE 340 - Assignment 5: Account Management
-- =========================================

-- NOTE: The 'account' table already exists in the database with the following structure:
-- This file documents the account table and provides additional setup if needed

-- ===============================================
-- ACCOUNT TABLE SCHEMA (Already Created)
-- ===============================================
-- 
-- The 'account' table stores user account information with the following columns:
-- 
-- Column                   Type                    Description
-- ===============================================
-- account_id              INTEGER (PK, AUTO)     Unique identifier for each account
-- account_firstname       CHARACTER VARYING       User's first name
-- account_lastname        CHARACTER VARYING       User's last name
-- account_email           CHARACTER VARYING       User's email (used for login)
-- account_password        CHARACTER VARYING       Hashed password (bcrypt hash)
-- account_type            ENUM                    User role (Client, Employee, Admin)
--
-- ===============================================

-- ===============================================
-- VERIFY TABLE EXISTS (RUN THIS TO CHECK)
-- ===============================================
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'account';

-- ===============================================
-- VIEW ACCOUNT TABLE STRUCTURE
-- ===============================================
-- DESCRIBE public.account;
-- OR use:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'account'
-- ORDER BY ordinal_position;

-- ===============================================
-- EXAMPLE: VIEW ALL ACCOUNTS
-- ===============================================
-- SELECT account_id, account_firstname, account_lastname, 
--        account_email, account_type
-- FROM public.account
-- ORDER BY account_id;

-- ===============================================
-- EXAMPLE: FIND ACCOUNT BY EMAIL
-- ===============================================
-- SELECT * FROM public.account 
-- WHERE account_email = 'user@example.com';

-- ===============================================
-- EXAMPLE: UPDATE ACCOUNT DETAILS
-- ===============================================
-- UPDATE public.account
-- SET account_firstname = 'John',
--     account_lastname = 'Doe',
--     account_email = 'newemail@example.com'
-- WHERE account_id = 1;

-- ===============================================
-- EXAMPLE: UPDATE PASSWORD (with new hash)
-- ===============================================
-- UPDATE public.account
-- SET account_password = '$2b$10$...' -- Hashed password from bcrypt
-- WHERE account_id = 1;

-- ===============================================
-- EXAMPLE: CHANGE USER TYPE
-- ===============================================
-- UPDATE public.account
-- SET account_type = 'Admin'
-- WHERE account_id = 1;

-- ===============================================
-- EXAMPLE: DELETE ACCOUNT (CAUTION!)
-- ===============================================
-- DELETE FROM public.account WHERE account_id = 1;

-- ===============================================
-- USEFUL QUERIES FOR TROUBLESHOOTING
-- ===============================================

-- Count total accounts
-- SELECT COUNT(*) as total_accounts FROM public.account;

-- Find duplicate emails (should be none!)
-- SELECT account_email, COUNT(*) 
-- FROM public.account 
-- GROUP BY account_email 
-- HAVING COUNT(*) > 1;

-- Find accounts by type
-- SELECT * FROM public.account WHERE account_type = 'Admin';

-- Find recently created accounts (if timestamps exist)
-- SELECT * FROM public.account ORDER BY account_id DESC LIMIT 10;

-- ===============================================
-- NOTES FOR DEVELOPERS
-- ===============================================
-- 1. Passwords are stored as BCRYPT HASHES in the database
--    - Never store plain-text passwords
--    - Always hash passwords using bcryptjs library (bcrypt.hash())
--    - When verifying, use bcryptjs library (bcrypt.compare())
--    - Salt rounds = 10 (good balance of security and performance)
--
-- 2. Email Validation
--    - Check email format using express-validator
--    - Ensure email is unique before inserting new account
--    - Database constraint: One email per account recommended
--
-- 3. Password Requirements (enforced in application)
--    - Minimum 8 characters
--    - At least 1 uppercase letter
--    - At least 1 number
--    - At least 1 special character
--
-- 4. JWT Tokens
--    - Tokens are generated on successful login
--    - Token contains: accountId and email
--    - Tokens expire in 24 hours
--    - Clients must include token in Authorization header: "Bearer <token>"
--
-- 5. Account Types
--    - Client: Regular user (default)
--    - Employee: Staff member
--    - Admin: Administrator with full access
--
-- ===============================================
