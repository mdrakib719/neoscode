-- ============================================
-- Banking System Database Schema
-- MySQL Database Setup Script
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- ============================================
-- Table: users
-- Description: Stores user information
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'EMPLOYEE', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_users_email` (`email`),
  INDEX `IDX_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: accounts
-- Description: Stores bank account information
-- ============================================
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_number` VARCHAR(255) NOT NULL UNIQUE,
  `account_type` ENUM('SAVINGS', 'CHECKING', 'LOAN') NOT NULL DEFAULT 'SAVINGS',
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `user_id` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_accounts_account_number` (`account_number`),
  INDEX `IDX_accounts_user_id` (`user_id`),
  INDEX `IDX_accounts_type` (`account_type`),
  CONSTRAINT `FK_accounts_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: transactions
-- Description: Stores all transaction records
-- ============================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `from_account_id` INT NULL,
  `to_account_id` INT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `type` ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER') NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `description` TEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_transactions_from_account` (`from_account_id`),
  INDEX `IDX_transactions_to_account` (`to_account_id`),
  INDEX `IDX_transactions_type` (`type`),
  INDEX `IDX_transactions_status` (`status`),
  INDEX `IDX_transactions_created_at` (`created_at`),
  CONSTRAINT `FK_transactions_from_account` FOREIGN KEY (`from_account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_transactions_to_account` FOREIGN KEY (`to_account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: loans
-- Description: Stores loan applications and details
-- ============================================
CREATE TABLE IF NOT EXISTS `loans` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `loan_type` ENUM('PERSONAL', 'HOME', 'VEHICLE', 'EDUCATION') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `interest_rate` DECIMAL(5,2) NOT NULL,
  `tenure_months` INT NOT NULL,
  `emi_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
  `remarks` TEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_loans_user_id` (`user_id`),
  INDEX `IDX_loans_status` (`status`),
  INDEX `IDX_loans_type` (`loan_type`),
  CONSTRAINT `FK_loans_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Indexes for Performance Optimization
-- ============================================

-- Composite indexes for common queries
CREATE INDEX `IDX_accounts_user_type` ON `accounts` (`user_id`, `account_type`);
CREATE INDEX `IDX_transactions_date_status` ON `transactions` (`created_at`, `status`);
CREATE INDEX `IDX_loans_user_status` ON `loans` (`user_id`, `status`);

-- ============================================
-- Views for Reporting
-- ============================================

-- View: Account Summary
CREATE OR REPLACE VIEW `view_account_summary` AS
SELECT 
  a.id AS account_id,
  a.account_number,
  a.account_type,
  a.balance,
  a.currency,
  u.id AS user_id,
  u.name AS user_name,
  u.email AS user_email,
  a.created_at
FROM accounts a
INNER JOIN users u ON a.user_id = u.id;

-- View: Transaction Summary
CREATE OR REPLACE VIEW `view_transaction_summary` AS
SELECT 
  t.id AS transaction_id,
  t.type,
  t.amount,
  t.status,
  t.description,
  t.created_at,
  fa.account_number AS from_account,
  ta.account_number AS to_account,
  fu.name AS from_user,
  tu.name AS to_user
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id = ta.id
LEFT JOIN users fu ON fa.user_id = fu.id
LEFT JOIN users tu ON ta.user_id = tu.id;

-- View: Loan Summary
CREATE OR REPLACE VIEW `view_loan_summary` AS
SELECT 
  l.id AS loan_id,
  l.loan_type,
  l.amount,
  l.interest_rate,
  l.tenure_months,
  l.emi_amount,
  l.status,
  l.created_at,
  u.id AS user_id,
  u.name AS user_name,
  u.email AS user_email,
  (l.amount + (l.amount * l.interest_rate * l.tenure_months / 1200)) AS total_payable
FROM loans l
INNER JOIN users u ON l.user_id = u.id;

-- ============================================
-- Stored Procedures
-- ============================================

-- Procedure: Get User Account Balance
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_user_balance(IN p_user_id INT)
BEGIN
  SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(a.id) AS total_accounts,
    COALESCE(SUM(a.balance), 0) AS total_balance
  FROM users u
  LEFT JOIN accounts a ON u.id = a.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.name, u.email;
END //
DELIMITER ;

-- Procedure: Get Monthly Transaction Statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_monthly_transaction_stats(
  IN p_year INT,
  IN p_month INT
)
BEGIN
  SELECT 
    type,
    status,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS average_amount
  FROM transactions
  WHERE YEAR(created_at) = p_year 
    AND MONTH(created_at) = p_month
  GROUP BY type, status
  ORDER BY type, status;
END //
DELIMITER ;

-- Procedure: Get Pending Loans
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_pending_loans()
BEGIN
  SELECT 
    l.*,
    u.name AS user_name,
    u.email AS user_email,
    u.role AS user_role
  FROM loans l
  INNER JOIN users u ON l.user_id = u.id
  WHERE l.status = 'PENDING'
  ORDER BY l.created_at ASC;
END //
DELIMITER ;

-- ============================================
-- Functions
-- ============================================

-- Function: Calculate EMI
DELIMITER //
CREATE FUNCTION IF NOT EXISTS fn_calculate_emi(
  principal DECIMAL(15,2),
  annual_rate DECIMAL(5,2),
  tenure_months INT
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN
  DECLARE monthly_rate DECIMAL(10,8);
  DECLARE emi DECIMAL(15,2);
  
  SET monthly_rate = annual_rate / 12 / 100;
  
  IF monthly_rate = 0 THEN
    SET emi = principal / tenure_months;
  ELSE
    SET emi = (principal * monthly_rate * POWER(1 + monthly_rate, tenure_months)) 
              / (POWER(1 + monthly_rate, tenure_months) - 1);
  END IF;
  
  RETURN ROUND(emi, 2);
END //
DELIMITER ;

-- Function: Get Account Balance
DELIMITER //
CREATE FUNCTION IF NOT EXISTS fn_get_account_balance(account_id INT)
RETURNS DECIMAL(15,2)
READS SQL DATA
BEGIN
  DECLARE current_balance DECIMAL(15,2);
  
  SELECT balance INTO current_balance
  FROM accounts
  WHERE id = account_id;
  
  RETURN COALESCE(current_balance, 0);
END //
DELIMITER ;

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Validate Sufficient Balance Before Withdrawal
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_check_balance_before_withdrawal
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
  DECLARE current_balance DECIMAL(15,2);
  
  IF NEW.type = 'WITHDRAW' AND NEW.from_account_id IS NOT NULL THEN
    SELECT balance INTO current_balance
    FROM accounts
    WHERE id = NEW.from_account_id;
    
    IF current_balance < NEW.amount THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Insufficient balance for withdrawal';
    END IF;
  END IF;
END //
DELIMITER ;

-- Trigger: Log Account Updates
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_account_update_log
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
  IF NEW.balance != OLD.balance THEN
    INSERT INTO transactions (to_account_id, amount, type, status, description)
    VALUES (NEW.id, ABS(NEW.balance - OLD.balance), 'DEPOSIT', 'COMPLETED', 
            CONCAT('Balance update: ', OLD.balance, ' -> ', NEW.balance));
  END IF;
END //
DELIMITER ;

-- ============================================
-- Sample Data for Testing (Optional)
-- ============================================

-- Insert Sample Admin User
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('System Admin', 'admin@banking.com', '$2b$10$rG8KjWQvEVqJ8h0YvXqJ2.XKKZqP8qP8qP8qP8qP8qP8qP8qP8qP8', 'ADMIN');

-- Insert Sample Employee
INSERT INTO users (name, email, password, role) VALUES
('John Employee', 'employee@banking.com', '$2b$10$rG8KjWQvEVqJ8h0YvXqJ2.XKKZqP8qP8qP8qP8qP8qP8qP8qP8qP8', 'EMPLOYEE');

-- Insert Sample Customer
INSERT INTO users (name, email, password, role) VALUES
('Alice Customer', 'customer@banking.com', '$2b$10$rG8KjWQvEVqJ8h0YvXqJ2.XKKZqP8qP8qP8qP8qP8qP8qP8qP8qP8', 'CUSTOMER');

-- ============================================
-- Useful Queries
-- ============================================

-- Query: Get all accounts with user details
-- SELECT * FROM view_account_summary;

-- Query: Get all transactions with details
-- SELECT * FROM view_transaction_summary;

-- Query: Get all loans with details
-- SELECT * FROM view_loan_summary;

-- Query: Get user total balance
-- CALL sp_get_user_balance(1);

-- Query: Get monthly transaction stats
-- CALL sp_monthly_transaction_stats(2024, 1);

-- Query: Get all pending loans
-- CALL sp_get_pending_loans();

-- Query: Calculate EMI
-- SELECT fn_calculate_emi(50000, 8.5, 36) AS emi;

-- Query: Get account balance
-- SELECT fn_get_account_balance(1) AS balance;

-- ============================================
-- Database Information
-- ============================================

-- Show all tables
-- SHOW TABLES;

-- Show table structure
-- DESCRIBE users;
-- DESCRIBE accounts;
-- DESCRIBE transactions;
-- DESCRIBE loans;

-- ============================================
-- Performance Optimization Hints
-- ============================================

-- Analyze tables for optimization
-- ANALYZE TABLE users, accounts, transactions, loans;

-- Optimize tables
-- OPTIMIZE TABLE users, accounts, transactions, loans;

-- Check table status
-- SHOW TABLE STATUS;

-- ============================================
-- Backup and Restore Commands
-- ============================================

-- Backup database:
-- mysqldump -u root -p banking_system > banking_system_backup.sql

-- Restore database:
-- mysql -u root -p banking_system < banking_system_backup.sql

-- ============================================
-- Table: token_blacklist
-- Description: Stores blacklisted JWT tokens and user-level bans.
--   type = 'logout'   → single token invalidated after logout
--   type = 'user_ban' → all tokens for a user blocked by admin
-- token_hash stores SHA-256(rawJWT) — never the raw token itself.
-- ============================================
CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `token_hash` VARCHAR(64)  NOT NULL COMMENT 'SHA-256 hash of the JWT or user_ban:<userId>',
  `user_id`    INT          NULL,
  `type`       VARCHAR(20)  NOT NULL DEFAULT 'logout' COMMENT 'logout | user_ban',
  `reason`     TEXT         NULL,
  `expires_at` DATETIME     NOT NULL COMMENT 'Matches JWT expiry — safe to delete after this',
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_token_blacklist_hash`       (`token_hash`),
  INDEX        `IDX_token_blacklist_expires`    (`expires_at`),
  INDEX        `IDX_token_blacklist_user_id`    (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Blacklisted JWT tokens and account-level bans';

-- ============================================
-- End of Schema
-- ============================================
