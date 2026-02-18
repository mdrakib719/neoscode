# Bank Staff & Loan Officer Features Documentation

## Overview

This document describes the implemented features for **Bank Staff (Employees)** and **Loan Officers** in the Banking System.

---

## 1. BANK STAFF (EMPLOYEE) - ACCOUNT MANAGEMENT

### Role: EMPLOYEE

Bank Staff members have access to comprehensive customer account management features.

### Base URL

```
/api/staff/accounts
```

---

## 1.1 Customer Management Endpoints

### Get All Customers

**Endpoint:** `GET /api/staff/accounts/customers`

**Description:** Retrieve all active customers
**Role:** EMPLOYEE, ADMIN
**Response:** List of customers with accounts and loans

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "isActive": true,
    "accounts": [...],
    "loans": [...]
  }
]
```

---

### Search Customers

**Endpoint:** `GET /api/staff/accounts/customers/search?q=query`

**Description:** Search customers by name or email
**Parameters:**

- `q` (string): Search query

**Response:** Matching customers

---

### Get Customer Details

**Endpoint:** `GET /api/staff/accounts/customers/:customerId`

**Description:** Get complete details of a specific customer including all accounts and loans
**Parameters:**

- `customerId` (number): Customer ID

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "accounts": [...],
  "loans": [...]
}
```

---

### Get Customer Account Summary

**Endpoint:** `GET /api/staff/accounts/customers/:customerId/summary`

**Description:** Get summary of all customer's accounts (total balance, account count, etc.)
**Parameters:**

- `customerId` (number): Customer ID

**Response:**

```json
{
  "customerId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "totalAccounts": 3,
  "totalBalance": 50000,
  "accounts": [
    {
      "id": 101,
      "accountNumber": "12345678901",
      "type": "SAVINGS",
      "balance": 25000,
      "status": "ACTIVE",
      "isFrozen": false
    }
  ]
}
```

---

### Get Customer's All Accounts

**Endpoint:** `GET /api/staff/accounts/customers/:customerId/all-accounts`

**Description:** Get all accounts for a customer
**Parameters:**

- `customerId` (number): Customer ID

**Response:** Array of customer's accounts

---

## 1.2 Account Operations

### Get Account Details

**Endpoint:** `GET /api/staff/accounts/:accountId/details`

**Description:** Get detailed information about a specific account
**Parameters:**

- `accountId` (number): Account ID

**Response:**

```json
{
  "id": 101,
  "accountNumber": "12345678901",
  "accountType": "SAVINGS",
  "balance": 25000,
  "currency": "USD",
  "isFrozen": false,
  "status": "ACTIVE",
  "dailyWithdrawalLimit": 5000,
  "dailyTransferLimit": 10000,
  "monthlyWithdrawalLimit": 50000
}
```

---

### Update Account Limits

**Endpoint:** `PUT /api/staff/accounts/:accountId/limits`

**Description:** Update daily/monthly withdrawal and transfer limits for an account
**Parameters:**

- `accountId` (number): Account ID

**Request Body:**

```json
{
  "accountId": 101,
  "dailyWithdrawalLimit": 5000,
  "dailyTransferLimit": 10000,
  "monthlyWithdrawalLimit": 50000
}
```

**Response:** Updated account details

---

### Freeze Account

**Endpoint:** `PUT /api/staff/accounts/:accountId/freeze`

**Description:** Freeze a customer's account (disable transactions)
**Parameters:**

- `accountId` (number): Account ID

**Request Body:**

```json
{
  "accountId": 101,
  "reason": "Customer reported unauthorized access"
}
```

**Response:** Frozen account details

---

### Unfreeze Account

**Endpoint:** `PUT /api/staff/accounts/:accountId/unfreeze`

**Description:** Unfreeze a customer's account
**Parameters:**

- `accountId` (number): Account ID

**Response:** Unfrozen account details

---

## 1.3 Transaction Operations

### Perform Deposit (on behalf of customer)

**Endpoint:** `POST /api/staff/accounts/deposit`

**Description:** Staff performs deposit transaction on behalf of customer
**Role:** EMPLOYEE, ADMIN

