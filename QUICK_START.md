# Quick Start Tutorial

This guide will help you get the banking system up and running and test all major features.

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check MySQL status
mysql --version
```

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd /Users/mdrakibhossain/Downloads/github/neoscode
npm install
```

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE banking_system;
exit
```

### Step 3: Configure Environment

```bash
# Copy environment file
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=banking_system

JWT_SECRET=super-secret-change-this
JWT_EXPIRATION=24h
```

### Step 4: Start the Application

```bash
npm run start:dev
```

You should see:

```
🚀 Banking System API running on http://localhost:3000/api
```

---

## Testing the System

### Test 1: Register a Customer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Customer",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Alice Customer",
    "email": "alice@example.com",
    "role": "CUSTOMER"
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Copy the `access_token` from the response!**

### Test 3: Create a Savings Account

```bash
# Replace YOUR_TOKEN with the token from login
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "account_type": "SAVINGS"
  }'
```

**Note the `id` from the response (your account ID)**

### Test 4: Deposit Money

```bash
# Replace YOUR_TOKEN and ACCOUNT_ID
curl -X POST http://localhost:3000/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": ACCOUNT_ID,
    "amount": 5000,
    "description": "Initial deposit"
  }'
```

### Test 5: Check Balance

```bash
curl -X GET http://localhost:3000/api/accounts/ACCOUNT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should see balance: 5000

### Test 6: Withdraw Money

```bash
curl -X POST http://localhost:3000/api/transactions/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": ACCOUNT_ID,
    "amount": 1000,
    "description": "ATM withdrawal"
  }'
```

### Test 7: View Transaction History

```bash
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 8: Apply for a Loan

```bash
curl -X POST http://localhost:3000/api/loans/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "loan_type": "PERSONAL",
    "amount": 50000,
    "interest_rate": 8.5,
    "tenure_months": 36
  }'
```

**Note the calculated EMI in the response!**

### Test 9: Get Loan Repayment Schedule

```bash
curl -X GET http://localhost:3000/api/loans/LOAN_ID/repayment-schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 10: Get Account Summary

```bash
curl -X GET http://localhost:3000/api/reports/account-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing Admin Features

### Create an Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### Login as Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Approve a Loan

```bash
curl -X PUT http://localhost:3000/api/loans/LOAN_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "remarks": "Approved based on good credit history"
  }'
```

### Apply Interest Manually

```bash
curl -X POST http://localhost:3000/api/interest/apply \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get System Report

```bash
curl -X GET http://localhost:3000/api/reports/system \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Testing Transfer Between Accounts

### Create Second Account

```bash
# Register another user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie User",
    "email": "charlie@example.com",
    "password": "password123"
  }'

# Login as Charlie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "charlie@example.com",
    "password": "password123"
  }'

# Create account for Charlie
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CHARLIE_TOKEN" \
  -d '{
    "account_type": "SAVINGS"
  }'
```

### Transfer from Alice to Charlie

```bash
curl -X POST http://localhost:3000/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "fromAccountId": ALICE_ACCOUNT_ID,
    "toAccountId": CHARLIE_ACCOUNT_ID,
    "amount": 500,
    "description": "Payment for services"
  }'
```

---

## Using Postman

1. Import the `postman_collection.json` file
2. Set environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Your JWT token after login
3. Run requests in sequence

---

## Common Issues

### Issue: Cannot connect to database

```
Solution: Check if MySQL is running
sudo service mysql start
```

### Issue: Port 3000 already in use

```
Solution: Change PORT in .env to 3001
```

### Issue: JWT token expired

```
Solution: Login again to get new token
```

---

## Next Steps

1. ✅ Create multiple accounts
2. ✅ Test all transaction types
3. ✅ Apply for different loan types
4. ✅ Generate monthly statements
5. ✅ Test interest calculation
6. ✅ Explore all reports

## Database Check

```bash
# Login to MySQL
mysql -u root -p

# Use database
USE banking_system;

# Check tables
SHOW TABLES;

# View users
SELECT * FROM users;

# View accounts
SELECT * FROM accounts;

# View transactions
SELECT * FROM transactions;

# View loans
SELECT * FROM loans;
```

---

## Success Checklist

- [ ] Application starts successfully
- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Account creation works
- [ ] Deposit money works
- [ ] Withdraw money works
- [ ] Transfer between accounts works
- [ ] Loan application works
- [ ] EMI calculation is correct
- [ ] Loan approval works (Admin)
- [ ] Reports are generated
- [ ] Interest calculation works

**Congratulations! Your banking system is fully operational! 🎉**
