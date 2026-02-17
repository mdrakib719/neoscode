-- Create system_config table
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  `value` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_config_key` (`key`),
  INDEX `idx_config_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(100) NOT NULL,
  `resource_id` INT DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_resource` (`resource`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new columns to existing users table (if not exists)
-- Note: MySQL doesn't support ADD COLUMN IF NOT EXISTS, so we'll handle errors gracefully
ALTER TABLE `users` 
  ADD COLUMN `isActive` BOOLEAN DEFAULT TRUE AFTER `role`,
  ADD COLUMN `isLocked` BOOLEAN DEFAULT FALSE AFTER `isActive`,
  ADD COLUMN `locked_at` TIMESTAMP NULL AFTER `isLocked`,
  ADD COLUMN `lock_reason` TEXT NULL AFTER `locked_at`;

-- Add new columns to existing accounts table (if not exists)
ALTER TABLE `accounts`
  ADD COLUMN `isFrozen` BOOLEAN DEFAULT FALSE AFTER `updated_at`,
  ADD COLUMN `frozen_at` TIMESTAMP NULL AFTER `isFrozen`,
  ADD COLUMN `freeze_reason` TEXT NULL AFTER `frozen_at`,
  ADD COLUMN `status` ENUM('ACTIVE', 'FROZEN', 'CLOSED') DEFAULT 'ACTIVE' AFTER `freeze_reason`,
  ADD COLUMN `closedAt` TIMESTAMP NULL AFTER `status`,
  ADD COLUMN `closeReason` TEXT NULL AFTER `closedAt`,
  ADD COLUMN `dailyWithdrawalLimit` DECIMAL(15, 2) DEFAULT 10000.00 AFTER `closeReason`,
  ADD COLUMN `dailyTransferLimit` DECIMAL(15, 2) DEFAULT 50000.00 AFTER `dailyWithdrawalLimit`,
  ADD COLUMN `monthlyWithdrawalLimit` DECIMAL(15, 2) DEFAULT 100000.00 AFTER `dailyTransferLimit`;

-- Insert default system configurations
INSERT INTO `system_config` (`key`, `value`, `category`, `description`) VALUES
  ('transaction.dailyTransferLimit', '50000', 'limits', 'Default daily transfer limit per account'),
  ('transaction.dailyWithdrawalLimit', '10000', 'limits', 'Default daily withdrawal limit per account'),
  ('transaction.perTransactionLimit', '25000', 'limits', 'Maximum amount per single transaction'),
  ('fees.transfer', '0', 'fees', 'Transfer fee in currency'),
  ('fees.withdrawal', '0', 'fees', 'Withdrawal fee in currency'),
  ('fees.monthlyMaintenance', '5', 'fees', 'Monthly account maintenance fee'),
  ('interest.SAVINGS', '4', 'interest', 'Annual interest rate for savings accounts (%)'),
  ('interest.CHECKING', '0', 'interest', 'Annual interest rate for checking accounts (%)'),
  ('loan.interest.PERSONAL', '12', 'loan', 'Annual interest rate for personal loans (%)'),
  ('loan.interest.HOME', '8', 'loan', 'Annual interest rate for home loans (%)'),
  ('loan.interest.VEHICLE', '10', 'loan', 'Annual interest rate for vehicle loans (%)'),
  ('loan.interest.EDUCATION', '6', 'loan', 'Annual interest rate for education loans (%)'),
  ('penalty.lateFeePercentage', '2', 'penalty', 'Late payment fee percentage'),
  ('penalty.overdraftFee', '35', 'penalty', 'Overdraft fee amount'),
  ('penalty.minimumBalanceFee', '10', 'penalty', 'Fee for falling below minimum balance'),
  ('system.defaultCurrency', 'USD', 'system', 'Default system currency'),
  ('system.maintenanceMode', 'false', 'system', 'Enable/disable system maintenance mode')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- Create indexes for better performance
CREATE INDEX `idx_users_active` ON `users` (`isActive`);
CREATE INDEX `idx_users_locked` ON `users` (`isLocked`);
CREATE INDEX `idx_accounts_status` ON `accounts` (`status`);
CREATE INDEX `idx_accounts_frozen` ON `accounts` (`isFrozen`);

COMMIT;