**Request Body:**

```json
{
  "customerId": 1,
  "amount": 1000,
  "reference": "CASH_DEPOSIT_001",
  "notes": "Customer deposited at counter"
}
```

**Response:** Transaction details

---

### Perform Withdrawal (on behalf of customer)

**Endpoint:** `POST /api/staff/accounts/withdraw`

**Description:** Staff performs withdrawal transaction on behalf of customer
**Role:** EMPLOYEE, ADMIN

**Request Body:**

```json
{
  "customerId": 1,
  "amount": 500,
  "reference": "CASH_WITHDRAWAL_001",
  "notes": "Customer withdrawal at counter"
}
```

**Response:** Transaction details

---

### Perform Transfer (on behalf of customer)

**Endpoint:** `POST /api/staff/accounts/transfer`

**Description:** Staff performs transfer between customer's accounts or to other accounts
**Role:** EMPLOYEE, ADMIN

**Request Body:**

```json
{
  "fromAccountId": 101,
  "toAccountId": 102,
  "amount": 1000,
  "reference": "STAFF_TRANSFER_001",
  "notes": "Transfer to savings account"
}
```

**Response:** Transaction details

---

## 1.4 Transaction History

### Get Customer Transaction History

**Endpoint:** `GET /api/staff/accounts/customers/:customerId/transactions?limit=50`

**Description:** Get all transactions for a customer (across all accounts)
**Parameters:**

- `customerId` (number): Customer ID
- `limit` (number, optional): Number of transactions to retrieve (default: 50)

**Response:** Array of transactions

---

### Get Account Transaction History

**Endpoint:** `GET /api/staff/accounts/:accountId/transactions?limit=50`

**Description:** Get all transactions for a specific account
**Parameters:**

- `accountId` (number): Account ID
- `limit` (number, optional): Number of transactions to retrieve (default: 50)

**Response:** Array of transactions

---

---

## 2. LOAN OFFICERS - LOAN MANAGEMENT

### Role: EMPLOYEE (with LOAN_OFFICER responsibilities)

Loan Officers manage loan applications, approvals, rejections, and repayment monitoring.

### Base URL

```
/api/loan-officers
```

---

## 2.1 Loan Application Review

### Get Pending Loan Applications

**Endpoint:** `GET /api/loan-officers/loans/pending`

**Description:** Get all pending loan applications awaiting review
**Role:** EMPLOYEE, ADMIN

**Response:**

