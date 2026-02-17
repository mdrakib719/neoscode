-- ============================================
-- Banking System - Useful SQL Queries
-- Common queries for development and testing
-- ============================================

USE banking_system;

-- ============================================
-- USER QUERIES
-- ============================================

-- Get all users
SELECT * FROM users ORDER BY created_at DESC;

-- Get users by role
SELECT * FROM users WHERE role = 'CUSTOMER';
SELECT * FROM users WHERE role = 'ADMIN';
SELECT * FROM users WHERE role = 'EMPLOYEE';

-- Get user by email
SELECT * FROM users WHERE email = 'alice.johnson@example.com';

-- Count users by role
SELECT role, COUNT(*) AS user_count 
FROM users 
GROUP BY role;

-- ============================================
-- ACCOUNT QUERIES
-- ============================================

-- Get all accounts
SELECT * FROM accounts ORDER BY created_at DESC;

-- Get accounts for a specific user
SELECT 
  a.*,
  u.name AS user_name,
  u.email AS user_email
FROM accounts a
INNER JOIN users u ON a.user_id = u.id
WHERE u.id = 4;

-- Get total balance by account type
SELECT 
  account_type,
  COUNT(*) AS account_count,
  SUM(balance) AS total_balance,
  AVG(balance) AS average_balance
FROM accounts
GROUP BY account_type;

-- Get accounts with balance greater than threshold
SELECT * FROM accounts WHERE balance > 20000 ORDER BY balance DESC;

-- Get user's total balance across all accounts
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(a.id) AS total_accounts,
  COALESCE(SUM(a.balance), 0) AS total_balance
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
WHERE u.id = 4
GROUP BY u.id, u.name, u.email;

-- ============================================
-- TRANSACTION QUERIES
-- ============================================

-- Get all transactions
SELECT * FROM transactions ORDER BY created_at DESC;

-- Get transactions for a specific account
SELECT 
  t.*,
  fa.account_number AS from_account,
  ta.account_number AS to_account
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id = ta.id
WHERE t.from_account_id = 4 OR t.to_account_id = 4
ORDER BY t.created_at DESC;

-- Get transactions by type
SELECT * FROM transactions WHERE type = 'DEPOSIT' ORDER BY created_at DESC;
SELECT * FROM transactions WHERE type = 'WITHDRAW' ORDER BY created_at DESC;
SELECT * FROM transactions WHERE type = 'TRANSFER' ORDER BY created_at DESC;

-- Get transactions by status
SELECT * FROM transactions WHERE status = 'COMPLETED';
SELECT * FROM transactions WHERE status = 'PENDING';
SELECT * FROM transactions WHERE status = 'FAILED';

-- Get transaction statistics
SELECT 
  type,
  status,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  MIN(amount) AS min_amount,
  MAX(amount) AS max_amount
FROM transactions
GROUP BY type, status
ORDER BY type, status;

-- Get transactions for a date range
SELECT * FROM transactions
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at DESC;

-- Get monthly transaction summary
SELECT 
  YEAR(created_at) AS year,
  MONTH(created_at) AS month,
  type,
  COUNT(*) AS count,
  SUM(amount) AS total
FROM transactions
GROUP BY YEAR(created_at), MONTH(created_at), type
ORDER BY year DESC, month DESC, type;

-- Get top 10 largest transactions
SELECT * FROM transactions 
ORDER BY amount DESC 
LIMIT 10;

-- ============================================
-- LOAN QUERIES
-- ============================================

-- Get all loans
SELECT * FROM loans ORDER BY created_at DESC;

-- Get loans for a specific user
SELECT 
  l.*,
  u.name AS user_name,
  u.email AS user_email
FROM loans l
INNER JOIN users u ON l.user_id = u.id
WHERE l.user_id = 4;

-- Get loans by status
SELECT * FROM loans WHERE status = 'PENDING';
SELECT * FROM loans WHERE status = 'APPROVED';
SELECT * FROM loans WHERE status = 'REJECTED';

-- Get loans by type
SELECT * FROM loans WHERE loan_type = 'PERSONAL';
SELECT * FROM loans WHERE loan_type = 'HOME';
SELECT * FROM loans WHERE loan_type = 'VEHICLE';
SELECT * FROM loans WHERE loan_type = 'EDUCATION';

-- Get loan statistics
SELECT 
  loan_type,
  status,
  COUNT(*) AS loan_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  AVG(interest_rate) AS average_rate,
  AVG(tenure_months) AS average_tenure
FROM loans
GROUP BY loan_type, status
ORDER BY loan_type, status;

-- Get total loan amount by status
SELECT 
  status,
  COUNT(*) AS loan_count,
  SUM(amount) AS total_loan_amount,
  SUM(emi_amount * tenure_months) AS total_payable
FROM loans
GROUP BY status;

-- Calculate total interest for each loan
SELECT 
  id,
  loan_type,
  amount AS principal,
  interest_rate,
  tenure_months,
  emi_amount,
  (emi_amount * tenure_months) AS total_payable,
  ((emi_amount * tenure_months) - amount) AS total_interest,
  status
