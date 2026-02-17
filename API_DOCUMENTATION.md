# API Documentation - Banking System

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

---

## 📋 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER" // Optional: ADMIN, EMPLOYEE, CUSTOMER
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

---

## 👤 User Endpoints

### Get Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

### Get All Users (Admin/Employee Only)

```http
GET /users
Authorization: Bearer <token>
```

---

## 💰 Account Endpoints

### Create Account

```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "account_type": "SAVINGS", // SAVINGS, CHECKING, LOAN
  "currency": "USD" // Optional, defaults to USD
}
```

### Get User Accounts

```http
GET /accounts
Authorization: Bearer <token>
```

### Get Account Details

```http
GET /accounts/:id
Authorization: Bearer <token>
```

---

## 💸 Transaction Endpoints

### Deposit Money

```http
POST /transactions/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 1,
  "amount": 1000,
  "description": "Monthly salary" // Optional
}
```

### Withdraw Money

```http
POST /transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 1,
  "amount": 500,
  "description": "ATM withdrawal" // Optional
}
```

### Transfer Money

```http
POST /transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 200,
  "description": "Payment to friend" // Optional
}
```

### Get Transaction History

```http
GET /transactions?accountId=1
Authorization: Bearer <token>
```

---

## 🏦 Loan Endpoints

### Apply for Loan

```http
POST /loans/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "loan_type": "PERSONAL", // PERSONAL, HOME, VEHICLE, EDUCATION
  "amount": 50000,
  "interest_rate": 8.5,
  "tenure_months": 36
}
```

**Response includes calculated EMI:**

```json
{
  "id": 1,
  "loan_type": "PERSONAL",
  "amount": 50000,
  "interest_rate": 8.5,
  "tenure_months": 36,
  "emi_amount": 1575.45,
  "status": "PENDING"
}
```

### Get User Loans

```http
GET /loans
Authorization: Bearer <token>
```

### Get Loan Details

```http
GET /loans/:id
Authorization: Bearer <token>
```

### Get Repayment Schedule

```http
GET /loans/:id/repayment-schedule
Authorization: Bearer <token>
```

### Approve Loan (Admin/Employee Only)

```http
PUT /loans/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Approved based on credit score" // Optional
}
```

### Reject Loan (Admin/Employee Only)

```http
PUT /loans/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Insufficient income" // Optional
}
```

---

## 📊 Report Endpoints

### Monthly Account Statement

```http
GET /reports/monthly-statement?accountId=1&year=2024&month=1
Authorization: Bearer <token>
```

### Account Summary

```http
GET /reports/account-summary
Authorization: Bearer <token>
```

### Loan Summary

```http
GET /reports/loan-summary
Authorization: Bearer <token>
```

### System Report (Admin Only)

```http
GET /reports/system
Authorization: Bearer <token>
```

---

## 💹 Interest Endpoints

### Apply Interest Manually (Admin Only)

```http
POST /interest/apply
Authorization: Bearer <token>
```

### Get Interest Summary

```http
GET /interest/summary/:accountId
Authorization: Bearer <token>
```

---

## 🔐 Role-Based Access Control

### Role Permissions

**CUSTOMER:**

- Create/view own accounts
- Perform transactions
- Apply for loans
- View own reports

**EMPLOYEE:**

- All customer permissions
- View all users
- Approve/reject loans
- View all loans

**ADMIN:**

- All employee permissions
- Manage users
- Apply interest manually
- View system reports
- Full system access

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

---

## 🔢 EMI Calculation Formula

The system uses the standard EMI formula:

```
EMI = [P x R x (1+R)^N] / [(1+R)^N – 1]

Where:
P = Principal loan amount
R = Monthly interest rate (annual rate / 12 / 100)
N = Tenure in months
```

---

## 📅 Scheduled Jobs

### Monthly Interest Calculation

- **Schedule:** 1st day of every month at midnight
- **Rate:** 4% annual (0.33% monthly) for savings accounts
- **Process:** Automatically credits interest to all savings accounts

---

## 🔒 Security Features

1. **Password Hashing:** bcrypt with salt rounds = 10
2. **JWT Expiration:** 24 hours (configurable)
3. **Rate Limiting:** 10 requests per minute
4. **Input Validation:** class-validator
5. **Role-Based Access Control**
6. **Database Transactions:** For transfer operations

---

## 📝 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
