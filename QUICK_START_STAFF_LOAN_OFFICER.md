# Quick Start Guide - Staff & Loan Officer Features

## 🚀 Getting Started

This guide will help you quickly understand how to use the new Bank Staff and Loan Officer features.

---

## 1️⃣ AUTHENTICATION

All endpoints require a JWT token. First, authenticate:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "staff@bank.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": 2,
    "email": "staff@bank.com",
    "role": "EMPLOYEE"
  }
}
```

Use the `access_token` in all subsequent requests as:

```
Authorization: Bearer eyJhbGci...
```

---

## 2️⃣ BANK STAFF OPERATIONS

### Quick Task 1: View All Customers

```bash
curl -X GET http://localhost:3001/api/staff/accounts/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Quick Task 2: Find a Specific Customer

```bash
curl -X GET "http://localhost:3001/api/staff/accounts/customers/search?q=John" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Quick Task 3: View Customer's Account Summary

```bash
curl -X GET http://localhost:3001/api/staff/accounts/customers/1/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "customerId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "totalAccounts": 2,
  "totalBalance": 25000,
  "accounts": [
    {
      "id": 101,
      "accountNumber": "12345678901",
      "type": "SAVINGS",
      "balance": 15000,
      "status": "ACTIVE",
      "isFrozen": false
    }
  ]
}
```

### Quick Task 4: Process a Customer Deposit

Customer comes to the bank and deposits $1,000 in cash:

```bash
curl -X POST http://localhost:3001/api/staff/accounts/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "amount": 1000,
    "reference": "CASH_DEP_001",
    "notes": "Customer deposited at counter"
  }'
```

**Response:**

```json
{
  "id": 501,
  "toAccountId": 101,
  "amount": 1000,
  "type": "DEPOSIT",
  "status": "COMPLETED",
  "createdAt": "2025-02-18T14:30:00Z"
}
```

### Quick Task 5: Process a Customer Withdrawal

Customer withdraws $500 from their account:

```bash
curl -X POST http://localhost:3001/api/staff/accounts/withdraw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "amount": 500,
    "reference": "CASH_WD_001",
    "notes": "Customer withdrawal at counter"
  }'
```

### Quick Task 6: Freeze a Suspicious Account

If suspicious activity is detected:

```bash
curl -X PUT http://localhost:3001/api/staff/accounts/101/freeze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 101,
    "reason": "Suspicious activity detected. Multiple failed login attempts."
  }'
```

### Quick Task 7: View Customer Transaction History

See all transactions across customer's accounts:

```bash
curl -X GET "http://localhost:3001/api/staff/accounts/customers/1/transactions?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3️⃣ LOAN OFFICER OPERATIONS

### Quick Task 1: View Pending Loan Applications

```bash
curl -X GET http://localhost:3001/api/loan-officers/loans/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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
    "remarks": "Verified all docs",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

### Quick Task 2: Review a Specific Loan

```bash
curl -X GET http://localhost:3001/api/loan-officers/loans/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Quick Task 3: View Loan Repayment Schedule

```bash
curl -X GET http://localhost:3001/api/loan-officers/loans/1/repayment-schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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

### Quick Task 4: Approve a Loan Application

After reviewing the documents and schedule:

```bash
curl -X POST http://localhost:3001/api/loan-officers/loans/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "All documents verified. Good credit history. Approved.",
    "recommendedEMI": "2291.50"
  }'
```

**What happens automatically:**

- Loan amount ($50,000) is credited to customer's account
- Loan status changes to APPROVED
- Transaction record is created
- Customer can start EMI payments

### Quick Task 5: Check Dashboard Overview

```bash
curl -X GET http://localhost:3001/api/loan-officers/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
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

### Quick Task 6: Get Overdue Loans List

```bash
curl -X GET http://localhost:3001/api/loan-officers/dashboard/overdue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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

### Quick Task 7: Process an EMI Payment

When a customer pays their EMI:

```bash
curl -X POST http://localhost:3001/api/loan-officers/loans/5/process-payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2291.50,
    "reference": "EMI_PAY_001",
    "notes": "EMI payment received at counter"
  }'