FROM loans
ORDER BY total_interest DESC;

-- ============================================
-- MONTHLY STATEMENT QUERY
-- ============================================

-- Get monthly statement for an account
SELECT 
  DATE(t.created_at) AS transaction_date,
  t.type,
  CASE 
    WHEN t.type = 'DEPOSIT' OR t.to_account_id = 4 THEN t.amount
    ELSE 0
  END AS credit,
  CASE 
    WHEN t.type = 'WITHDRAW' OR t.from_account_id = 4 THEN t.amount
    ELSE 0
  END AS debit,
  t.description,
  t.status
FROM transactions t
WHERE (t.from_account_id = 4 OR t.to_account_id = 4)
  AND YEAR(t.created_at) = 2024
  AND MONTH(t.created_at) = 2
ORDER BY t.created_at ASC;

-- ============================================
-- REPORTING QUERIES
-- ============================================

-- System Overview Report
SELECT 
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM accounts) AS total_accounts,
  (SELECT COUNT(*) FROM transactions) AS total_transactions,
  (SELECT COUNT(*) FROM loans) AS total_loans,
  (SELECT SUM(balance) FROM accounts) AS total_deposits,
  (SELECT SUM(amount) FROM loans WHERE status = 'APPROVED') AS total_loans_disbursed;

-- Customer Summary Report
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT a.id) AS account_count,
  COALESCE(SUM(a.balance), 0) AS total_balance,
  COUNT(DISTINCT l.id) AS loan_count,
  COALESCE(SUM(l.amount), 0) AS total_loan_amount
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN loans l ON u.id = l.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.name, u.email
ORDER BY total_balance DESC;

-- Daily Transaction Summary
SELECT 
  DATE(created_at) AS transaction_date,
  COUNT(*) AS transaction_count,
  SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END) AS total_deposits,
  SUM(CASE WHEN type = 'WITHDRAW' THEN amount ELSE 0 END) AS total_withdrawals,
  SUM(CASE WHEN type = 'TRANSFER' THEN amount ELSE 0 END) AS total_transfers
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

-- Account Activity Report (Last 30 days)
SELECT 
  a.account_number,
  a.account_type,
  a.balance AS current_balance,
  COUNT(t.id) AS transaction_count,
  COALESCE(SUM(CASE WHEN t.to_account_id = a.id THEN t.amount ELSE 0 END), 0) AS total_credits,
  COALESCE(SUM(CASE WHEN t.from_account_id = a.id THEN t.amount ELSE 0 END), 0) AS total_debits
FROM accounts a
LEFT JOIN transactions t ON (a.id = t.from_account_id OR a.id = t.to_account_id)
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY a.id, a.account_number, a.account_type, a.balance
ORDER BY transaction_count DESC;

-- ============================================
-- INTEREST CALCULATION QUERIES
-- ============================================

-- Calculate monthly interest for savings accounts (4% annual = 0.33% monthly)
SELECT 
  id,
  account_number,
  balance AS current_balance,
  ROUND(balance * 0.04 / 12, 2) AS monthly_interest,
  ROUND(balance + (balance * 0.04 / 12), 2) AS new_balance
FROM accounts
WHERE account_type = 'SAVINGS' AND balance > 0;

-- ============================================
-- ADVANCED QUERIES
-- ============================================

-- Find accounts with no transactions in last 30 days (Inactive accounts)
SELECT 
  a.id,
  a.account_number,
  a.account_type,
  a.balance,
  u.name AS user_name
FROM accounts a
INNER JOIN users u ON a.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t
  WHERE (t.from_account_id = a.id OR t.to_account_id = a.id)
    AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- Customer with highest total balance
SELECT 
  u.name,
  u.email,
  SUM(a.balance) AS total_balance
FROM users u
INNER JOIN accounts a ON u.id = a.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.name, u.email
ORDER BY total_balance DESC
LIMIT 1;

-- Most active account (by transaction count)
SELECT 
  a.account_number,
  a.account_type,
  u.name AS account_holder,
  COUNT(t.id) AS transaction_count
FROM accounts a
INNER JOIN users u ON a.user_id = u.id
LEFT JOIN transactions t ON (a.id = t.from_account_id OR a.id = t.to_account_id)
GROUP BY a.id, a.account_number, a.account_type, u.name
ORDER BY transaction_count DESC
LIMIT 10;

-- Loan approval rate by loan type
SELECT 
  loan_type,
  COUNT(*) AS total_applications,
  SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
  SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
  SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
  ROUND(SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS approval_rate
FROM loans
GROUP BY loan_type;

-- ============================================
-- CLEANUP QUERIES (Use with caution!)
-- ============================================

-- Delete old completed transactions (older than 1 year)
-- DELETE FROM transactions 
-- WHERE status = 'COMPLETED' 
--   AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Delete rejected loans (older than 6 months)
-- DELETE FROM loans 
-- WHERE status = 'REJECTED' 
--   AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Check database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'banking_system'
GROUP BY table_schema;

-- Check table sizes
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
  table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'banking_system'
ORDER BY (data_length + index_length) DESC;

-- ============================================
-- End of Queries File
-- ============================================