```json
[
  {
    "id": 1,
    "userId": 5,
    "loanType": "PERSONAL",
    "amount": 50000,
    "interestRate": 10.5,
    "tenureMonths": 24,
    "emiAmount": 2291.5,
    "status": "PENDING",
    "createdAt": "2025-02-18T10:30:00Z",
    "user": {
      "id": 5,
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

---

### Get All Loans

**Endpoint:** `GET /api/loan-officers/loans?status=APPROVED&minAmount=10000&maxAmount=100000`

**Description:** Get all loans with optional filtering
**Query Parameters:**

- `status` (string, optional): PENDING, APPROVED, REJECTED, CLOSED
- `customerName` (string, optional): Filter by customer name
- `loanType` (string, optional): PERSONAL, HOME, VEHICLE, EDUCATION
- `minAmount` (number, optional): Minimum loan amount
- `maxAmount` (number, optional): Maximum loan amount
- `daysOld` (number, optional): Loans created in last N days

**Response:** Array of loans matching criteria

---

### Get Specific Loan Details

**Endpoint:** `GET /api/loan-officers/loans/:loanId`

**Description:** Get complete details of a specific loan
**Parameters:**

- `loanId` (number): Loan ID

**Response:** Loan details with customer information

---

## 2.2 Loan Approval/Rejection

### Approve Loan Application

**Endpoint:** `POST /api/loan-officers/loans/:loanId/approve`

**Description:** Approve a pending loan application
**Parameters:**

- `loanId` (number): Loan ID

**Request Body:**

```json
{
  "approvalNotes": "All documents verified. Customer has good credit history.",
  "recommendedEMI": "2500"
}
```

**Response:**

```json
{
  "id": 1,
  "status": "APPROVED",
  "amount": 50000,
  "remarks": "All documents verified. Customer has good credit history.",
  "approvedAt": "2025-02-18T14:30:00Z"
}
```

**Side Effects:**

- Loan amount is credited to customer's primary account
- Loan status changes to APPROVED
- Transaction record is created

---

### Reject Loan Application

**Endpoint:** `POST /api/loan-officers/loans/:loanId/reject`

**Description:** Reject a pending loan application
**Parameters:**

- `loanId` (number): Loan ID

**Request Body:**

```json
{
  "rejectionReason": "Insufficient credit score. Income verification required.",
  "suggestedAlternatives": "Customer can reapply after 6 months with additional documentation"
}
```

**Response:** Updated loan with REJECTED status

---

## 2.3 Repayment Monitoring

### Get Repayment Schedule

**Endpoint:** `GET /api/loan-officers/loans/:loanId/repayment-schedule`

**Description:** Get complete loan repayment schedule with EMI details
**Parameters:**

- `loanId` (number): Loan ID

**Response:**

```json
[
  {
    "installmentNumber": 1,
    "dueDate": "2025-03-18",
    "emiAmount": 2291.5,
    "principal": 1875.25,
    "interest": 416.25,
    "remainingBalance": 48125.75
  },
  {
    "installmentNumber": 2,
    "dueDate": "2025-04-18",
    "emiAmount": 2291.5,
    "principal": 1885.32,
    "interest": 406.18,
    "remainingBalance": 46240.43
  }
]
```

---

### Get Payment History

**Endpoint:** `GET /api/loan-officers/loans/:loanId/payment-history`

**Description:** Get all payments made against the loan
**Parameters:**

- `loanId` (number): Loan ID

**Response:** Array of loan payments

---

### Get Overdue Loans

**Endpoint:** `GET /api/loan-officers/dashboard/overdue`

**Description:** Get all loans with overdue EMI payments
**Role:** EMPLOYEE, ADMIN

**Response:**

```json
[
  {
    "loanId": 5,
    "customerId": 8,
    "customerName": "John Smith",
    "installmentNumber": 3,
    "dueDate": "2025-02-18",
    "amount": 2291.5,
    "daysOverdue": 10
  }
]
```

---

## 2.4 EMI Payment Processing

### Process EMI Payment

**Endpoint:** `POST /api/loan-officers/loans/:loanId/process-payment`

**Description:** Process an EMI payment for a loan
**Parameters:**

- `loanId` (number): Loan ID

**Request Body:**

```json
{
  "amount": 2291.5,
  "reference": "EMI_PAY_001",
  "notes": "EMI payment received at counter"
}
```

**Response:**

```json
{
  "id": 1,
  "loanId": 1,
  "installmentNumber": 1,
  "amountPaid": 2291.5,
  "principalAmount": 1875.25,
  "interestAmount": 416.25,
  "outstandingBalance": 48125.75,
  "paidDate": "2025-02-18",
  "status": "COMPLETED"
}
```

---

### Update Repayment Schedule

**Endpoint:** `PUT /api/loan-officers/loans/:loanId/repayment-schedule`

**Description:** Modify loan tenure and EMI amount (for restructuring)
**Parameters:**

- `loanId` (number): Loan ID

**Request Body:**

```json
{
  "newTenureMonths": 30,
  "newEMIAmount": 1950,
  "reason": "Customer requested tenure extension due to financial hardship"
}
```

**Response:** Updated loan details

---

## 2.5 Loan Management

### Add Remarks to Loan

**Endpoint:** `POST /api/loan-officers/loans/:loanId/remarks`

**Description:** Add internal remarks/notes to a loan application
**Parameters:**

- `loanId` (number): Loan ID

**Request Body:**

```json
{
  "remarks": "Customer called to inquire about approval status. Assured approval within 2 days."
}
```

**Response:** Updated loan with remarks

---

### Search Loans by Customer

**Endpoint:** `GET /api/loan-officers/search/customer?name=John`

**Description:** Search for loans by customer name
**Query Parameters:**

- `name` (string): Customer name (partial match supported)

**Response:** Array of matching loans

---

## 2.6 Dashboard & Monitoring

### Get Loan Monitoring Dashboard

**Endpoint:** `GET /api/loan-officers/dashboard/overview`

**Description:** Get comprehensive loan portfolio overview
**Role:** EMPLOYEE, ADMIN

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

---

### Get Approved Loans

**Endpoint:** `GET /api/loan-officers/loans/approved`

**Description:** Get all approved loans currently active
**Role:** EMPLOYEE, ADMIN

**Response:** Array of approved loans

---

---

## 3. Authentication & Authorization

### Required Headers

All endpoints require JWT authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access

- **EMPLOYEE**: Can perform staff and loan officer operations
- **ADMIN**: Can perform all operations
- **CUSTOMER**: No access to staff/loan officer endpoints

---

## 4. Error Handling

### Common Error Responses

**404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Customer not found",
  "error": "Not Found"
}
```