```

### Quick Task 8: Reject a Loan Application

If documents are incomplete:

```bash
curl -X POST http://localhost:3001/api/loan-officers/loans/2/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Income verification documents incomplete. Please provide latest 3 months salary slips.",
    "suggestedAlternatives": "Customer can reapply with complete documents or apply for lower amount"
  }'
```

---

## 🧪 TESTING IN POSTMAN

### Import Collection

1. Open Postman
2. Import `postman_collection.json`
3. Set environment variables:
   - `BASE_URL`: `http://localhost:3001`
   - `TOKEN`: (JWT token from login)

### Pre-built Requests

You'll find folders for:

- Staff Endpoints
- Loan Officer Endpoints
- Sample Requests with sample data

---

## 📱 IMPORTANT NOTES

### For Bank Staff:

- Always verify customer identity before performing transactions
- Use transaction references for tracking
- Add descriptive notes for all operations
- Check daily/monthly limits before processing
- Freeze accounts with suspicious activity immediately

### For Loan Officers:

- Review complete loan details before approving
- Verify all required documents are submitted
- Check customer's credit history
- Monitor EMI collections regularly
- Follow up on overdue loans promptly

### Best Practices:

1. ✅ Always include descriptive notes
2. ✅ Use consistent reference numbers
3. ✅ Verify amounts before processing
4. ✅ Log unusual activities
5. ✅ Follow approval workflows
6. ✅ Track all transactions
7. ✅ Maintain audit trail

---

## 🆘 COMMON SCENARIOS

### Scenario 1: Customer Wants to Deposit Money

```
1. Search customer → /customers/search?q=name
2. Get summary → /customers/:id/summary
3. Process deposit → POST /deposit
4. Confirm transaction → /customers/:id/transactions
```

### Scenario 2: Loan Application Arrives

```
1. Check pending loans → /loans/pending
2. Review loan details → /loans/:id
3. Check schedule → /loans/:id/repayment-schedule
4. Verify documents (external)
5. Approve or reject → POST /loans/:id/approve
```

### Scenario 3: Customer Misses EMI Payment

```
1. Check overdue → /dashboard/overdue
2. Contact customer (external)
3. Process payment → POST /loans/:id/process-payment
4. Update schedule if needed → PUT /loans/:id/repayment-schedule
```

### Scenario 4: Account Security Concern

```
1. Find customer → /customers/search?q=name
2. Get summary → /customers/:id/summary
3. Check transactions → /customers/:id/transactions
4. Freeze account → PUT /accounts/:id/freeze
5. Add remarks → (via customer service)
6. Unfreeze → PUT /accounts/:id/unfreeze (after verification)
```

---

## 📊 RESPONSE CODES

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (missing token)         |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Server Error                         |

---

## 🔐 SECURITY REMINDERS

- Never share your JWT token
- Always use HTTPS in production
- Tokens expire after a period (re-authenticate)
- Sensitive operations require role authorization
- All actions are logged with your staff ID
- Frozen accounts cannot perform transactions
- Password fields are never returned by API

---

## 📞 HELP & TROUBLESHOOTING

### Issue: "Unauthorized" Error

**Solution:** Check if your JWT token is valid and included in the Authorization header

### Issue: "Customer not found"

**Solution:** Verify the customer ID exists. Try searching for the customer first.

### Issue: "Insufficient balance" Error

**Solution:** Check account balance before processing withdrawal/transfer

### Issue: "Loan is not in pending status"

**Solution:** Only pending loans can be approved/rejected. Check loan status first.

### Issue: Server not responding

**Solution:** Ensure server is running on port 3001 with `npm run start:dev`

---

## 📚 MORE INFORMATION

For complete API documentation, see: **STAFF_LOAN_OFFICER_FEATURES.md**

For implementation details, see: **IMPLEMENTATION_SUMMARY.md**

---

**Version:** 1.0.0  
**Last Updated:** February 18, 2025
