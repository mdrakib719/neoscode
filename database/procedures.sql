-- ============================================
-- Banking System - Stored Procedures
-- Run these individually in MySQL
-- ============================================

USE banking_system;

-- ============================================
-- Procedure: Get User Account Balance
-- Usage: CALL sp_get_user_balance(1);
-- ============================================

DROP PROCEDURE IF EXISTS sp_get_user_balance;

DELIMITER //

CREATE PROCEDURE sp_get_user_balance(IN p_user_id INT)
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

-- ============================================
-- Procedure: Get Monthly Transaction Statistics
-- Usage: CALL sp_monthly_transaction_stats(2024, 2);
-- ============================================

DROP PROCEDURE IF EXISTS sp_monthly_transaction_stats;

DELIMITER //

CREATE PROCEDURE sp_monthly_transaction_stats(
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

-- ============================================
-- Procedure: Get Pending Loans
-- Usage: CALL sp_get_pending_loans();
-- ============================================

DROP PROCEDURE IF EXISTS sp_get_pending_loans;

DELIMITER //

CREATE PROCEDURE sp_get_pending_loans()
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
-- Procedure: Process Monthly Interest
-- Usage: CALL sp_process_monthly_interest();
-- ============================================

DROP PROCEDURE IF EXISTS sp_process_monthly_interest;

DELIMITER //

CREATE PROCEDURE sp_process_monthly_interest()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_account_id INT;
  DECLARE v_balance DECIMAL(15,2);
  DECLARE v_interest DECIMAL(15,2);
  DECLARE interest_rate DECIMAL(5,4) DEFAULT 0.0033; -- 4% annual = 0.33% monthly
  
  DECLARE cur CURSOR FOR 
    SELECT id, balance 
    FROM accounts 
    WHERE account_type = 'SAVINGS' AND balance > 0;
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO v_account_id, v_balance;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    SET v_interest = ROUND(v_balance * interest_rate, 2);
    
    -- Update account balance
    UPDATE accounts 
    SET balance = balance + v_interest 
    WHERE id = v_account_id;
    
    -- Log transaction
    INSERT INTO transactions (to_account_id, amount, type, status, description, created_at)
    VALUES (v_account_id, v_interest, 'DEPOSIT', 'COMPLETED', 
            CONCAT('Monthly interest credit: ', v_interest), NOW());
  END LOOP;
  
  CLOSE cur;
  
  SELECT CONCAT('Interest processed for ', ROW_COUNT(), ' accounts') AS result;
END //

DELIMITER ;

-- ============================================
-- Procedure: Get Account Transaction History
-- Usage: CALL sp_get_account_transactions(1, 30);
-- ============================================

DROP PROCEDURE IF EXISTS sp_get_account_transactions;

DELIMITER //

CREATE PROCEDURE sp_get_account_transactions(
  IN p_account_id INT,
  IN p_days INT
)
BEGIN
  SELECT 
    t.id,
    t.type,
    t.amount,
    t.status,
    t.description,
    t.created_at,
    CASE 
      WHEN t.from_account_id = p_account_id THEN 'DEBIT'
      WHEN t.to_account_id = p_account_id THEN 'CREDIT'
    END AS transaction_direction,
    fa.account_number AS from_account,
    ta.account_number AS to_account
  FROM transactions t
  LEFT JOIN accounts fa ON t.from_account_id = fa.id
  LEFT JOIN accounts ta ON t.to_account_id = ta.id
  WHERE (t.from_account_id = p_account_id OR t.to_account_id = p_account_id)
    AND t.created_at >= DATE_SUB(NOW(), INTERVAL p_days DAY)
  ORDER BY t.created_at DESC;
END //

DELIMITER ;

-- ============================================
-- Test Procedures (Uncomment to test)
-- ============================================

-- CALL sp_get_user_balance(1);
-- CALL sp_monthly_transaction_stats(2024, 2);
-- CALL sp_get_pending_loans();
-- CALL sp_get_account_transactions(1, 30);
-- CALL sp_process_monthly_interest();
