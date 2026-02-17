-- ============================================
-- Banking System - Sample Seed Data
-- Test data for development and testing
-- ============================================

USE banking_system;

-- ============================================
-- Clean existing data (Development Only!)
-- WARNING: This will delete all existing data
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE loans;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Seed Users
-- Default password for all: "password123"
-- Hashed with bcrypt (10 rounds)
-- ============================================

INSERT INTO users (name, email, password, role) VALUES
-- Admin User
('System Administrator', 'admin@banking.com', '$2b$10$YourHashedPasswordHere', 'ADMIN'),

-- Employee Users
('John Employee', 'john.employee@banking.com', '$2b$10$YourHashedPasswordHere', 'EMPLOYEE'),
('Sarah Manager', 'sarah.manager@banking.com', '$2b$10$YourHashedPasswordHere', 'EMPLOYEE'),

-- Customer Users
('Alice Johnson', 'alice.johnson@example.com', '$2b$10$YourHashedPasswordHere', 'CUSTOMER'),
('Bob Smith', 'bob.smith@example.com', '$2b$10$YourHashedPasswordHere', 'CUSTOMER'),
('Charlie Brown', 'charlie.brown@example.com', '$2b$10$YourHashedPasswordHere', 'CUSTOMER'),
('Diana Prince', 'diana.prince@example.com', '$2b$10$YourHashedPasswordHere', 'CUSTOMER'),
('Eve Wilson', 'eve.wilson@example.com', '$2b$10$YourHashedPasswordHere', 'CUSTOMER');

-- ============================================
-- Seed Accounts
-- ============================================

INSERT INTO accounts (account_number, account_type, balance, currency, user_id) VALUES
-- Admin accounts
('1000000001', 'SAVINGS', 100000.00, 'USD', 1),

-- Employee accounts
('1000000002', 'SAVINGS', 50000.00, 'USD', 2),
('1000000003', 'CHECKING', 30000.00, 'USD', 3),

-- Customer accounts
('2000000001', 'SAVINGS', 25000.00, 'USD', 4),
('2000000002', 'CHECKING', 15000.00, 'USD', 4),
('2000000003', 'SAVINGS', 50000.00, 'USD', 5),
('2000000004', 'CHECKING', 20000.00, 'USD', 5),
('2000000005', 'SAVINGS', 35000.00, 'USD', 6),
('2000000006', 'SAVINGS', 45000.00, 'USD', 7),
('2000000007', 'CHECKING', 12000.00, 'USD', 8);

-- ============================================
-- Seed Transactions
-- ============================================

INSERT INTO transactions (from_account_id, to_account_id, amount, type, status, description, created_at) VALUES
-- Deposits
(NULL, 1, 100000.00, 'DEPOSIT', 'COMPLETED', 'Initial deposit', '2024-01-01 10:00:00'),
(NULL, 4, 25000.00, 'DEPOSIT', 'COMPLETED', 'Salary credit', '2024-01-05 09:00:00'),
(NULL, 5, 50000.00, 'DEPOSIT', 'COMPLETED', 'Salary credit', '2024-01-05 09:00:00'),
(NULL, 6, 35000.00, 'DEPOSIT', 'COMPLETED', 'Initial deposit', '2024-01-10 11:00:00'),

-- Withdrawals
(4, NULL, 5000.00, 'WITHDRAW', 'COMPLETED', 'ATM withdrawal', '2024-01-15 14:30:00'),
(5, NULL, 10000.00, 'WITHDRAW', 'COMPLETED', 'Cash withdrawal', '2024-01-20 16:00:00'),

-- Transfers
(4, 5, 2000.00, 'TRANSFER', 'COMPLETED', 'Payment for services', '2024-01-25 12:00:00'),
(5, 6, 5000.00, 'TRANSFER', 'COMPLETED', 'Gift transfer', '2024-02-01 10:30:00'),
(6, 4, 1500.00, 'TRANSFER', 'COMPLETED', 'Loan repayment', '2024-02-05 15:45:00'),

