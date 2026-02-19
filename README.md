# 🏦 Banking System — Full Stack

> A production-grade **Banking Management System** built with **NestJS** (backend), **React + Vite** (frontend), **MySQL**, and **Redis**. Supports multi-role access (Admin / Employee / Customer), real-time notifications, loan lifecycle management, automated interest & penalty engines, PDF report exports, JWT + 2FA authentication, and much more.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Database Schema Overview](#-database-schema-overview)
- [Environment Setup](#-environment-setup)
- [Quick Start — One Command](#-quick-start--one-command)
- [Manual Setup](#-manual-setup)
- [Full Database SQL](#-full-database-sql)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Default Test Credentials](#-default-test-credentials)
- [Scripts Reference](#-scripts-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧰 Tech Stack

| Layer                 | Technology                                         |
| --------------------- | -------------------------------------------------- |
| **Backend**           | NestJS 10, TypeORM, Passport, JWT, Speakeasy (2FA) |
| **Frontend**          | React 18, Vite 5, React Router 6, Zustand, Axios   |
| **Database**          | MySQL 8 (InnoDB, UTF8MB4)                          |
| **Cache / Blacklist** | Redis 7                                            |
| **Email**             | Nodemailer + Handlebars templates                  |
| **PDF**               | PDFKit                                             |
| **QR Code**           | qrcode (for 2FA setup)                             |
| **Auth**              | bcrypt, JWT (HS256), 2FA TOTP                      |
| **Scheduler**         | @nestjs/schedule (Cron jobs)                       |
| **Validation**        | class-validator, class-transformer                 |
| **Rate Limiting**     | @nestjs/throttler (10 req / 60 s per IP)           |

---

## 📁 Project Structure

```
banking-system/
│
├── client/                          # React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       │   └── Layout/
│       ├── config/                  # Axios / API base config
│       ├── controllers/             # Frontend controller layer
│       ├── models/                  # TypeScript interfaces/models
│       ├── services/                # API call services
│       └── views/                   # Page components
│
├── database/
│   ├── schema.sql                   # Core tables, views, triggers, functions
│   ├── admin-schema.sql             # Admin tables: audit_logs, system_config
│   ├── seed.sql                     # Sample / test data
│   ├── procedures.sql               # Stored procedures
│   ├── queries.sql                  # Useful standalone queries
│   └── README.md
│
├── scripts/
│   └── update-passwords.js          # Bcrypt password hash utility
│
├── src/                             # NestJS backend source
│   ├── main.ts                      # App bootstrap (port 3001)
│   ├── app.module.ts                # Root module
│   ├── auth/                        # JWT, Passport, 2FA, Guards
│   ├── users/                       # User CRUD
│   ├── accounts/                    # Bank accounts, FD, RD
│   ├── transactions/                # Deposit / Withdraw / Transfer + Beneficiaries
│   ├── loans/                       # Loan apply, approve, EMI, repayment
│   ├── interest/                    # Auto monthly interest cron
│   ├── penalty/                     # Late EMI penalty cron + waiver
│   ├── reports/                     # Monthly statement, PDF export
│   ├── admin/                       # Full admin control panel
│   ├── staff/                       # Staff account management
│   ├── loan-officers/               # Loan officer workflows
│   ├── notifications/               # In-app notification system
│   ├── common/
│   │   ├── decorators/              # @GetUser, @Roles
│   │   ├── enums/                   # UserRole, AccountType, etc.
│   │   ├── filters/                 # Global exception filter
│   │   ├── guards/                  # RolesGuard
│   │   └── interceptors/
│   └── config/
│       └── database.config.ts
│
├── templates/
│   └── email/                       # Handlebars email templates
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example                     # Environment variable template
├── nest-cli.json
├── package.json
├── tsconfig.json
├── start.sh                         # One-command full-stack startup script
└── README.md
```

---

## ✨ Features

### 🔐 Authentication & Security

- User registration with **bcrypt** password hashing (10 rounds)
- **JWT** access tokens (configurable expiry, default 24 h)
- **Token blacklist** via Redis — logout invalidates token immediately
- **Two-Factor Authentication (2FA)** — TOTP (Google Authenticator / Authy)
  - Generate secret + QR code
  - Enable / disable 2FA per user
  - Verify TOTP token on login
- **Role-Based Access Control (RBAC)** — `ADMIN`, `EMPLOYEE`, `CUSTOMER`
- Route guards: `JwtAuthGuard`, `RolesGuard`
- **Rate limiting** — 10 requests per 60 seconds per IP
- `token_blacklist` table stores SHA-256 token hashes (never raw tokens)

### 👥 User Management

- Register and login (any role)
- View / update profile
- List all users (Admin / Employee)
- Soft lock / unlock user accounts
- Activate / deactivate accounts
- Reset user password (Admin)
- Assign / change roles (Admin)
- Full audit log for every admin action

### 💰 Bank Account Management

- Create accounts — **Savings**, **Checking**, **Loan**
- Auto-generate unique account numbers
- Multi-currency support (default: USD)
- **Fixed Deposit (FD)** account creation
- **Recurring Deposit (RD)** account creation
- Check withdrawal eligibility before action
- **Account freeze / unfreeze** (Admin / Staff)
- **Daily withdrawal limit** (default $10,000)
- **Daily transfer limit** (default $50,000)
- **Monthly withdrawal limit** (default $100,000)
- Account deletion request workflow
- Account close with reason log

### 💸 Transaction System

- **Deposit** — validation, balance update, transaction record
- **Withdraw** — balance check, insufficient-funds guard, DB trigger validation
- **Transfer** — ACID compliant via QueryRunner, atomic rollback on failure
- **Deposit Request Workflow** — Customer submits → Staff approves / rejects
- **Beneficiary Management** — Add / update / delete saved transfer targets
- Transaction history with filters (type, date range, status)
- Transaction status tracking (`PENDING`, `COMPLETED`, `FAILED`)
- **Reverse transaction** (Admin only)
- Per-transaction limits enforced at DB level

### 🏦 Loan Management

- Apply for loans — **Personal**, **Home**, **Vehicle**, **Education**
- **EMI auto-calculation**:

  ```
  EMI = [P × R × (1 + R)^N] / [(1 + R)^N − 1]
  ```

- Full loan lifecycle: `PENDING → APPROVED / REJECTED → CLOSED`
- Admin / Loan Officer approve or reject with remarks
- **Repayment schedule** — month-by-month principal + interest breakdown
- **EMI payment** from linked account balance
- **Payment history** per loan
- Loan summary & next EMI details
- Configurable loan interest rates per type via `system_config`

### 💹 Interest Engine

- **Automated monthly cron** (1st of every month) applies interest to all active Savings accounts
- Manual trigger available (Admin)
- 4 % annual rate (0.33 % monthly) — configurable via `system_config`
- Interest transactions auto-recorded
- Interest summary reports per account / system-wide

### ⚠️ Penalty Engine

- **Daily cron** checks for overdue EMI payments
- Automatically applies late fee (configurable %)
- Overdraft fee and minimum balance fee enforcement
- **Waive penalty** (Admin / Staff with remarks)
- Penalty summary dashboard
- Per-loan penalty history

### 📊 Reports & Analytics

- Monthly account statement (JSON)
- User account overview summary
- Loan summary per user
- **System-wide report** (Admin) — total users, balances, loans, transactions
- **PDF export** — monthly statement downloadable as `.pdf`
- SQL views: `view_account_summary`, `view_transaction_summary`, `view_loan_summary`

### 🔔 Notifications

- In-app notification system per user
- Unread notification count badge
- Mark single / all notifications as read
- Delete notifications
- Auto-notify on: loan approval/rejection, EMI due, deposit approval, password reset

### 🛠️ Admin Control Panel (`/api/admin`)

- Create bank employees
- Activate / deactivate any user
- Lock / unlock accounts with reason
- Assign / change user roles
- Reset user passwords
- Freeze / unfreeze bank accounts
- Close accounts
- Modify per-account transaction limits
- Reverse transactions
- Set global transaction limits
- Configure fee structure
- Set interest rates (savings / checking)
- Set loan interest rates per type
- Configure penalty rules
- Set system currency
- View full audit logs

### 👷 Staff Panel (`/api/staff/accounts`)

- View all customers
- Search customers by name / email
- Customer detail view (accounts + loans)
- Customer account summary
- Staff-initiated deposit / withdraw / transfer on customer accounts
- Update account limits
- Freeze / unfreeze customer accounts

### 🏢 Loan Officers (`/api/loan-officers`)

- Dedicated loan officer review queue
- Approve / reject with remarks
- View all pending and processed loan applications

---

## 🗄️ Database Schema Overview

| Table             | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `users`           | All users — Admin, Employee, Customer                    |
| `accounts`        | Bank accounts (Savings / Checking / Loan / FD / RD)      |
| `transactions`    | All money movements with ACID guarantees                 |
| `loans`           | Loan applications and lifecycle tracking                 |
| `token_blacklist` | Invalidated JWT tokens (SHA-256 hash + expiry)           |
| `audit_logs`      | Admin action log (user, action, resource, IP, timestamp) |
| `system_config`   | Runtime-configurable settings (rates, limits, fees)      |

**Views:** `view_account_summary`, `view_transaction_summary`, `view_loan_summary`

**Stored Procedures:** `sp_get_user_balance`, `sp_monthly_transaction_stats`, `sp_get_pending_loans`, `sp_process_monthly_interest`

**Functions:** `fn_calculate_emi`, `fn_get_account_balance`

**Triggers:** `trg_check_balance_before_withdrawal` (prevents overdraft at DB level), `trg_account_update_log`

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```dotenv
# ─── Application ───────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ─── Database ──────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=banking_system

# ─── JWT ───────────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=24h

# ─── Redis (token blacklist) ────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ─── Encryption ────────────────────────────────────────────
ACCOUNT_ENCRYPTION_KEY=your-encryption-key-exactly-32-chars
```



---

## ⚡ Quick Start — One Command

Make sure **MySQL** and **Redis** are running, then from the project root:

```bash
bash start.sh
```

This script automatically:

1. Verifies MySQL is running
2. Creates and seeds the database if it does not exist
3. Installs backend `node_modules` if missing
4. Installs frontend `node_modules` if missing
5. Starts the NestJS API on **http://localhost:3001/api**
6. Starts the React dev server on **http://localhost:3000**

---

## 🔧 Manual Setup

### Prerequisites

| Tool    | Minimum Version |
| ------- | --------------- |
| Node.js | 18.x            |
| npm     | 9.x             |
| MySQL   | 8.0             |
| Redis   | 7.0             |

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/banking-system.git
cd banking-system
```

### Step 2 — Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### Step 3 — Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL root password and Redis settings
```

### Step 4 — Set up the database

Run the SQL files in order:

```bash
# Via CLI
mysql -u root -p < database/schema.sql
mysql -u root -p banking_system < database/admin-schema.sql
mysql -u root -p banking_system < database/procedures.sql
mysql -u root -p banking_system < database/seed.sql

# Or open each file in MySQL Workbench / DBeaver / TablePlus and execute
```

### Step 5 — Hash seed passwords

```bash
node scripts/update-passwords.js
```

### Step 6 — Start the backend

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

Backend → **http://localhost:3001/api**

### Step 7 — Start the frontend

```bash
cd client
npm run dev
```

Frontend → **http://localhost:3000**

---

## 🗃️ Full Database SQL

> Copy the entire block below and paste it into MySQL to get a **complete, ready-to-use database** — tables, views, triggers, stored procedures, functions, admin tables, default config, and seed data — in a single run.

```sql
-- ================================================================
-- BANKING SYSTEM — Complete Database Setup
-- Run this single script to get a fully working database.
-- ================================================================

CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- ────────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_users_email` (`email`),
  INDEX `IDX_users_role`  (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `account_number` VARCHAR(255)  NOT NULL UNIQUE,
  `account_type`   ENUM('SAVINGS','CHECKING','LOAN') NOT NULL DEFAULT 'SAVINGS',
  `balance`        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `currency`       VARCHAR(10)   NOT NULL DEFAULT 'USD',
  `user_id`        INT           NOT NULL,
  `created_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_accounts_account_number` (`account_number`),
  INDEX `IDX_accounts_user_id` (`user_id`),
  INDEX `IDX_accounts_type`    (`account_type`),
  CONSTRAINT `FK_accounts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `from_account_id` INT           NULL,
  `to_account_id`   INT           NULL,
  `amount`          DECIMAL(15,2) NOT NULL,
  `type`            ENUM('DEPOSIT','WITHDRAW','TRANSFER') NOT NULL,
  `status`          ENUM('PENDING','COMPLETED','FAILED')  NOT NULL DEFAULT 'PENDING',
  `description`     TEXT          NULL,
  `created_at`      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_transactions_from_account` (`from_account_id`),
  INDEX `IDX_transactions_to_account`   (`to_account_id`),
  INDEX `IDX_transactions_type`         (`type`),
  INDEX `IDX_transactions_status`       (`status`),
  INDEX `IDX_transactions_created_at`   (`created_at`),
  CONSTRAINT `FK_transactions_from_account`
    FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_transactions_to_account`
    FOREIGN KEY (`to_account_id`)   REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `loans` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `user_id`       INT           NOT NULL,
  `loan_type`     ENUM('PERSONAL','HOME','VEHICLE','EDUCATION') NOT NULL,
  `amount`        DECIMAL(15,2) NOT NULL,
  `interest_rate` DECIMAL(5,2)  NOT NULL,
  `tenure_months` INT           NOT NULL,
  `emi_amount`    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status`        ENUM('PENDING','APPROVED','REJECTED','CLOSED') NOT NULL DEFAULT 'PENDING',
  `remarks`       TEXT          NULL,
  `created_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_loans_user_id` (`user_id`),
  INDEX `IDX_loans_status`  (`status`),
  INDEX `IDX_loans_type`    (`loan_type`),
  CONSTRAINT `FK_loans_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `token_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of the JWT',
  `user_id`    INT         NULL,
  `type`       VARCHAR(20) NOT NULL DEFAULT 'logout' COMMENT 'logout | user_ban',
  `reason`     TEXT        NULL,
  `expires_at` DATETIME    NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_token_blacklist_hash`    (`token_hash`),
  INDEX        `IDX_token_blacklist_expires` (`expires_at`),
  INDEX        `IDX_token_blacklist_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_config` (
  `id`          INT          AUTO_INCREMENT PRIMARY KEY,
  `key`         VARCHAR(255) UNIQUE NOT NULL,
  `value`       TEXT         NOT NULL,
  `category`    VARCHAR(100) DEFAULT NULL,
  `description` TEXT         DEFAULT NULL,
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_config_key`      (`key`),
  INDEX `idx_config_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          INT          AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT          NOT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `resource`    VARCHAR(100) NOT NULL,
  `resource_id` INT          DEFAULT NULL,
  `details`     TEXT         DEFAULT NULL,
  `ip_address`  VARCHAR(45)  NOT NULL,
  `user_agent`  VARCHAR(255) DEFAULT NULL,
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_audit_user`     (`user_id`),
  INDEX `idx_audit_action`   (`action`),
  INDEX `idx_audit_resource` (`resource`),
  INDEX `idx_audit_created`  (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extend users: lock / active columns
ALTER TABLE `users`
  ADD COLUMN `isActive`    BOOLEAN   DEFAULT TRUE  AFTER `role`,
  ADD COLUMN `isLocked`    BOOLEAN   DEFAULT FALSE AFTER `isActive`,
  ADD COLUMN `locked_at`   TIMESTAMP NULL          AFTER `isLocked`,
  ADD COLUMN `lock_reason` TEXT      NULL          AFTER `locked_at`;

-- Extend accounts: freeze / limit / status columns
ALTER TABLE `accounts`
  ADD COLUMN `isFrozen`               BOOLEAN        DEFAULT FALSE AFTER `updated_at`,
  ADD COLUMN `frozen_at`              TIMESTAMP      NULL          AFTER `isFrozen`,
  ADD COLUMN `freeze_reason`          TEXT           NULL          AFTER `frozen_at`,
  ADD COLUMN `status`                 ENUM('ACTIVE','FROZEN','CLOSED') DEFAULT 'ACTIVE' AFTER `freeze_reason`,
  ADD COLUMN `closedAt`               TIMESTAMP      NULL          AFTER `status`,
  ADD COLUMN `closeReason`            TEXT           NULL          AFTER `closedAt`,
  ADD COLUMN `dailyWithdrawalLimit`   DECIMAL(15,2)  DEFAULT 10000.00  AFTER `closeReason`,
  ADD COLUMN `dailyTransferLimit`     DECIMAL(15,2)  DEFAULT 50000.00  AFTER `dailyWithdrawalLimit`,
  ADD COLUMN `monthlyWithdrawalLimit` DECIMAL(15,2)  DEFAULT 100000.00 AFTER `dailyTransferLimit`;

-- Performance indexes
CREATE INDEX `IDX_accounts_user_type`       ON `accounts`     (`user_id`,    `account_type`);
CREATE INDEX `IDX_transactions_date_status` ON `transactions`  (`created_at`, `status`);
CREATE INDEX `IDX_loans_user_status`        ON `loans`         (`user_id`,    `status`);
CREATE INDEX `idx_users_active`             ON `users`         (`isActive`);
CREATE INDEX `idx_users_locked`             ON `users`         (`isLocked`);
CREATE INDEX `idx_accounts_status`          ON `accounts`      (`status`);
CREATE INDEX `idx_accounts_frozen`          ON `accounts`      (`isFrozen`);

-- ────────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW `view_account_summary` AS
SELECT
  a.id AS account_id, a.account_number, a.account_type, a.balance, a.currency,
  u.id AS user_id, u.name AS user_name, u.email AS user_email, a.created_at
FROM accounts a INNER JOIN users u ON a.user_id = u.id;

CREATE OR REPLACE VIEW `view_transaction_summary` AS
SELECT
  t.id AS transaction_id, t.type, t.amount, t.status, t.description, t.created_at,
  fa.account_number AS from_account, ta.account_number AS to_account,
  fu.name AS from_user, tu.name AS to_user
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id   = ta.id
LEFT JOIN users fu ON fa.user_id = fu.id
LEFT JOIN users tu ON ta.user_id = tu.id;

CREATE OR REPLACE VIEW `view_loan_summary` AS
SELECT
  l.id AS loan_id, l.loan_type, l.amount, l.interest_rate,
  l.tenure_months, l.emi_amount, l.status, l.created_at,
  u.id AS user_id, u.name AS user_name, u.email AS user_email,
  (l.amount + (l.amount * l.interest_rate * l.tenure_months / 1200)) AS total_payable
FROM loans l INNER JOIN users u ON l.user_id = u.id;

-- ────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ────────────────────────────────────────────────────────────────

DELIMITER //

CREATE FUNCTION IF NOT EXISTS fn_calculate_emi(
  principal     DECIMAL(15,2),
  annual_rate   DECIMAL(5,2),
  tenure_months INT
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN
  DECLARE monthly_rate DECIMAL(10,8);
  DECLARE emi          DECIMAL(15,2);
  SET monthly_rate = annual_rate / 12 / 100;
  IF monthly_rate = 0 THEN
    SET emi = principal / tenure_months;
  ELSE
    SET emi = (principal * monthly_rate * POWER(1 + monthly_rate, tenure_months))
              / (POWER(1 + monthly_rate, tenure_months) - 1);
  END IF;
  RETURN ROUND(emi, 2);
END //

CREATE FUNCTION IF NOT EXISTS fn_get_account_balance(account_id INT)
RETURNS DECIMAL(15,2)
READS SQL DATA
BEGIN
  DECLARE current_balance DECIMAL(15,2);
  SELECT balance INTO current_balance FROM accounts WHERE id = account_id;
  RETURN COALESCE(current_balance, 0);
END //

DELIMITER ;

-- ────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────────

DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_check_balance_before_withdrawal
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
  DECLARE current_balance DECIMAL(15,2);
  IF NEW.type = 'WITHDRAW' AND NEW.from_account_id IS NOT NULL THEN
    SELECT balance INTO current_balance FROM accounts WHERE id = NEW.from_account_id;
    IF current_balance < NEW.amount THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance for withdrawal';
    END IF;
  END IF;
END //

DELIMITER ;

-- ────────────────────────────────────────────────────────────────
-- STORED PROCEDURES
-- ────────────────────────────────────────────────────────────────

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS sp_get_user_balance(IN p_user_id INT)
BEGIN
  SELECT u.id, u.name, u.email,
         COUNT(a.id) AS total_accounts,
         COALESCE(SUM(a.balance), 0) AS total_balance
  FROM users u
  LEFT JOIN accounts a ON u.id = a.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.name, u.email;
END //

CREATE PROCEDURE IF NOT EXISTS sp_monthly_transaction_stats(IN p_year INT, IN p_month INT)
BEGIN
  SELECT type, status,
         COUNT(*) AS transaction_count,
         SUM(amount) AS total_amount,
         AVG(amount) AS average_amount
  FROM transactions
  WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month
  GROUP BY type, status ORDER BY type, status;
END //

CREATE PROCEDURE IF NOT EXISTS sp_get_pending_loans()
BEGIN
  SELECT l.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
  FROM loans l INNER JOIN users u ON l.user_id = u.id
  WHERE l.status = 'PENDING'
  ORDER BY l.created_at ASC;
END //

DELIMITER ;

-- ────────────────────────────────────────────────────────────────
-- DEFAULT SYSTEM CONFIGURATION
-- ────────────────────────────────────────────────────────────────

INSERT INTO `system_config` (`key`, `value`, `category`, `description`) VALUES
  ('transaction.dailyTransferLimit',   '50000', 'limits',   'Default daily transfer limit per account'),
  ('transaction.dailyWithdrawalLimit', '10000', 'limits',   'Default daily withdrawal limit per account'),
  ('transaction.perTransactionLimit',  '25000', 'limits',   'Maximum amount per single transaction'),
  ('fees.transfer',                    '0',     'fees',     'Transfer fee in currency'),
  ('fees.withdrawal',                  '0',     'fees',     'Withdrawal fee in currency'),
  ('fees.monthlyMaintenance',          '5',     'fees',     'Monthly account maintenance fee'),
  ('interest.SAVINGS',                 '4',     'interest', 'Annual interest rate for savings accounts (%)'),
  ('interest.CHECKING',                '0',     'interest', 'Annual interest rate for checking accounts (%)'),
  ('loan.interest.PERSONAL',           '12',    'loan',     'Annual interest rate for personal loans (%)'),
  ('loan.interest.HOME',               '8',     'loan',     'Annual interest rate for home loans (%)'),
  ('loan.interest.VEHICLE',            '10',    'loan',     'Annual interest rate for vehicle loans (%)'),
  ('loan.interest.EDUCATION',          '6',     'loan',     'Annual interest rate for education loans (%)'),
  ('penalty.lateFeePercentage',        '2',     'penalty',  'Late payment fee percentage'),
  ('penalty.overdraftFee',             '35',    'penalty',  'Overdraft fee amount'),
  ('penalty.minimumBalanceFee',        '10',    'penalty',  'Fee for falling below minimum balance'),
  ('system.defaultCurrency',           'USD',   'system',   'Default system currency'),
  ('system.maintenanceMode',           'false', 'system',   'Enable/disable system maintenance mode')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ────────────────────────────────────────────────────────────────
-- SEED DATA  (Development / Testing)
-- Default password for all users: password123
-- After inserting, run: node scripts/update-passwords.js
-- ────────────────────────────────────────────────────────────────

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE loans;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (name, email, password, role, isActive) VALUES
  ('System Administrator', 'admin@banking.com',         '$2b$10$YourHashHere', 'ADMIN',    TRUE),
  ('John Employee',        'john.employee@banking.com', '$2b$10$YourHashHere', 'EMPLOYEE', TRUE),
  ('Sarah Manager',        'sarah.manager@banking.com', '$2b$10$YourHashHere', 'EMPLOYEE', TRUE),
  ('Alice Johnson',        'alice.johnson@example.com', '$2b$10$YourHashHere', 'CUSTOMER', TRUE),
  ('Bob Smith',            'bob.smith@example.com',     '$2b$10$YourHashHere', 'CUSTOMER', TRUE),
  ('Charlie Brown',        'charlie.brown@example.com', '$2b$10$YourHashHere', 'CUSTOMER', TRUE),
  ('Diana Prince',         'diana.prince@example.com',  '$2b$10$YourHashHere', 'CUSTOMER', TRUE),
  ('Eve Wilson',           'eve.wilson@example.com',    '$2b$10$YourHashHere', 'CUSTOMER', TRUE);

INSERT INTO accounts (account_number, account_type, balance, currency, user_id) VALUES
  ('1000000001', 'SAVINGS',  100000.00, 'USD', 1),
  ('1000000002', 'SAVINGS',   50000.00, 'USD', 2),
  ('1000000003', 'CHECKING',  30000.00, 'USD', 3),
  ('2000000001', 'SAVINGS',   25000.00, 'USD', 4),
  ('2000000002', 'CHECKING',  15000.00, 'USD', 4),
  ('2000000003', 'SAVINGS',   50000.00, 'USD', 5),
  ('2000000004', 'CHECKING',  20000.00, 'USD', 5),
  ('2000000005', 'SAVINGS',   35000.00, 'USD', 6),
  ('2000000006', 'SAVINGS',   45000.00, 'USD', 7),
  ('2000000007', 'CHECKING',  12000.00, 'USD', 8);

INSERT INTO transactions (from_account_id, to_account_id, amount, type, status, description, created_at) VALUES
  (NULL, 1, 100000.00, 'DEPOSIT',  'COMPLETED', 'Initial deposit',       '2024-01-01 10:00:00'),
  (NULL, 4,  25000.00, 'DEPOSIT',  'COMPLETED', 'Salary credit',         '2024-01-05 09:00:00'),
  (NULL, 5,  50000.00, 'DEPOSIT',  'COMPLETED', 'Salary credit',         '2024-01-05 09:00:00'),
  (NULL, 6,  35000.00, 'DEPOSIT',  'COMPLETED', 'Initial deposit',       '2024-01-10 11:00:00'),
  (4,    NULL, 5000.00,'WITHDRAW', 'COMPLETED', 'ATM withdrawal',        '2024-01-15 14:30:00'),
  (5,    NULL,10000.00,'WITHDRAW', 'COMPLETED', 'Cash withdrawal',       '2024-01-20 16:00:00'),
  (4,    5,   2000.00, 'TRANSFER', 'COMPLETED', 'Payment for services',  '2024-01-25 12:00:00'),
  (5,    6,   5000.00, 'TRANSFER', 'COMPLETED', 'Gift transfer',         '2024-02-01 10:30:00'),
  (6,    4,   1500.00, 'TRANSFER', 'COMPLETED', 'Loan repayment',        '2024-02-05 15:45:00'),
  (NULL, 4,   3000.00, 'DEPOSIT',  'COMPLETED', 'Freelance payment',     '2024-02-10 09:00:00'),
  (NULL, 5,   5000.00, 'DEPOSIT',  'COMPLETED', 'Bonus credit',          '2024-02-12 10:00:00'),
  (4,    8,    500.00, 'TRANSFER', 'COMPLETED', 'Utility bill payment',  '2024-02-14 14:00:00'),
  (5,    7,   1000.00, 'TRANSFER', 'COMPLETED', 'Monthly rent',          '2024-02-15 08:00:00');

INSERT INTO loans (user_id, loan_type, amount, interest_rate, tenure_months, emi_amount, status, remarks, created_at) VALUES
  (4, 'PERSONAL',  50000.00,  8.50,  36, 1575.45, 'APPROVED', 'Good credit history',       '2024-01-10 10:00:00'),
  (5, 'HOME',     500000.00,  7.50, 240, 4032.99, 'APPROVED', 'Approved for home purchase','2024-01-15 11:00:00'),
  (6, 'VEHICLE',  150000.00,  9.00,  60, 3112.61, 'APPROVED', 'Vehicle purchase',          '2024-01-20 14:00:00'),
  (7, 'EDUCATION',100000.00,  6.50,  84, 1544.37, 'APPROVED', 'Education loan',            '2024-02-01 09:00:00'),
  (8, 'PERSONAL',  75000.00,  8.50,  48, 1855.17, 'PENDING',   NULL,                       '2024-02-10 10:00:00'),
  (4, 'VEHICLE',  200000.00,  9.00,  60, 4150.15, 'PENDING',   NULL,                       '2024-02-12 11:00:00'),
  (5, 'PERSONAL', 100000.00, 10.00,  24, 4614.49, 'REJECTED', 'Insufficient income proof', '2024-01-25 15:00:00');

COMMIT;

-- ────────────────────────────────────────────────────────────────
-- QUICK REFERENCE QUERIES
-- ────────────────────────────────────────────────────────────────
-- SELECT * FROM view_account_summary;
-- SELECT * FROM view_transaction_summary;
-- SELECT * FROM view_loan_summary;
-- CALL sp_get_user_balance(1);
-- CALL sp_monthly_transaction_stats(2024, 2);
-- CALL sp_get_pending_loans();
-- SELECT fn_calculate_emi(50000, 8.5, 36) AS emi;
-- SELECT fn_get_account_balance(1) AS balance;
```

> After running the SQL, generate real bcrypt hashes for the seed users:
>
> ```bash
> node scripts/update-passwords.js
> ```

---

## 📡 API Endpoints Reference

All routes are prefixed with `/api`. A JWT Bearer token is required on all routes unless marked **Public**.

### Authentication — `/api/auth`

| Method | Endpoint        | Auth   | Description               |
| ------ | --------------- | ------ | ------------------------- |
| POST   | `/register`     | Public | Register a new user       |
| POST   | `/login`        | Public | Login and receive JWT     |
| POST   | `/logout`       | JWT    | Invalidate current token  |
| POST   | `/2fa/generate` | JWT    | Get 2FA secret + QR code  |
| POST   | `/2fa/enable`   | JWT    | Enable 2FA with TOTP code |
| POST   | `/2fa/disable`  | JWT    | Disable 2FA with password |
| POST   | `/2fa/verify`   | JWT    | Verify TOTP token         |

### Accounts — `/api/accounts`

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/`                              | Create a new bank account    |
| GET    | `/`                              | Get my accounts              |
| GET    | `/:id`                           | Get account details          |
| POST   | `/fixed-deposit`                 | Open a Fixed Deposit         |
| POST   | `/recurring-deposit`             | Open a Recurring Deposit     |
| GET    | `/deposit/:id/details`           | FD / RD account details      |
| GET    | `/:id/can-withdraw`              | Check withdrawal eligibility |
| DELETE | `/:id`                           | Request account deletion     |
| GET    | `/deletion-requests/my-requests` | My deletion requests         |

### Transactions — `/api/transactions`

| Method | Endpoint                        | Role             | Description                 |
| ------ | ------------------------------- | ---------------- | --------------------------- |
| POST   | `/deposit-requests`             | Customer         | Submit a deposit request    |
| GET    | `/deposit-requests`             | All              | View deposit requests       |
| PUT    | `/deposit-requests/:id/approve` | Admin / Employee | Approve deposit request     |
| PUT    | `/deposit-requests/:id/reject`  | Admin / Employee | Reject deposit request      |
| POST   | `/deposit`                      | All              | Direct deposit              |
| POST   | `/withdraw`                     | All              | Withdraw money              |
| POST   | `/transfer`                     | All              | Transfer to another account |
| GET    | `/`                             | All              | Transaction history         |
| GET    | `/validate-account`             | All              | Validate account number     |
| GET    | `/beneficiaries`                | All              | List saved beneficiaries    |
| POST   | `/beneficiaries`                | All              | Add beneficiary             |
| PUT    | `/beneficiaries/:id`            | All              | Update beneficiary          |
| DELETE | `/beneficiaries/:id`            | All              | Remove beneficiary          |

### Loans — `/api/loans`

| Method | Endpoint                  | Role             | Description              |
| ------ | ------------------------- | ---------------- | ------------------------ |
| POST   | `/apply`                  | Customer         | Apply for a loan         |
| GET    | `/`                       | All              | List loans (all or mine) |
| GET    | `/:id`                    | All              | Loan details             |
| GET    | `/:id/repayment-schedule` | All              | Full repayment schedule  |
| GET    | `/:id/payment-history`    | All              | EMI payment history      |
| GET    | `/:id/summary`            | All              | Loan summary             |
| GET    | `/:id/next-emi`           | All              | Next EMI details         |
| POST   | `/:id/pay-emi`            | Customer         | Pay an EMI installment   |
| PUT    | `/:id/approve`            | Admin / Employee | Approve loan             |
| PUT    | `/:id/reject`             | Admin / Employee | Reject loan              |

### Reports — `/api/reports`

| Method | Endpoint             | Role  | Description                       |
| ------ | -------------------- | ----- | --------------------------------- |
| GET    | `/monthly-statement` | All   | Monthly account statement (JSON)  |
| GET    | `/user-accounts`     | All   | My accounts overview              |
| GET    | `/account-summary`   | All   | Account balance summary           |
| GET    | `/loan-summary`      | All   | My loan summary                   |
| GET    | `/system`            | Admin | System-wide analytics report      |
| GET    | `/pdf/statement`     | All   | Download monthly statement as PDF |

### Notifications — `/api/notifications`

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | `/`             | List all notifications |
| GET    | `/unread-count` | Get unread count badge |
| POST   | `/:id/read`     | Mark one as read       |
| POST   | `/read-all`     | Mark all as read       |
| DELETE | `/:id`          | Delete a notification  |

### Admin Panel — `/api/admin` _(Admin only)_

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| POST   | `/users/employees`             | Create a bank employee          |
| PUT    | `/users/:id/activation`        | Activate / deactivate user      |
| PUT    | `/users/:id/role`              | Assign role                     |
| PUT    | `/users/:id/lock`              | Lock user account               |
| PUT    | `/users/:id/unlock`            | Unlock user account             |
| POST   | `/users/:id/reset-password`    | Reset user password             |
| PUT    | `/accounts/:id/freeze`         | Freeze bank account             |
| PUT    | `/accounts/:id/unfreeze`       | Unfreeze bank account           |
| PUT    | `/accounts/:id/close`          | Close bank account              |
| PUT    | `/accounts/:id/limits`         | Modify account limits           |
| POST   | `/transactions/:id/reverse`    | Reverse a completed transaction |
| PUT    | `/settings/transaction-limits` | Set global transaction limits   |
| PUT    | `/settings/fees`               | Configure fee structure         |
| PUT    | `/settings/interest`           | Set savings/checking interest   |
| PUT    | `/settings/loan-interest`      | Set loan interest rates         |
| PUT    | `/settings/penalty`            | Configure penalty rules         |
| PUT    | `/settings/currency`           | Set default system currency     |
| GET    | `/audit-logs`                  | View all audit logs             |

### Staff Panel — `/api/staff/accounts` _(Admin / Employee)_

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/customers`              | List all customers                 |
| GET    | `/customers/search?q=`    | Search customers                   |
| GET    | `/customers/:id`          | Customer detail + accounts + loans |
| GET    | `/customers/:id/summary`  | Customer account summary           |
| POST   | `/customers/:id/deposit`  | Staff-initiated deposit            |
| POST   | `/customers/:id/withdraw` | Staff-initiated withdrawal         |
| POST   | `/customers/:id/transfer` | Staff-initiated transfer           |
| PUT    | `/:id/limits`             | Update account limits              |
| PUT    | `/:id/freeze`             | Freeze account                     |

### Penalty — `/api/penalty` _(Admin / Employee)_

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| POST   | `/run`              | Manually trigger penalty check |
| GET    | `/summary`          | Penalty summary dashboard      |
| GET    | `/loan/:loanId`     | Penalties for a loan           |
| POST   | `/:penaltyId/waive` | Waive a penalty with remarks   |

### Interest — `/api/interest` _(Admin)_

| Method | Endpoint   | Description                     |
| ------ | ---------- | ------------------------------- |
| POST   | `/apply`   | Manually apply monthly interest |
| GET    | `/summary` | Interest application summary    |

---

## 🔑 Default Test Credentials

> All seed users share the password **`password123`** after running `node scripts/update-passwords.js`.

| Role     | Email                     | Password    |
| -------- | ------------------------- | ----------- |
| Admin    | admin@banking.com         | password123 |
| Employee | john.employee@banking.com | password123 |
| Employee | sarah.manager@banking.com | password123 |
| Customer | alice.johnson@example.com | password123 |
| Customer | bob.smith@example.com     | password123 |
| Customer | charlie.brown@example.com | password123 |
| Customer | diana.prince@example.com  | password123 |
| Customer | eve.wilson@example.com    | password123 |

---

## 📜 Scripts Reference

### Backend (project root)

```bash
npm run start:dev      # Development with hot reload
npm run start:prod     # Production (runs dist/main.js)
npm run build          # Compile TypeScript → dist/
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report
npm run lint           # ESLint auto-fix
npm run format         # Prettier format
```

### Frontend (`/client`)

```bash
npm run dev       # Vite dev server  →  http://localhost:5173
npm run build     # Production build →  client/dist/
npm run preview   # Preview production build locally
```

### Database helpers

```bash
# Re-hash all seed passwords with bcrypt
node scripts/update-passwords.js

# Backup database
mysqldump -u root -p banking_system > backup.sql

# Restore database
mysql -u root -p banking_system < backup.sql

# Run stored procedures
mysql -u root -p -e "USE banking_system; CALL sp_get_pending_loans();"
mysql -u root -p -e "USE banking_system; CALL sp_monthly_transaction_stats(2024, 2);"
mysql -u root -p -e "USE banking_system; SELECT fn_calculate_emi(50000, 8.5, 36) AS emi;"
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.
