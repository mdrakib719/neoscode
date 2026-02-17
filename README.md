# Banking System - NestJS

A professional banking system built with NestJS, TypeORM, MySQL, and JWT authentication.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-Based Access Control (RBAC)
- 💰 Account Management
- 💸 Transactions (Deposit, Withdraw, Transfer)
- 🏦 Loan Management
- 📊 Interest Calculation Engine
- 📈 Reporting System
- 🔒 Security Features (bcrypt, rate limiting)

## Tech Stack

- **Backend**: NestJS
- **ORM**: TypeORM
- **Database**: MySQL
- **Auth**: JWT + Passport
- **Validation**: class-validator
- **Testing**: Jest

## Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

## API Documentation

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users

- `GET /users/profile` - Get current user profile
- `GET /users` - Get all users (Admin only)

### Accounts

- `POST /accounts` - Create new account
- `GET /accounts` - Get user accounts
- `GET /accounts/:id` - Get account details

### Transactions

- `POST /transactions/deposit` - Deposit money
- `POST /transactions/withdraw` - Withdraw money
- `POST /transactions/transfer` - Transfer money
- `GET /transactions` - Get transaction history

### Loans

- `POST /loans/apply` - Apply for loan
- `GET /loans` - Get user loans
- `PUT /loans/:id/approve` - Approve loan (Admin only)
- `PUT /loans/:id/reject` - Reject loan (Admin only)

### Reports

- `GET /reports/monthly-statement` - Monthly account statement
- `GET /reports/account-summary` - Account summary
- `GET /reports/loan-summary` - Loan summary

## Roles

- **ADMIN**: Full system access
- **EMPLOYEE**: Manage customers, approve loans
- **CUSTOMER**: Manage own accounts

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT
