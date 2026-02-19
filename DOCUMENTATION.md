# 🏦 Banking System — Complete Documentation

> Single reference for **every feature**, **every workflow**, and **every API call** in the Banking System.  
> Stack: NestJS 10 · React 18 + Vite · MariaDB 10.4 · Redis 7 · JWT + 2FA

---

## 📋 Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Installation & Environment Setup](#3-installation--environment-setup)
4. [Database Setup](#4-database-setup)
5. [Starting the Application](#5-starting-the-application)
6. [Default Test Accounts](#6-default-test-accounts)
7. [Authentication — Register, Login, Logout](#7-authentication--register-login-logout)
8. [Two-Factor Authentication (2FA)](#8-two-factor-authentication-2fa)
9. [Customer Features](#9-customer-features)
   - [9.1 Manage Bank Accounts](#91-manage-bank-accounts)
   - [9.2 Deposit Money](#92-deposit-money)
   - [9.3 Withdraw Money](#93-withdraw-money)
   - [9.4 Transfer Money](#94-transfer-money)
   - [9.5 Beneficiary Management](#95-beneficiary-management)
   - [9.6 Loan Management](#96-loan-management)
   - [9.7 Notifications](#97-notifications)
   - [9.8 Reports & Statements](#98-reports--statements)
10. [Staff / Employee Features](#10-staff--employee-features)
    - [10.1 Customer Management](#101-customer-management)
    - [10.2 Account Operations](#102-account-operations)
    - [10.3 Transaction Operations](#103-transaction-operations)
11. [Loan Officer Features](#11-loan-officer-features)
    - [11.1 Reviewing Loan Applications](#111-reviewing-loan-applications)
    - [11.2 Approve / Reject Loans](#112-approve--reject-loans)
    - [11.3 EMI Payment Processing](#113-emi-payment-processing)
    - [11.4 Dashboard & Monitoring](#114-dashboard--monitoring)
12. [Admin Features](#12-admin-features)
    - [12.1 User Management](#121-user-management)
    - [12.2 Account Control](#122-account-control)
    - [12.3 Loan Operations](#123-loan-operations)
    - [12.4 System Configuration](#124-system-configuration)
    - [12.5 Reports & Audit Logs](#125-reports--audit-logs)
13. [Interest & Penalty Engines](#13-interest--penalty-engines)
14. [JWT Security & Token Blacklist](#14-jwt-security--token-blacklist)
15. [Complete API Reference](#15-complete-api-reference)
16. [Frontend UI Guide](#16-frontend-ui-guide)
17. [Database Schema Quick Reference](#17-database-schema-quick-reference)
18. [Common Issues & Troubleshooting](#18-common-issues--troubleshooting)
19. [Scripts Reference](#19-scripts-reference)

---

## 1. Tech Stack

| Layer                 | Technology                                         |
| --------------------- | -------------------------------------------------- |
| **Backend**           | NestJS 10, TypeORM, Passport, JWT, Speakeasy (2FA) |
| **Frontend**          | React 18, Vite 5, React Router 6, Zustand, Axios   |
| **Database**          | MariaDB 10.4 / MySQL 8 (InnoDB, UTF8MB4)           |
| **Cache / Blacklist** | Redis 7                                            |
| **Email**             | Nodemailer + Handlebars templates                  |
| **PDF Export**        | PDFKit                                             |
| **QR Code**           | qrcode (for 2FA setup)                             |
| **Auth**              | bcrypt (10 rounds), JWT HS256, TOTP 2FA            |
| **Scheduler**         | @nestjs/schedule (Cron jobs)                       |
| **Validation**        | class-validator, class-transformer                 |
| **Rate Limiting**     | @nestjs/throttler — 10 requests / 60 s per IP      |

---

## 2. Prerequisites

| Tool            | Minimum Version | Check Command     |
| --------------- | --------------- | ----------------- |
| Node.js         | 18.x            | `node --version`  |
| npm             | 9.x             | `npm --version`   |
| MySQL / MariaDB | 8.0 / 10.4      | `mysql --version` |
| Redis           | 7.0             | `redis-cli ping`  |

---

## 3. Installation & Environment Setup

### Step 1 — Clone & install dependencies

```bash
git clone https://github.com/your-username/banking-system.git
cd banking-system

# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

### Step 2 — Create the environment file

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```dotenv
# ─── Application ───────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ─── Database ──────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=banking_system

# ─── JWT ───────────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=24h

# ─── Redis (token blacklist) ────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ─── Encryption ────────────────────────────────────────────
ACCOUNT_ENCRYPTION_KEY=your-encryption-key-exactly-32-chars
```

### Step 3 — Start Redis

**macOS:**

```bash
brew install redis
brew services start redis
redis-cli ping   # should return PONG
```

**Ubuntu / Debian:**

```bash
sudo apt-get install redis-server
sudo systemctl start redis
redis-cli ping
```

---

## 4. Database Setup

### Option A — Import the full dump (recommended)

```bash
mysql -u root -p < banking_system.sql
```

This imports all 13 tables, views, stored procedures, default config, and seed users in one shot.

### Option B — Run individual SQL files

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p banking_system < database/admin-schema.sql
mysql -u root -p banking_system < database/procedures.sql
mysql -u root -p banking_system < database/seed.sql
```

### Verify

```sql
USE banking_system;
SHOW TABLES;
SELECT id, name, email, role FROM users;
```

---

## 5. Starting the Application

### One-command start (recommended)

```bash
bash start.sh
```

This script:

1. Verifies MySQL and Redis are running
2. Creates and seeds the database if it does not exist
3. Installs all dependencies if missing
4. Starts the NestJS API on **http://localhost:3001/api**
5. Starts the React frontend on **http://localhost:3000**

### Manual start

```bash
# Terminal 1 — Backend (hot-reload)
npm run start:dev

# Terminal 2 — Frontend
cd client && npm run dev
```

| Service     | URL                       |
| ----------- | ------------------------- |
| Backend API | http://localhost:3001/api |
| Frontend    | http://localhost:3000     |

---

## 6. Default Test Accounts

> All users below have the password **`password123`** (pre-hashed with bcrypt in the SQL dump).

| Role     | Name          | Email                | Notes                  |
| -------- | ------------- | -------------------- | ---------------------- |
| Admin    | admin         | admin@banking.com    | All access             |
| Employee | rakib         | rakib@gmail.com      | Staff + Loan Officer   |
| Customer | Test Customer | customer@banking.com |                        |
| Customer | test          | test@gmail.com       |                        |
| Customer | rakib         | mdrakib789@gmail.com |                        |
| Customer | Bulbul        | bulbul@gmail.com     | **2FA enabled** (TOTP) |

---

## 7. Authentication — Register, Login, Logout

### Base URL

```
http://localhost:3001/api
```

All endpoints except `POST /auth/register` and `POST /auth/login` require a JWT token in the header:

```
Authorization: Bearer <your-token>
```

---

### Register a new user

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 7,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "CUSTOMER"
  }
}
```

> Roles are `CUSTOMER` (default), `EMPLOYEE`, or `ADMIN`. Role assignment is done by Admin after registration.

---

### Login (without 2FA)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "customer@banking.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Test Customer",
    "email": "customer@banking.com",
    "role": "CUSTOMER"
  }
}
```

Copy the `access_token` and use it as `Bearer <token>` in all subsequent requests.

---

### Login (with 2FA enabled)

Step 1 — Send email + password:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "bulbul@gmail.com",
  "password": "password123"
}
```

The response will indicate that a TOTP code is required:

```json
{
  "requires2FA": true,
  "tempToken": "..."
}
```

Step 2 — Submit the 6-digit TOTP code from your authenticator app:

```http
POST /auth/2fa/verify-login
Content-Type: application/json

{
  "tempToken": "...",
  "totpCode": "123456"
}
```

**Response:** Full `access_token` same as regular login.

---

### Logout

```http
POST /auth/logout
Authorization: Bearer <your-token>
```

This immediately **blacklists** the token in Redis so it cannot be reused.

**Response:**

```json
{ "message": "Logged out successfully" }
```

---

## 8. Two-Factor Authentication (2FA)

The system uses **TOTP (Time-based One-Time Password)** — compatible with Google Authenticator, Authy, and any standard TOTP app.

---

### Step 1 — Generate a 2FA secret & QR code

```http
POST /auth/2fa/generate
Authorization: Bearer <your-token>
```

**Response:**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "otpauthUrl": "otpauth://totp/BankingSystem:alice%40example.com?secret=JBSWY3DPEHPK3PXP"
}
```

1. Open Google Authenticator / Authy on your phone.
2. Tap **"+"** → **"Scan QR code"**.
3. Scan the QR code image returned above (the `qrCode` field is a base64 PNG — render it in a browser or use the frontend UI).
4. The app will show a 6-digit code that changes every 30 seconds.

---

### Step 2 — Enable 2FA

After scanning the QR code, confirm with the first TOTP code your app shows:

```http
POST /auth/2fa/enable
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

**Response:**

```json
{ "message": "Two-factor authentication enabled successfully" }
```

From this point, every login requires both your password **and** a 6-digit TOTP code.

---

### Step 3 — Verify a TOTP code (standalone)

Useful for confirming the app is set up correctly without logging in:

```http
POST /auth/2fa/verify
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "totpCode": "654321"
}
```

**Response:**

```json
{ "valid": true }
```

---

### Disable 2FA

```http
POST /auth/2fa/disable
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

**Response:**

```json
{ "message": "Two-factor authentication disabled successfully" }
```

---

### 2FA Quick Summary

| Action               | Endpoint                 | Method | Auth Required |
| -------------------- | ------------------------ | ------ | ------------- |
| Generate QR / secret | `/auth/2fa/generate`     | POST   | Yes           |
| Enable 2FA           | `/auth/2fa/enable`       | POST   | Yes           |
| Disable 2FA          | `/auth/2fa/disable`      | POST   | Yes           |
| Verify code          | `/auth/2fa/verify`       | POST   | Yes           |
| Login with 2FA       | `/auth/2fa/verify-login` | POST   | Temp token    |

---

## 9. Customer Features

> All customer endpoints require `Authorization: Bearer <token>` unless noted.

---

### 9.1 Manage Bank Accounts

#### Create an account

```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "account_type": "SAVINGS",
  "currency": "USD"
}
```

Account types: `SAVINGS`, `CHECKING`, `LOAN`, `FIXED_DEPOSIT`, `RECURRING_DEPOSIT`

**Response:**

```json
{
  "id": 7,
  "accountNumber": "9876543210123",
  "accountType": "SAVINGS",
  "balance": 0,
  "currency": "USD",
  "status": "ACTIVE",
  "isFrozen": false
}
```

#### View all your accounts

```http
GET /accounts
Authorization: Bearer <token>
```

#### View a specific account

```http
GET /accounts/:id
Authorization: Bearer <token>
```

#### Request account deletion

```http
POST /accounts/:id/deletion-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

Admin reviews and approves the deletion request.

---

### 9.2 Deposit Money

> Customers submit a **deposit request**; staff/admin approves it.

#### Submit a deposit request

```http
POST /transactions/deposit-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 7,
  "amount": 5000,
  "description": "Initial deposit"
}
```

#### Check your deposit request status

```http
GET /transactions/deposit-requests
Authorization: Bearer <token>
```

> Once staff approves, the balance is credited and you receive an in-app notification.

---

### 9.3 Withdraw Money

```http
POST /transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 7,
  "amount": 1000,
  "description": "ATM withdrawal"
}
```

**Validations applied:**

- Account must be active and not frozen
- Sufficient balance required
- Daily withdrawal limit (default: $10,000)
- Monthly withdrawal limit (default: $100,000)
- Per-transaction limit (default: $25,000)
- DB-level trigger prevents overdraft

---

### 9.4 Transfer Money

#### Internal transfer (within the system)

```http
POST /transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": 7,
  "toAccountId": 9,
  "amount": 500,
  "description": "Payment for services",
  "transferType": "INTERNAL"
}
```

#### External transfer (to another bank)

```http
POST /transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": 7,
  "amount": 2000,
  "description": "Transfer to savings",
  "transferType": "EXTERNAL",
  "externalBankName": "XYZ Bank",
  "externalAccountNumber": "1234567890",
  "externalBeneficiaryName": "John Doe",
  "externalIfscCode": "XYZ0001234"
}
```

#### View transaction history

```http
GET /transactions
Authorization: Bearer <token>
```

Filter by:

```http
GET /transactions?accountId=7&type=TRANSFER&status=COMPLETED
```

---

### 9.5 Beneficiary Management

Save frequently used transfer targets so you do not have to retype bank details every time.

#### Add a beneficiary

```http
POST /transactions/beneficiaries
Authorization: Bearer <token>
Content-Type: application/json

{
  "beneficiaryName": "John Doe",
  "accountNumber": "1234567890",
  "bankName": "XYZ Bank",
  "ifscCode": "XYZ0001234",
  "notes": "My savings account"
}
```

#### List all beneficiaries

```http
GET /transactions/beneficiaries
Authorization: Bearer <token>
```

#### Update a beneficiary

```http
PUT /transactions/beneficiaries/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated notes"
}
```

#### Delete a beneficiary (soft delete)

```http
DELETE /transactions/beneficiaries/:id
Authorization: Bearer <token>
```

---

### 9.6 Loan Management

#### Apply for a loan

```http
POST /loans/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "loan_type": "PERSONAL",
  "amount": 50000,
  "tenure_months": 36
}
```

Loan types: `PERSONAL`, `HOME`, `VEHICLE`, `EDUCATION`

Interest rates are pulled automatically from `system_config`:

| Type      | Default Rate |
| --------- | ------------ |
| PERSONAL  | 12% p.a.     |
| HOME      | 8% p.a.      |
| VEHICLE   | 10% p.a.     |
| EDUCATION | 6% p.a.      |

**Response includes auto-calculated EMI:**

```json
{
  "id": 4,
  "loanType": "PERSONAL",
  "amount": 50000,
  "interestRate": 12,
  "tenureMonths": 36,
  "emiAmount": 1660.49,
  "status": "PENDING"
}
```

EMI formula: $\text{EMI} = \dfrac{P \times R \times (1+R)^N}{(1+R)^N - 1}$

where $P$ = principal, $R$ = monthly rate, $N$ = tenure months.

#### View your loans

```http
GET /loans
Authorization: Bearer <token>
```

#### View a specific loan

```http
GET /loans/:id
Authorization: Bearer <token>
```

#### View repayment schedule

```http
GET /loans/:id/repayment-schedule
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "installmentNumber": 1,
    "dueDate": "2026-03-18",
    "emiAmount": 1660.49,
    "principal": 1160.49,
    "interest": 500.00,
    "remainingBalance": 48839.51
  },
  ...
]
```

#### Pay an EMI

```http
POST /loans/:id/pay-emi
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 7,
  "amount": 1660.49
}
```

#### View payment history

```http
GET /loans/:id/payment-history
Authorization: Bearer <token>
```

---

### 9.7 Notifications

All key events (loan approval, deposit credited, account frozen, etc.) generate in-app notifications.

#### View all notifications

```http
GET /notifications
Authorization: Bearer <token>
```

#### View only unread

```http
GET /notifications?unreadOnly=true
Authorization: Bearer <token>
```

#### Get unread count (for badge)

```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

#### Mark a single notification as read

```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark all as read

```http
PATCH /notifications/mark-all-read
Authorization: Bearer <token>
```

#### Delete a notification

```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

**Notification types:** `TRANSACTION`, `LOAN`, `ACCOUNT`, `SECURITY`, `GENERAL`

In the frontend, the **bell icon** in the top navigation bar shows a red badge with the unread count (updated every 30 seconds). Click the bell to open the full notifications page.

---

### 9.8 Reports & Statements

#### Monthly account statement

```http
GET /reports/monthly-statement?accountId=7&year=2026&month=2
Authorization: Bearer <token>
```

**Response includes:**

- Opening and closing balance
- All transactions in the period
- Total deposits and withdrawals

#### Download statement as PDF

```http
GET /reports/monthly-statement/pdf?accountId=7&year=2026&month=2
Authorization: Bearer <token>
```

Returns a `.pdf` file attachment.

#### Account summary

```http
GET /reports/account-summary
Authorization: Bearer <token>
```

#### Loan summary

```http
GET /reports/loan-summary
Authorization: Bearer <token>
```

---

## 10. Staff / Employee Features

> Requires `role: EMPLOYEE` or `ADMIN`.  
> Base URL: `/api/staff/accounts`

---

### 10.1 Customer Management

#### List all customers

```http
GET /staff/accounts/customers
Authorization: Bearer <employee-token>
```

#### Search customers by name or email

```http
GET /staff/accounts/customers/search?q=John
Authorization: Bearer <employee-token>
```

#### Get customer details (accounts + loans)

```http
GET /staff/accounts/customers/:customerId
Authorization: Bearer <employee-token>
```

#### Get customer account summary

```http
GET /staff/accounts/customers/:customerId/summary
Authorization: Bearer <employee-token>
```

**Response:**

```json
{
  "customerId": 2,
  "customerName": "Test Customer",
  "customerEmail": "customer@banking.com",
  "totalAccounts": 3,
  "totalBalance": 45000,
  "accounts": [...]
}
```

#### Get all accounts of a customer

```http
GET /staff/accounts/customers/:customerId/all-accounts
Authorization: Bearer <employee-token>
```

#### View customer transaction history

```http
GET /staff/accounts/customers/:customerId/transactions?limit=20
Authorization: Bearer <employee-token>
```

---

### 10.2 Account Operations

#### Get account details

```http
GET /staff/accounts/:accountId/details
Authorization: Bearer <employee-token>
```

#### Update account limits

```http
PUT /staff/accounts/:accountId/limits
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "dailyWithdrawalLimit": 5000,
  "dailyTransferLimit": 20000,
  "monthlyWithdrawalLimit": 80000
}
```

#### Freeze an account

```http
PUT /staff/accounts/:accountId/freeze
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "reason": "Suspicious activity — multiple failed login attempts"
}
```

> A frozen account **cannot** perform any transactions.  
> Customer receives an in-app notification automatically.

#### Unfreeze an account

```http
PUT /staff/accounts/:accountId/unfreeze
Authorization: Bearer <employee-token>
```

> Customer receives an in-app notification automatically.

---

### 10.3 Transaction Operations

Staff can perform transactions **on behalf of** customers (e.g., counter deposits).

#### Counter deposit

```http
POST /staff/accounts/deposit
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "customerId": 2,
  "amount": 3000,
  "reference": "CASH_DEP_001",
  "notes": "Customer deposited at counter"
}
```

#### Counter withdrawal

```http
POST /staff/accounts/withdraw
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "customerId": 2,
  "amount": 1500,
  "reference": "CASH_WD_001",
  "notes": "Customer withdrawal at counter"
}
```

#### Counter transfer

```http
POST /staff/accounts/transfer
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "fromAccountId": 3,
  "toAccountId": 5,
  "amount": 1000,
  "reference": "STAFF_XFER_001",
  "notes": "Transfer to savings"
}
```

#### Approve a customer deposit request

```http
PUT /staff/deposit-requests/:requestId/approve
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "adminRemarks": "Verified cash deposit receipt"
}
```

#### Reject a customer deposit request

```http
PUT /staff/deposit-requests/:requestId/reject
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "adminRemarks": "Receipt does not match amount"
}
```

---

## 11. Loan Officer Features

> Requires `role: EMPLOYEE` or `ADMIN`.  
> Base URL: `/api/loan-officers`

---

### 11.1 Reviewing Loan Applications

#### View all pending applications

```http
GET /loan-officers/loans/pending
Authorization: Bearer <employee-token>
```

#### View all loans (with filters)

```http
GET /loan-officers/loans?status=APPROVED&loanType=HOME&minAmount=100000
Authorization: Bearer <employee-token>
```

Query parameters: `status`, `loanType`, `customerName`, `minAmount`, `maxAmount`, `daysOld`

#### View specific loan details

```http
GET /loan-officers/loans/:loanId
Authorization: Bearer <employee-token>
```

#### View repayment schedule

```http
GET /loan-officers/loans/:loanId/repayment-schedule
Authorization: Bearer <employee-token>
```

#### View payment history

```http
GET /loan-officers/loans/:loanId/payment-history
Authorization: Bearer <employee-token>
```

#### Search loans by customer name

```http
GET /loan-officers/search/customer?name=John
Authorization: Bearer <employee-token>
```

#### Add internal remarks to a loan

```http
POST /loan-officers/loans/:loanId/remarks
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "remarks": "Called customer. All documents verified."
}
```

---

### 11.2 Approve / Reject Loans

#### Approve a loan

```http
POST /loan-officers/loans/:loanId/approve
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "approvalNotes": "Good credit history. All documents verified.",
  "recommendedEMI": "1660.49"
}
```

**What happens automatically:**

- Loan amount is credited to customer's primary account
- Transaction record is created
- Loan status → `APPROVED`
- Customer receives an in-app notification

#### Reject a loan

```http
POST /loan-officers/loans/:loanId/reject
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient income documentation.",
  "suggestedAlternatives": "Reapply with last 3 months of salary slips"
}
```

Customer receives an in-app notification with the reason.

#### Update repayment schedule (loan restructuring)

```http
PUT /loan-officers/loans/:loanId/repayment-schedule
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "newTenureMonths": 48,
  "newEMIAmount": 1280,
  "reason": "Customer requested tenure extension due to financial hardship"
}
```

---

### 11.3 EMI Payment Processing

Process an EMI payment received at the counter:

```http
POST /loan-officers/loans/:loanId/process-payment
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "amount": 1660.49,
  "reference": "EMI_PAY_001",
  "notes": "EMI payment received at counter"
}
```

**Response:**

```json
{
  "id": 1,
  "loanId": 4,
  "installmentNumber": 1,
  "amountPaid": 1660.49,
  "principalAmount": 1160.49,
  "interestAmount": 500.0,
  "penaltyAmount": 0,
  "outstandingBalance": 48839.51,
  "paidDate": "2026-02-19",
  "status": "COMPLETED"
}
```

---

### 11.4 Dashboard & Monitoring

#### Loan portfolio overview

```http
GET /loan-officers/dashboard/overview
Authorization: Bearer <employee-token>
```

**Response:**

```json
{
  "overview": {
    "totalLoans": 150,
    "pendingLoans": 25,
    "approvedLoans": 100,
    "rejectedLoans": 15,
    "closedLoans": 10
  },
  "financial": {
    "totalLent": 5000000,
    "totalRemaining": 3500000,
    "totalPaid": 1500000
  }
}
```

#### Overdue loans

```http
GET /loan-officers/dashboard/overdue
Authorization: Bearer <employee-token>
```

#### All approved active loans

```http
GET /loan-officers/loans/approved
Authorization: Bearer <employee-token>
```

---

## 12. Admin Features

> Requires `role: ADMIN`.  
> Base URL: `/api/admin`

---

### 12.1 User Management

#### Create a bank employee

```http
POST /admin/employees
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Employee",
  "email": "employee@banking.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

#### List all users

```http
GET /admin/users
Authorization: Bearer <admin-token>
```

#### Activate / deactivate a user

```http
PUT /admin/users/:userId/activate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

> Deactivating a user immediately **blacklists all their active tokens** via Redis.

#### Lock a user account (with reason)

```http
PUT /admin/users/:userId/lock
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Multiple failed login attempts"
}
```

#### Unlock a user account

```http
PUT /admin/users/:userId/unlock
Authorization: Bearer <admin-token>
```

#### Reset a user's password

```http
PUT /admin/users/:userId/reset-password
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "newPassword": "new-secure-password"
}
```

#### Assign / change user role

```http
PUT /admin/users/:userId/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "EMPLOYEE"
}
```

---

### 12.2 Account Control

#### Freeze an account

```http
PUT /admin/accounts/:accountId/freeze
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Fraud investigation"
}
```

#### Unfreeze an account

```http
PUT /admin/accounts/:accountId/unfreeze
Authorization: Bearer <admin-token>
```

#### Close an account

```http
PUT /admin/accounts/:accountId/close
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Customer requested closure"
}
```

#### Update account transaction limits

```http
PUT /admin/accounts/:accountId/limits
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "dailyWithdrawalLimit": 5000,
  "dailyTransferLimit": 20000,
  "monthlyWithdrawalLimit": 80000
}
```

#### Reverse a transaction

```http
POST /admin/transactions/:transactionId/reverse
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Duplicate transaction"
}
```

#### Approve / reject account deletion request

```http
PUT /admin/account-deletion-requests/:requestId/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "adminRemarks": "Approved, balance transferred to linked account"
}
```

---

### 12.3 Loan Operations

Admins have the same loan review powers as Loan Officers plus system-level overrides.

```http
PUT /loans/:loanId/approve     # Approve
PUT /loans/:loanId/reject      # Reject
```

#### Waive a loan penalty

```http
POST /admin/loans/:loanId/waive-penalty
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "First-time delay, customer hardship"
}
```

---

### 12.4 System Configuration

#### View current configuration

```http
GET /admin/system-config
Authorization: Bearer <admin-token>
```

#### Update a setting

```http
PUT /admin/system-config/:key
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "value": "8"
}
```

**All configurable keys:**

| Key                                | Default | Description                          |
| ---------------------------------- | ------- | ------------------------------------ |
| `transaction.dailyTransferLimit`   | 50000   | Max daily transfer per account       |
| `transaction.dailyWithdrawalLimit` | 10000   | Max daily withdrawal per account     |
| `transaction.perTransactionLimit`  | 25000   | Max amount per transaction           |
| `fees.transfer`                    | 0       | Transfer fee (currency units)        |
| `fees.withdrawal`                  | 0       | Withdrawal fee                       |
| `fees.monthlyMaintenance`          | 5       | Monthly account maintenance fee      |
| `interest.SAVINGS`                 | 6       | Annual interest rate for savings (%) |
| `interest.CHECKING`                | 0       | Annual interest for checking (%)     |
| `loan.interest.PERSONAL`           | 12      | Personal loan annual rate (%)        |
| `loan.interest.HOME`               | 8       | Home loan annual rate (%)            |
| `loan.interest.VEHICLE`            | 10      | Vehicle loan annual rate (%)         |
| `loan.interest.EDUCATION`          | 6       | Education loan annual rate (%)       |
| `penalty.lateFeePercentage`        | 2       | Late EMI fee (%)                     |
| `penalty.overdraftFee`             | 35      | Overdraft fee (currency units)       |
| `penalty.minimumBalanceFee`        | 10      | Below-minimum-balance fee            |
| `system.defaultCurrency`           | USD     | Default currency                     |
| `system.maintenanceMode`           | false   | Toggle maintenance mode              |

---

### 12.5 Reports & Audit Logs

#### System-wide report

```http
GET /admin/reports/system
Authorization: Bearer <admin-token>
```

Returns total users, accounts, transactions, loan portfolio, balance overview.

#### View audit log

```http
GET /admin/audit-logs
Authorization: Bearer <admin-token>
```

Every admin action is logged with: `user_id`, `action`, `resource`, `resource_id`, `ip_address`, `user_agent`, `timestamp`.

#### Apply interest manually

```http
POST /interest/apply
Authorization: Bearer <admin-token>
```

---

## 13. Interest & Penalty Engines

### Interest Engine

- **Automatic:** Cron job runs on the **1st of every month** at 00:01
- Applies the `interest.SAVINGS` rate (default: **6% p.a.** = 0.5% per month) to all active Savings accounts
- Each interest credit creates a `DEPOSIT` transaction record
- Manual trigger available via `POST /interest/apply` (Admin only)

### Penalty Engine

- **Automatic:** Daily cron checks for loans where the EMI due date has passed and payment not made
- After the **grace period** (default: 5 days), the penalty rate (default: **2% per month**) is applied
- Penalty records are stored in `loan_penalties` table with status `PENDING`
- Once collected during EMI payment, status → `COLLECTED`
- Admin / Staff can waive a penalty with a recorded reason → status → `WAIVED`

---

## 14. JWT Security & Token Blacklist

### How it works

1. Login → server issues a JWT valid for **24 hours**
2. Every request passes through `JwtAuthGuard` which:
   - Validates JWT signature
   - Checks Redis blacklist (`token_blacklist:{sha256(token)}`)
   - Checks user ban (`user_ban:{userId}`)
3. On **logout** → token SHA-256 hash is written to Redis with TTL = remaining token lifetime
4. On **admin deactivate user** → all user tokens are banned via `user_ban:{userId}` key

### Logout (frontend behaviour)

The frontend `AuthService` calls `POST /auth/logout`, waits for the response, then:

- Removes `token` from `localStorage`
- Removes `user` from `localStorage`
- Redirects to `/login`

Even if the backend call fails, local storage is always cleared.

### Verify Redis is working

```bash
redis-cli ping                              # PONG
redis-cli KEYS "token_blacklist:*"          # list blacklisted tokens
redis-cli KEYS "user_ban:*"                 # list banned users
redis-cli TTL "token_blacklist:SOMEHASH"    # seconds remaining
```

---

## 15. Complete API Reference

| Method | Endpoint                                       | Role Required    | Description                          |
| ------ | ---------------------------------------------- | ---------------- | ------------------------------------ |
| POST   | `/auth/register`                               | Public           | Register new user                    |
| POST   | `/auth/login`                                  | Public           | Login, get JWT                       |
| POST   | `/auth/logout`                                 | Any              | Logout, blacklist token              |
| POST   | `/auth/2fa/generate`                           | Any              | Generate 2FA secret + QR code        |
| POST   | `/auth/2fa/enable`                             | Any              | Enable 2FA (confirm with TOTP code)  |
| POST   | `/auth/2fa/disable`                            | Any              | Disable 2FA                          |
| POST   | `/auth/2fa/verify`                             | Any              | Verify a TOTP code                   |
| POST   | `/auth/2fa/verify-login`                       | Temp token       | Complete 2FA login step              |
| GET    | `/users/profile`                               | Any              | Get own profile                      |
| GET    | `/users`                                       | Admin / Employee | List all users                       |
| GET    | `/users/:id`                                   | Admin / Employee | Get user by ID                       |
| PUT    | `/users/:id`                                   | Admin / Owner    | Update user info                     |
| DELETE | `/users/:id`                                   | Admin            | Delete user                          |
| POST   | `/accounts`                                    | Customer         | Create account                       |
| GET    | `/accounts`                                    | Customer         | List own accounts                    |
| GET    | `/accounts/:id`                                | Customer         | Get account details                  |
| POST   | `/accounts/:id/deletion-request`               | Customer         | Request account deletion             |
| POST   | `/transactions/deposit-request`                | Customer         | Submit deposit request               |
| GET    | `/transactions/deposit-requests`               | Customer         | View own deposit requests            |
| POST   | `/transactions/withdraw`                       | Customer         | Withdraw money                       |
| POST   | `/transactions/transfer`                       | Customer         | Transfer money (internal / external) |
| GET    | `/transactions`                                | Customer         | Transaction history + filters        |
| GET    | `/transactions/beneficiaries`                  | Customer         | List saved beneficiaries             |
| POST   | `/transactions/beneficiaries`                  | Customer         | Add beneficiary                      |
| PUT    | `/transactions/beneficiaries/:id`              | Customer         | Update beneficiary                   |
| DELETE | `/transactions/beneficiaries/:id`              | Customer         | Delete beneficiary                   |
| POST   | `/loans/apply`                                 | Customer         | Apply for loan                       |
| GET    | `/loans`                                       | Customer         | List own loans                       |
| GET    | `/loans/:id`                                   | Customer         | Loan details                         |
| GET    | `/loans/:id/repayment-schedule`                | Customer         | Repayment schedule                   |
| GET    | `/loans/:id/payment-history`                   | Customer         | Payment history                      |
| POST   | `/loans/:id/pay-emi`                           | Customer         | Pay EMI instalment                   |
| PUT    | `/loans/:id/approve`                           | Admin / Employee | Approve loan                         |
| PUT    | `/loans/:id/reject`                            | Admin / Employee | Reject loan                          |
| GET    | `/reports/monthly-statement`                   | Customer         | JSON monthly statement               |
| GET    | `/reports/monthly-statement/pdf`               | Customer         | Download PDF statement               |
| GET    | `/reports/account-summary`                     | Customer         | Account overview                     |
| GET    | `/reports/loan-summary`                        | Customer         | Loan overview                        |
| GET    | `/reports/system`                              | Admin            | System-wide report                   |
| POST   | `/interest/apply`                              | Admin            | Manually trigger interest            |
| GET    | `/interest/summary/:accountId`                 | Any              | Interest summary per account         |
| GET    | `/notifications`                               | Customer         | List notifications                   |
| GET    | `/notifications/unread-count`                  | Customer         | Unread badge count                   |
| PATCH  | `/notifications/:id/read`                      | Customer         | Mark one as read                     |
| PATCH  | `/notifications/mark-all-read`                 | Customer         | Mark all as read                     |
| DELETE | `/notifications/:id`                           | Customer         | Delete a notification                |
| GET    | `/staff/accounts/customers`                    | Employee / Admin | List all customers                   |
| GET    | `/staff/accounts/customers/search`             | Employee / Admin | Search customers                     |
| GET    | `/staff/accounts/customers/:id`                | Employee / Admin | Customer detail                      |
| GET    | `/staff/accounts/customers/:id/summary`        | Employee / Admin | Account summary                      |
| GET    | `/staff/accounts/customers/:id/transactions`   | Employee / Admin | Customer transaction history         |
| GET    | `/staff/accounts/:id/details`                  | Employee / Admin | Account details                      |
| PUT    | `/staff/accounts/:id/limits`                   | Employee / Admin | Update account limits                |
| PUT    | `/staff/accounts/:id/freeze`                   | Employee / Admin | Freeze account                       |
| PUT    | `/staff/accounts/:id/unfreeze`                 | Employee / Admin | Unfreeze account                     |
| POST   | `/staff/accounts/deposit`                      | Employee / Admin | Counter deposit                      |
| POST   | `/staff/accounts/withdraw`                     | Employee / Admin | Counter withdrawal                   |
| POST   | `/staff/accounts/transfer`                     | Employee / Admin | Counter transfer                     |
| PUT    | `/staff/deposit-requests/:id/approve`          | Employee / Admin | Approve deposit request              |
| PUT    | `/staff/deposit-requests/:id/reject`           | Employee / Admin | Reject deposit request               |
| GET    | `/loan-officers/loans/pending`                 | Employee / Admin | Pending loan applications            |
| GET    | `/loan-officers/loans`                         | Employee / Admin | All loans (filterable)               |
| GET    | `/loan-officers/loans/:id`                     | Employee / Admin | Loan details                         |
| GET    | `/loan-officers/loans/:id/repayment-schedule`  | Employee / Admin | Repayment schedule                   |
| GET    | `/loan-officers/loans/:id/payment-history`     | Employee / Admin | Payment history                      |
| POST   | `/loan-officers/loans/:id/approve`             | Employee / Admin | Approve loan                         |
| POST   | `/loan-officers/loans/:id/reject`              | Employee / Admin | Reject loan                          |
| POST   | `/loan-officers/loans/:id/process-payment`     | Employee / Admin | Process EMI payment                  |
| PUT    | `/loan-officers/loans/:id/repayment-schedule`  | Employee / Admin | Restructure loan                     |
| POST   | `/loan-officers/loans/:id/remarks`             | Employee / Admin | Add internal remark                  |
| GET    | `/loan-officers/search/customer`               | Employee / Admin | Search loans by customer             |
| GET    | `/loan-officers/dashboard/overview`            | Employee / Admin | Loan portfolio overview              |
| GET    | `/loan-officers/dashboard/overdue`             | Employee / Admin | Overdue loans                        |
| GET    | `/loan-officers/loans/approved`                | Employee / Admin | All approved active loans            |
| POST   | `/admin/employees`                             | Admin            | Create employee account              |
| GET    | `/admin/users`                                 | Admin            | All users                            |
| PUT    | `/admin/users/:id/activate`                    | Admin            | Activate / deactivate user           |
| PUT    | `/admin/users/:id/lock`                        | Admin            | Lock user                            |
| PUT    | `/admin/users/:id/unlock`                      | Admin            | Unlock user                          |
| PUT    | `/admin/users/:id/reset-password`              | Admin            | Reset password                       |
| PUT    | `/admin/users/:id/role`                        | Admin            | Change role                          |
| PUT    | `/admin/accounts/:id/freeze`                   | Admin            | Freeze account                       |
| PUT    | `/admin/accounts/:id/unfreeze`                 | Admin            | Unfreeze account                     |
| PUT    | `/admin/accounts/:id/close`                    | Admin            | Close account                        |
| PUT    | `/admin/accounts/:id/limits`                   | Admin            | Set account limits                   |
| POST   | `/admin/transactions/:id/reverse`              | Admin            | Reverse transaction                  |
| PUT    | `/admin/account-deletion-requests/:id/approve` | Admin            | Approve deletion request             |
| GET    | `/admin/system-config`                         | Admin            | View system config                   |
| PUT    | `/admin/system-config/:key`                    | Admin            | Update config value                  |
| GET    | `/admin/audit-logs`                            | Admin            | View audit logs                      |
| POST   | `/admin/loans/:id/waive-penalty`               | Admin            | Waive loan penalty                   |

---

## 16. Frontend UI Guide

Open **http://localhost:3000** in your browser.

### Page routes

| URL                | Page                          | Access         |
| ------------------ | ----------------------------- | -------------- |
| `/login`           | Login page                    | Public         |
| `/register`        | Register page                 | Public         |
| `/dashboard`       | Overview dashboard            | All roles      |
| `/accounts`        | My accounts                   | Customer       |
| `/accounts/:id`    | Account detail + transactions | Customer       |
| `/transactions`    | Transaction history           | Customer       |
| `/transfer`        | Transfer money                | Customer       |
| `/beneficiaries`   | Manage beneficiaries          | Customer       |
| `/loans`           | My loans                      | Customer       |
| `/loans/:id`       | Loan detail + schedule        | Customer       |
| `/notifications`   | Notification centre           | All roles      |
| `/profile`         | Profile + 2FA settings        | All roles      |
| `/reports`         | Statements + PDF download     | Customer       |
| `/admin/*`         | Admin control panel           | Admin          |
| `/staff/*`         | Staff operations              | Employee/Admin |
| `/loan-officers/*` | Loan officer queue            | Employee/Admin |

### Bell icon (notifications)

The bell icon in the top navigation bar shows a **red badge** with the unread notification count. The count refreshes every 30 seconds automatically. Click the bell to open the `/notifications` page where you can:

- Filter between **All** and **Unread**
- Mark individual notifications as read
- Mark all as read with one click
- Delete notifications

### Enabling 2FA from the UI

1. Go to **Profile** (`/profile`)
2. Locate the **Two-Factor Authentication** section
3. Click **Enable 2FA**
4. Scan the QR code shown using Google Authenticator or Authy
5. Enter the 6-digit code from your app and click **Verify**
6. 2FA is now active — future logins require the code

---

## 17. Database Schema Quick Reference

| Table                       | Key Columns                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `users`                     | `id`, `name`, `email`, `password`, `role`, `isActive`, `isLocked`, `two_factor_enabled`                  |
| `accounts`                  | `id`, `account_number`, `account_type`, `balance`, `isFrozen`, `status`, `dailyWithdrawalLimit`          |
| `account_deletion_requests` | `id`, `account_id`, `user_id`, `balance_at_request`, `status`                                            |
| `beneficiaries`             | `id`, `user_id`, `beneficiary_name`, `account_number`, `bank_name`, `is_active`                          |
| `deposit_requests`          | `id`, `user_id`, `account_id`, `amount`, `status`, `approved_by`                                         |
| `transactions`              | `id`, `type`, `amount`, `status`, `from_account_id`, `to_account_id`, `transfer_type`                    |
| `loans`                     | `id`, `user_id`, `loan_type`, `amount`, `emi_amount`, `remaining_balance`, `paid_installments`, `status` |
| `loan_payments`             | `id`, `loan_id`, `installment_number`, `amount_paid`, `penalty_amount`, `outstanding_balance`            |
| `loan_penalties`            | `id`, `loan_id`, `days_overdue`, `penalty_amount`, `status` (PENDING/COLLECTED/WAIVED)                   |
| `notifications`             | `id`, `user_id`, `type`, `channel`, `title`, `message`, `is_read`                                        |
| `token_blacklist`           | `id`, `token_hash` (SHA-256), `user_id`, `expires_at`                                                    |
| `system_config`             | `id`, `key` (unique), `value`, `category`                                                                |
| `audit_logs`                | `id`, `user_id`, `action`, `resource`, `ip_address`                                                      |

**DB Views for quick reporting:**

- `view_account_summary` — accounts joined with user info
- `view_transaction_summary` — transactions joined with from/to user names
- `view_loan_summary` — loans joined with user + total payable

---

## 18. Common Issues & Troubleshooting

### Cannot connect to the database

```bash
# Check MySQL is running
sudo service mysql start              # Linux
brew services start mysql             # macOS

# Verify credentials in .env match your MySQL setup
# DB_PORT should be 3306 for standard installs
```

### Redis connection refused

```bash
brew services start redis             # macOS
sudo systemctl start redis            # Linux

redis-cli ping                        # must return PONG
```

### Logout not working / token still valid after logout

Redis is required for token blacklisting. Ensure:

1. Redis is running (`redis-cli ping` → PONG)
2. `REDIS_HOST` and `REDIS_PORT` in `.env` are correct
3. Check Redis keys: `redis-cli KEYS "token_blacklist:*"`

### JWT authentication fails on every request

- Check `JWT_SECRET` is set in `.env`
- Ensure the token is not expired (default: 24h)
- If expired, log in again to get a fresh token

### Port 3001 already in use

```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>
```

### Port 3000 already in use (frontend)

```bash
lsof -i :3000
kill -9 <PID>
```

### 2FA code is rejected

- Time sync: TOTP codes are time-based. Ensure your phone and server clocks are in sync.
- Each code is valid for 30 seconds only.
- Make sure you scanned the correct QR code / entered the correct secret.

### Account says "Frozen"

Contact staff or admin to unfreeze:

```http
PUT /staff/accounts/:accountId/unfreeze
```

### Loan in PENDING status for a long time

A Loan Officer or Admin must approve it. Use:

```http
GET /loan-officers/loans/pending
```

### "Insufficient balance" on withdrawal

Check:

1. Current account balance
2. Daily withdrawal limit (`dailyWithdrawalLimit`)
3. Monthly withdrawal limit (`monthlyWithdrawalLimit`)
4. Per-transaction limit (`transaction.perTransactionLimit` in system_config)

---

## 19. Scripts Reference

| Command                            | Description                                     |
| ---------------------------------- | ----------------------------------------------- |
| `bash start.sh`                    | One-command full-stack start                    |
| `npm run start:dev`                | Start backend in development mode (hot-reload)  |
| `npm run start:prod`               | Start backend in production mode                |
| `npm run build`                    | Build backend TypeScript                        |
| `npm run test`                     | Run unit tests                                  |
| `npm run test:e2e`                 | Run end-to-end tests                            |
| `npm run test:cov`                 | Run tests with coverage report                  |
| `cd client && npm run dev`         | Start frontend development server               |
| `node scripts/update-passwords.js` | Re-hash all seed user passwords with bcrypt     |
| `bash run-queries.sh`              | Run sample DB queries for quick data inspection |

### Database quick-check queries

```sql
USE banking_system;

-- All users
SELECT id, name, email, role, isActive, isLocked, two_factor_enabled FROM users;

-- All accounts with balances
SELECT id, account_number, account_type, balance, isFrozen, status FROM accounts;

-- Recent transactions
SELECT id, type, amount, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 20;

-- Pending loans
SELECT id, user_id, loan_type, amount, emi_amount, status FROM loans WHERE status='PENDING';

-- Unread notifications
SELECT id, user_id, type, title, is_read FROM notifications WHERE is_read=0;

-- System config
SELECT `key`, `value`, `description` FROM system_config;

-- Stored procedure examples
CALL sp_get_user_balance(1);
CALL sp_monthly_transaction_stats(2026, 2);
CALL sp_get_pending_loans();
SELECT fn_calculate_emi(50000, 12, 36) AS emi;
SELECT fn_get_account_balance(1) AS balance;
```

---

> Last updated: **February 19, 2026**  
> Backend port: **3001** · Frontend port: **3000** · Database: **banking_system**