-- Recent transactions
(NULL, 4, 3000.00, 'DEPOSIT', 'COMPLETED', 'Freelance payment', '2024-02-10 09:00:00'),
(NULL, 5, 5000.00, 'DEPOSIT', 'COMPLETED', 'Bonus credit', '2024-02-12 10:00:00'),
(4, 8, 500.00, 'TRANSFER', 'COMPLETED', 'Utility bill payment', '2024-02-14 14:00:00'),
(5, 7, 1000.00, 'TRANSFER', 'COMPLETED', 'Monthly rent', '2024-02-15 08:00:00');

-- ============================================
-- Seed Loans
-- ============================================

INSERT INTO loans (user_id, loan_type, amount, interest_rate, tenure_months, emi_amount, status, remarks, created_at) VALUES
-- Approved Loans
(4, 'PERSONAL', 50000.00, 8.50, 36, 1575.45, 'APPROVED', 'Approved based on good credit history', '2024-01-10 10:00:00'),
(5, 'HOME', 500000.00, 7.50, 240, 4032.99, 'APPROVED', 'Approved for home purchase', '2024-01-15 11:00:00'),
(6, 'VEHICLE', 150000.00, 9.00, 60, 3112.61, 'APPROVED', 'Approved for vehicle purchase', '2024-01-20 14:00:00'),
(7, 'EDUCATION', 100000.00, 6.50, 84, 1544.37, 'APPROVED', 'Approved for education loan', '2024-02-01 09:00:00'),

-- Pending Loans
(8, 'PERSONAL', 75000.00, 8.50, 48, 1855.17, 'PENDING', NULL, '2024-02-10 10:00:00'),
(4, 'VEHICLE', 200000.00, 9.00, 60, 4150.15, 'PENDING', NULL, '2024-02-12 11:00:00'),

-- Rejected Loans
(5, 'PERSONAL', 100000.00, 10.00, 24, 4614.49, 'REJECTED', 'Insufficient income proof', '2024-01-25 15:00:00');

-- ============================================
-- Update Account Balances After Transactions
-- (Already reflected in the accounts insert above)
-- ============================================

-- ============================================
-- Verify Seed Data
-- ============================================

-- Count records
SELECT 'Users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'Accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Loans', COUNT(*) FROM loans;

-- View sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM accounts LIMIT 5;
SELECT * FROM transactions LIMIT 5;
SELECT * FROM loans LIMIT 5;

-- ============================================
-- Sample User Credentials for Testing
-- ============================================

/*
Admin:
  Email: admin@banking.com
  Password: password123

Employee:
  Email: john.employee@banking.com
  Password: password123

Customer:
  Email: alice.johnson@example.com
  Password: password123
  
  Email: bob.smith@example.com
  Password: password123
*/

-- ============================================
-- Useful Development Queries
-- ============================================

-- Get user with all accounts
SELECT 
  u.name,
  u.email,
  a.account_number,
  a.account_type,
  a.balance
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
WHERE u.email = 'alice.johnson@example.com';

-- Get all transactions for a user
SELECT 
  t.created_at,
  t.type,
  t.amount,
  t.status,
  t.description,
  fa.account_number AS from_account,
  ta.account_number AS to_account
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id = ta.id
WHERE fa.user_id = 4 OR ta.user_id = 4
ORDER BY t.created_at DESC;

-- Get all loans for a user
SELECT 
  loan_type,
  amount,
  interest_rate,
  tenure_months,
  emi_amount,
  status,
  created_at
FROM loans
WHERE user_id = 4;

-- Calculate total balance for a user
SELECT 
  u.name,
  SUM(a.balance) AS total_balance,
  COUNT(a.id) AS account_count
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
WHERE u.id = 4
GROUP BY u.id, u.name;

-- ============================================
-- End of Seed File
-- ============================================
