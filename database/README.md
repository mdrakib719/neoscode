# Database Documentation

## Quick Setup

### 1. Create Database and Schema

```bash
mysql -u root -p < database/schema.sql
```

This will create:

- Database: `banking_system`
- 4 Tables: users, accounts, transactions, loans
- 3 Views for reporting
- 3 Stored procedures
- 2 Functions
- 2 Triggers

### 2. Seed Sample Data (Optional)

```bash
mysql -u root -p < database/seed.sql
```

This will populate the database with:

- 8 sample users (Admin, Employees, Customers)
- 10 sample accounts
- 13 sample transactions
- 7 sample loans

## Database Structure

### Tables

#### 1. users

Stores user information and authentication details.

| Column     | Type         | Description               |
| ---------- | ------------ | ------------------------- |
| id         | INT          | Primary key               |
| name       | VARCHAR(255) | User full name            |
| email      | VARCHAR(255) | Unique email address      |
| password   | VARCHAR(255) | Hashed password (bcrypt)  |
| role       | ENUM         | ADMIN, EMPLOYEE, CUSTOMER |
| created_at | DATETIME     | Record creation timestamp |
| updated_at | DATETIME     | Record update timestamp   |

#### 2. accounts

Bank account information for users.

| Column         | Type          | Description                  |
| -------------- | ------------- | ---------------------------- |
| id             | INT           | Primary key                  |
| account_number | VARCHAR(255)  | Unique account number        |
| account_type   | ENUM          | SAVINGS, CHECKING, LOAN      |
| balance        | DECIMAL(15,2) | Current balance              |
| currency       | VARCHAR(10)   | Currency code (default: USD) |
| user_id        | INT           | Foreign key to users         |
| created_at     | DATETIME      | Record creation timestamp    |
| updated_at     | DATETIME      | Record update timestamp      |

#### 3. transactions

All financial transactions.

| Column          | Type          | Description                                |
| --------------- | ------------- | ------------------------------------------ |
| id              | INT           | Primary key                                |
| from_account_id | INT           | Source account (NULL for deposits)         |
| to_account_id   | INT           | Destination account (NULL for withdrawals) |
| amount          | DECIMAL(15,2) | Transaction amount                         |
| type            | ENUM          | DEPOSIT, WITHDRAW, TRANSFER                |
| status          | ENUM          | PENDING, COMPLETED, FAILED                 |
| description     | TEXT          | Transaction description                    |
| created_at      | DATETIME      | Transaction timestamp                      |

#### 4. loans

Loan applications and details.

| Column        | Type          | Description                         |
| ------------- | ------------- | ----------------------------------- |
| id            | INT           | Primary key                         |
| user_id       | INT           | Foreign key to users                |
| loan_type     | ENUM          | PERSONAL, HOME, VEHICLE, EDUCATION  |
| amount        | DECIMAL(15,2) | Loan amount                         |
| interest_rate | DECIMAL(5,2)  | Annual interest rate                |
| tenure_months | INT           | Loan tenure in months               |
| emi_amount    | DECIMAL(15,2) | Monthly EMI                         |
| status        | ENUM          | PENDING, APPROVED, REJECTED, CLOSED |
| remarks       | TEXT          | Admin remarks                       |
| created_at    | DATETIME      | Application timestamp               |
| updated_at    | DATETIME      | Record update timestamp             |

## Views

### view_account_summary

Complete account information with user details.

### view_transaction_summary

Transaction details with account and user information.

### view_loan_summary

Loan details with user information and total payable amount.

## Stored Procedures

### sp_get_user_balance(user_id)

Returns total balance across all accounts for a user.

```sql
CALL sp_get_user_balance(1);
```

### sp_monthly_transaction_stats(year, month)

Returns transaction statistics for a specific month.

```sql
CALL sp_monthly_transaction_stats(2024, 1);
```

### sp_get_pending_loans()

Returns all pending loan applications.

```sql
CALL sp_get_pending_loans();
```

## Functions

### fn_calculate_emi(principal, annual_rate, tenure_months)

Calculates EMI using the standard formula.

```sql
SELECT fn_calculate_emi(50000, 8.5, 36) AS emi;
```

### fn_get_account_balance(account_id)

Returns current balance for an account.

```sql
SELECT fn_get_account_balance(1) AS balance;
```

## Triggers

### trg_check_balance_before_withdrawal

Validates sufficient balance before processing withdrawals.

### trg_account_update_log

Logs balance changes in the transactions table.

## Common Queries

All common queries are available in `database/queries.sql`:

- User queries
- Account queries
- Transaction queries
- Loan queries
- Reporting queries
- Monthly statements
- Interest calculations
- Advanced analytics

## Indexes

The schema includes optimized indexes for:

- Primary keys on all tables
- Foreign key relationships
- Frequently queried columns (email, account_number, user_id, etc.)
- Composite indexes for common join operations

## Sample Credentials

After running seed.sql, you can use these credentials:

**Admin:**

- Email: admin@banking.com
- Password: password123

**Employee:**

- Email: john.employee@banking.com
- Password: password123

**Customer:**

- Email: alice.johnson@example.com
- Password: password123

## Backup & Restore

### Create Backup

```bash
mysqldump -u root -p banking_system > backup.sql
```

### Restore from Backup

```bash
mysql -u root -p banking_system < backup.sql
```

## Maintenance

### Optimize Tables

```sql
OPTIMIZE TABLE users, accounts, transactions, loans;
```

### Analyze Tables

```sql
ANALYZE TABLE users, accounts, transactions, loans;
```

### Check Table Status

```sql
SHOW TABLE STATUS FROM banking_system;
```

## Performance Tips

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Views**: Use pre-defined views for complex joins
3. **Stored Procedures**: Use procedures for repetitive operations
4. **Connection Pooling**: TypeORM handles this automatically
5. **Query Optimization**: Use EXPLAIN to analyze query performance

## Security

1. All passwords are hashed with bcrypt
2. Foreign key constraints ensure referential integrity
3. Triggers validate business rules
4. Use prepared statements (TypeORM does this automatically)
5. Regular backups recommended

## Database Size Estimates

With 10,000 users and typical usage:

- users: ~5 MB
- accounts: ~10 MB
- transactions: ~100 MB (grows with activity)
- loans: ~5 MB

Total: ~120 MB (varies based on usage)