**400 Bad Request**

```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

**403 Forbidden**

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## 5. Example Workflows

### Workflow 1: Process a Loan Application

1. **Review pending loans**

   ```
   GET /api/loan-officers/loans/pending
   ```

2. **Get detailed loan information**

   ```
   GET /api/loan-officers/loans/1
   ```

3. **Get repayment schedule**

   ```
   GET /api/loan-officers/loans/1/repayment-schedule
   ```

4. **Add remarks**

   ```
   POST /api/loan-officers/loans/1/remarks
   ```

5. **Approve loan**
   ```
   POST /api/loan-officers/loans/1/approve
   ```

The loan amount will be automatically credited to the customer's account.

---

### Workflow 2: Process Customer Deposit

1. **Search/Find customer**

   ```
   GET /api/staff/accounts/customers/search?q=John
   ```

2. **Get customer account summary**

   ```
   GET /api/staff/accounts/customers/1/summary
   ```

3. **Perform deposit**

   ```
   POST /api/staff/accounts/deposit
   ```

4. **Verify transaction**
   ```
   GET /api/staff/accounts/customers/1/transactions
   ```

---

### Workflow 3: Monitor Overdue Loans

1. **Get dashboard overview**

   ```
   GET /api/loan-officers/dashboard/overview
   ```

2. **Get overdue loans**

   ```
   GET /api/loan-officers/dashboard/overdue
   ```

3. **Process EMI payment**

   ```
   POST /api/loan-officers/loans/5/process-payment
   ```

4. **Get updated schedule**
   ```
   GET /api/loan-officers/loans/5/repayment-schedule
   ```

---

## 6. Data Validation

### Deposit/Withdrawal/Transfer Rules

- Amount must be positive
- Account must exist and be active
- Account must not be frozen
- Sufficient balance required for withdrawals/transfers
- Daily/Monthly limits must be respected

### Loan Approval Rules

- Loan must be in PENDING status
- User must have at least one active account
- Loan details must be valid

---

## 7. Security Considerations

- All operations are logged with officer/staff ID
- Sensitive transactions require role authorization
- Account freezing prevents all transactions
- Password excluded from API responses
- JWT tokens required for all endpoints

---

## 8. Module Structure

```
src/
├── staff/
│   ├── dto/
│   │   └── staff-account.dto.ts
│   ├── staff.controller.ts
│   ├── staff.service.ts
│   └── staff.module.ts
└── loan-officers/
    ├── dto/
    │   └── loan-officer.dto.ts
    ├── loan-officers.controller.ts
    ├── loan-officers.service.ts
    └── loan-officers.module.ts
```

---

## 9. Testing the Endpoints

### Using Postman/cURL

**Example: Get Pending Loans**

```bash
curl -X GET http://localhost:3001/api/loan-officers/loans/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example: Approve Loan**

```bash
curl -X POST http://localhost:3001/api/loan-officers/loans/1/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "Approved after verification",
    "recommendedEMI": "2500"
  }'
```

---

Generated: February 18, 2025
