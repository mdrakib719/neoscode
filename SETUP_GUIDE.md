# Development Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation Steps

### 1. Clone and Install Dependencies

```bash
cd neoscode
npm install
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE banking_system;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=banking_system

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
```

### 4. Run the Application

Development mode (with hot reload):

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api`

## Seeding Test Data

You can create test users and data manually via the API or create a seed script.

### Example: Create Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure Overview

```
src/
├── auth/                   # Authentication & JWT
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   └── auth.module.ts
│
├── users/                  # User management
│   ├── entities/
│   ├── dto/
│   └── users.module.ts
│
├── accounts/               # Account management
│   ├── entities/
│   ├── dto/
│   └── accounts.module.ts
│
├── transactions/           # Transactions (Deposit/Withdraw/Transfer)
│   ├── entities/
│   ├── dto/
│   └── transactions.module.ts
│
├── loans/                  # Loan management & EMI calculation
│   ├── entities/
│   ├── dto/
│   └── loans.module.ts
│
├── interest/               # Interest calculation engine
│   └── interest.module.ts
│
├── reports/                # Reporting system
│   └── reports.module.ts
│
├── common/                 # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── enums/
│
├── config/                 # Configuration
│   └── database.config.ts
│
├── app.module.ts
└── main.ts
```

## API Testing with Postman/Insomnia

1. Register a user
2. Login to get JWT token
3. Use the token in Authorization header for subsequent requests

## Common Issues & Solutions

### Issue: TypeORM cannot connect to MySQL

**Solution:** Ensure MySQL is running and credentials in `.env` are correct

### Issue: Port already in use

**Solution:** Change PORT in `.env` or kill the process using port 3000

### Issue: JWT authentication fails

**Solution:** Ensure JWT_SECRET is set in `.env`

## Development Tips

1. **Auto-reload:** Use `npm run start:dev` for automatic server restart on file changes

2. **Database sync:** In development, TypeORM will auto-sync entities. In production, use migrations.

3. **Logging:** Check console for request logs and errors

4. **Debugging:** Use VS Code debugger with the provided launch configuration

## Interview Preparation Tips

### Key Features to Highlight

1. **Clean Architecture:** Modular structure with separation of concerns
2. **Database Transactions:** QueryRunner for ACID compliance
3. **RBAC:** Role-based access control implementation
4. **Scheduled Jobs:** Cron jobs for interest calculation
5. **Security:** JWT, bcrypt, validation, rate limiting
6. **EMI Calculation:** Mathematical formula implementation
7. **TypeORM:** Relations, query builder, transactions

### Common Questions & Answers

**Q: How do you handle concurrent transactions?**
A: Using TypeORM QueryRunner with transaction isolation to ensure ACID properties

**Q: How is interest calculated?**
A: Scheduled cron job runs monthly, calculating 4% annual (0.33% monthly) interest on savings accounts

**Q: How do you prevent negative balance?**
A: Validation logic checks balance before withdrawal/transfer, wrapped in database transaction

**Q: Explain the loan approval workflow**
A: Customer applies → Status: PENDING → Admin/Employee reviews → Approve/Reject → Generate repayment schedule

**Q: How is EMI calculated?**
A: Using standard formula: EMI = [P x R x (1+R)^N] / [(1+R)^N – 1]

## Next Steps

1. Add more test coverage
2. Implement CSV/PDF export for reports
3. Add email notifications
4. Implement loan repayment tracking
5. Add audit logs
6. Implement password reset functionality
7. Add 2FA authentication
