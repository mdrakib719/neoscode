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
| **Database**          | MariaDB 10.4 / MySQL 8 (InnoDB, UTF8MB4)           |
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

| Table                       | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `users`                     | All users — Admin, Employee, Customer (with 2FA, lock/active)             |
| `accounts`                  | Savings / Checking / Loan / Fixed Deposit / Recurring Deposit             |
| `account_deletion_requests` | Customer-initiated account deletion workflow (pending → approved)         |
| `beneficiaries`             | Saved transfer targets per user (soft-delete via `is_active`)             |
| `deposit_requests`          | Deposit request workflow — customer submits, admin approves               |
| `transactions`              | All money movements (DEPOSIT / WITHDRAW / TRANSFER / EXTERNAL / REVERSAL) |
| `loans`                     | Loan applications, lifecycle, EMI schedule + penalty tracking             |
| `loan_payments`             | Individual EMI payment records per loan installment                       |
| `loan_penalties`            | Late-payment penalty records (PENDING / COLLECTED / WAIVED)               |
| `notifications`             | In-app notifications (TRANSACTION / LOAN / ACCOUNT / SECURITY / GENERAL)  |
| `token_blacklist`           | Invalidated JWT tokens stored as SHA-256 hash + expiry                    |
| `audit_logs`                | Admin action log — action, resource, IP, user agent, timestamp            |
| `system_config`             | Runtime key-value config: rates, limits, fees, currency                   |

**Views:** `view_account_summary`, `view_transaction_summary`, `view_loan_summary`

**Stored Procedures:** `sp_get_user_balance`, `sp_monthly_transaction_stats`, `sp_get_pending_loans`

**Functions:** `fn_calculate_emi`, `fn_get_account_balance`

**Triggers:** `trg_check_balance_before_withdrawal` — prevents overdraft at the DB level

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
DB_PORT=3306
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

> **Note:** `.env.example` shows `DB_PORT=3307`. Change to `3306` if using a standard MySQL installation.

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
6. Starts the React dev server on **http://localhost:5173**

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

**Option A — Import the full dump (recommended)**

```bash
mysql -u root -p < banking_system.sql
```

**Option B — Run individual SQL files**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p banking_system < database/admin-schema.sql
mysql -u root -p banking_system < database/procedures.sql
mysql -u root -p banking_system < database/seed.sql
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

Frontend → **http://localhost:5173**

---

## 🗃️ Full Database SQL

> The file `banking_system.sql` (exported from phpMyAdmin / MariaDB 10.4) contains a **complete, ready-to-use dump** — all tables, views, triggers, stored procedures, functions, default config, and seed data in one file.

```bash
# Import in one command
mysql -u root -p < banking_system.sql
```

Or paste the DDL below into MySQL Workbench / DBeaver / TablePlus to create an empty schema ready for the application:

```sql
-- ================================================================
-- BANKING SYSTEM — Schema DDL
-- Server: MariaDB 10.4+ / MySQL 8+  |  Charset: utf8mb4
-- ================================================================

CREATE DATABASE IF NOT EXISTS banking_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE banking_system;

-- ────────────────────────────────────────────────────────────────
-- CORE TABLES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE `users` (
  `id`                  INT(11)      NOT NULL AUTO_INCREMENT,
  `name`                VARCHAR(255) NOT NULL,
  `email`               VARCHAR(255) NOT NULL,
  `password`            VARCHAR(255) NOT NULL,
  `role`                ENUM('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `isActive`            TINYINT(4)   NOT NULL DEFAULT 1,
  `isLocked`            TINYINT(4)   NOT NULL DEFAULT 0,
  `locked_at`           TIMESTAMP    NULL DEFAULT NULL,
  `lock_reason`         TEXT         DEFAULT NULL,
  `two_factor_secret`   TEXT         DEFAULT NULL,
  `two_factor_enabled`  TINYINT(4)   NOT NULL DEFAULT 0,
  `created_at`          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `accounts` (
  `id`                     INT(11)       NOT NULL AUTO_INCREMENT,
  `account_number`         VARCHAR(255)  NOT NULL,
  `account_type`           ENUM('SAVINGS','CHECKING','LOAN','FIXED_DEPOSIT','RECURRING_DEPOSIT')
                                         NOT NULL DEFAULT 'SAVINGS',
  `balance`                DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `user_id`                INT(11)       NOT NULL,
  `currency`               VARCHAR(255)  NOT NULL DEFAULT 'USD',
  `isFrozen`               TINYINT(4)    NOT NULL DEFAULT 0,
  `frozen_at`              TIMESTAMP     NULL DEFAULT NULL,
  `freeze_reason`          TEXT          DEFAULT NULL,
  `status`                 VARCHAR(255)  NOT NULL DEFAULT 'ACTIVE',
  `closedAt`               TIMESTAMP     NULL DEFAULT NULL,
  `closeReason`            TEXT          DEFAULT NULL,
  `dailyWithdrawalLimit`   DECIMAL(15,2) DEFAULT NULL,
  `dailyTransferLimit`     DECIMAL(15,2) DEFAULT NULL,
  `monthlyWithdrawalLimit` DECIMAL(15,2) DEFAULT NULL,
  -- Fixed Deposit / Recurring Deposit fields
  `maturity_date`          DATE          DEFAULT NULL,
  `lock_period_months`     INT(11)       DEFAULT NULL,
  `deposit_interest_rate`  DECIMAL(5,2)  DEFAULT NULL,
  `monthly_deposit_amount` DECIMAL(15,2) DEFAULT NULL,
  `maturity_amount`        DECIMAL(15,2) DEFAULT NULL,
  `deposit_start_date`     DATE          DEFAULT NULL,
  -- Soft-delete
  `deleted_at`             TIMESTAMP     NULL DEFAULT NULL,
  `deletion_reason`        TEXT          DEFAULT NULL,
  `created_at`             DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`             DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`account_number`),
  KEY (`user_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_deletion_requests` (
  `id`                 INT(11)       NOT NULL AUTO_INCREMENT,
  `account_id`         INT(11)       NOT NULL,
  `user_id`            INT(11)       NOT NULL,
  `balance_at_request` DECIMAL(15,2) NOT NULL,
  `reason`             TEXT          DEFAULT NULL,
  `status`             VARCHAR(255)  NOT NULL DEFAULT 'PENDING',
  `admin_remarks`      TEXT          DEFAULT NULL,
  `processed_by`       INT(11)       DEFAULT NULL,
  `processed_at`       TIMESTAMP     NULL DEFAULT NULL,
  `created_at`         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`account_id`), KEY (`user_id`), KEY (`processed_by`),
  CONSTRAINT FOREIGN KEY (`account_id`)   REFERENCES `accounts`(`id`),
  CONSTRAINT FOREIGN KEY (`user_id`)      REFERENCES `users`(`id`),
  CONSTRAINT FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `beneficiaries` (
  `id`               INT(11)       NOT NULL AUTO_INCREMENT,
  `user_id`          INT(11)       NOT NULL,
  `beneficiary_name` VARCHAR(255)  NOT NULL,
  `account_number`   VARCHAR(255)  NOT NULL,
  `bank_name`        VARCHAR(255)  DEFAULT NULL,
  `ifsc_code`        VARCHAR(255)  DEFAULT NULL,
  `notes`            TEXT          DEFAULT NULL,
  `is_active`        TINYINT(4)    NOT NULL DEFAULT 1,
  `created_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`user_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `deposit_requests` (
  `id`            INT(11)       NOT NULL AUTO_INCREMENT,
  `user_id`       INT(11)       NOT NULL,
  `account_id`    INT(11)       NOT NULL,
  `amount`        DECIMAL(15,2) NOT NULL,
  `status`        ENUM('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'PENDING',
  `description`   TEXT          DEFAULT NULL,
  `admin_remarks` TEXT          DEFAULT NULL,
  `approved_by`   INT(11)       DEFAULT NULL,
  `processed_at`  TIMESTAMP     NULL DEFAULT NULL,
  `created_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`user_id`), KEY (`account_id`), KEY (`approved_by`),
  CONSTRAINT FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`),
  CONSTRAINT FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`),
  CONSTRAINT FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `transactions` (
  `id`                       INT(11)       NOT NULL AUTO_INCREMENT,
  `from_account_id`          INT(11)       DEFAULT NULL,
  `to_account_id`            INT(11)       DEFAULT NULL,
  `amount`                   DECIMAL(15,2) NOT NULL,
  `type`                     ENUM('DEPOSIT','WITHDRAW','TRANSFER','EXTERNAL_TRANSFER','REVERSAL') NOT NULL,
  `status`                   ENUM('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'PENDING',
  `description`              TEXT          DEFAULT NULL,
  `transfer_type`            VARCHAR(20)   DEFAULT NULL,          -- 'INTERNAL' | 'EXTERNAL'
  `external_bank_name`       VARCHAR(255)  DEFAULT NULL,
  `external_account_number`  VARCHAR(255)  DEFAULT NULL,
  `external_beneficiary_name` VARCHAR(255) DEFAULT NULL,
  `external_ifsc_code`       VARCHAR(255)  DEFAULT NULL,
  `created_at`               DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`from_account_id`), KEY (`to_account_id`),
  CONSTRAINT FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`),
  CONSTRAINT FOREIGN KEY (`to_account_id`)   REFERENCES `accounts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loans` (
  `id`                INT(11)       NOT NULL AUTO_INCREMENT,
  `user_id`           INT(11)       NOT NULL,
  `loan_type`         ENUM('PERSONAL','HOME','VEHICLE','EDUCATION') NOT NULL,
  `amount`            DECIMAL(15,2) NOT NULL,
  `interest_rate`     DECIMAL(5,2)  NOT NULL,
  `tenure_months`     INT(11)       NOT NULL,
  `emi_amount`        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status`            ENUM('PENDING','APPROVED','REJECTED','CLOSED') NOT NULL DEFAULT 'PENDING',
  `remarks`           TEXT          DEFAULT NULL,
  `remaining_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `paid_installments` INT(11)       NOT NULL DEFAULT 0,
  `grace_period_days` INT(11)       NOT NULL DEFAULT 5,
  `penalty_rate`      DECIMAL(5,2)  NOT NULL DEFAULT 2.00,
  `total_penalty`     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `created_at`        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`user_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loan_payments` (
  `id`                  INT(11)       NOT NULL AUTO_INCREMENT,
  `loan_id`             INT(11)       NOT NULL,
  `installment_number`  INT(11)       NOT NULL,
  `amount_paid`         DECIMAL(15,2) NOT NULL,
  `principal_amount`    DECIMAL(15,2) NOT NULL,
  `interest_amount`     DECIMAL(15,2) NOT NULL,
  `penalty_amount`      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `outstanding_balance` DECIMAL(15,2) NOT NULL,
  `status`              ENUM('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'COMPLETED',
  `due_date`            DATE          NOT NULL,
  `paid_date`           DATE          DEFAULT NULL,
  `remarks`             TEXT          DEFAULT NULL,
  `created_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`loan_id`),
  CONSTRAINT FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `loan_penalties` (
  `id`                  INT(11)       NOT NULL AUTO_INCREMENT,
  `loan_id`             INT(11)       NOT NULL,
  `installment_number`  INT(11)       NOT NULL,
  `due_date`            DATE          NOT NULL,
  `days_overdue`        INT(11)       NOT NULL DEFAULT 0,
  `emi_amount`          DECIMAL(15,2) NOT NULL,
  `penalty_amount`      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `penalty_rate_used`   DECIMAL(5,2)  NOT NULL DEFAULT 2.00,
  `status`              ENUM('PENDING','COLLECTED','WAIVED') NOT NULL DEFAULT 'PENDING',
  `penalty_start_date`  DATE          DEFAULT NULL,
  `resolved_date`       DATE          DEFAULT NULL,
  `remarks`             TEXT          DEFAULT NULL,
  `created_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`loan_id`),
  CONSTRAINT FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notifications` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11)      NOT NULL,
  `type`       ENUM('TRANSACTION','LOAN','ACCOUNT','SECURITY','GENERAL') NOT NULL,
  `channel`    ENUM('EMAIL','SMS','IN_APP') NOT NULL,
  `title`      VARCHAR(255) NOT NULL,
  `message`    TEXT         NOT NULL,
  `is_read`    TINYINT(4)   NOT NULL DEFAULT 0,
  `read_at`    TIMESTAMP    NULL DEFAULT NULL,
  `is_sent`    TINYINT(4)   NOT NULL DEFAULT 0,
  `sent_at`    TIMESTAMP    NULL DEFAULT NULL,
  `metadata`   LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
               CHECK (JSON_VALID(`metadata`)),
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`user_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `token_blacklist` (
  `id`         INT(11)     NOT NULL AUTO_INCREMENT,
  `token_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash — never raw JWT',
  `user_id`    INT(11)     DEFAULT NULL,
  `type`       VARCHAR(20) NOT NULL DEFAULT 'logout',
  `reason`     TEXT        DEFAULT NULL,
  `expires_at` DATETIME    NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`token_hash`),
  KEY (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `system_config` (
  `id`          INT(11)      NOT NULL AUTO_INCREMENT,
  `key`         VARCHAR(255) NOT NULL,
  `value`       TEXT         NOT NULL,
  `category`    VARCHAR(255) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id`          INT(11)      NOT NULL AUTO_INCREMENT,
  `user_id`     INT(11)      NOT NULL,
  `resource_id` INT(11)      DEFAULT NULL,
  `details`     TEXT         DEFAULT NULL,
  `user_agent`  VARCHAR(255) DEFAULT NULL,
  `action`      VARCHAR(255) NOT NULL,
  `resource`    VARCHAR(255) NOT NULL,
  `ip_address`  VARCHAR(255) NOT NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY (`user_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW `view_account_summary` AS
SELECT a.id AS account_id, a.account_number, a.account_type,
       a.balance, a.currency, u.id AS user_id,
       u.name AS user_name, u.email AS user_email, a.created_at
FROM accounts a JOIN users u ON a.user_id = u.id;

CREATE OR REPLACE VIEW `view_transaction_summary` AS
SELECT t.id AS transaction_id, t.type, t.amount, t.status,
       t.description, t.created_at,
       fa.account_number AS from_account, ta.account_number AS to_account,
       fu.name AS from_user, tu.name AS to_user
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id   = ta.id
LEFT JOIN users fu ON fa.user_id = fu.id
LEFT JOIN users tu ON ta.user_id = tu.id;

CREATE OR REPLACE VIEW `view_loan_summary` AS
SELECT l.id AS loan_id, l.loan_type, l.amount, l.interest_rate,
       l.tenure_months, l.emi_amount, l.status, l.created_at,
       u.id AS user_id, u.name AS user_name, u.email AS user_email,
       l.amount + l.amount * l.interest_rate * l.tenure_months / 1200 AS total_payable
FROM loans l JOIN users u ON l.user_id = u.id;

-- ────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ────────────────────────────────────────────────────────────────

DELIMITER //

CREATE FUNCTION IF NOT EXISTS fn_calculate_emi(
  principal     DECIMAL(15,2),
  annual_rate   DECIMAL(5,2),
  tenure_months INT
) RETURNS DECIMAL(15,2) DETERMINISTIC
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

CREATE FUNCTION IF NOT EXISTS fn_get_account_balance(p_account_id INT)
RETURNS DECIMAL(15,2) READS SQL DATA
BEGIN
  DECLARE bal DECIMAL(15,2);
  SELECT balance INTO bal FROM accounts WHERE id = p_account_id;
  RETURN COALESCE(bal, 0);
END //

DELIMITER ;

-- ────────────────────────────────────────────────────────────────
-- TRIGGER
-- ────────────────────────────────────────────────────────────────

DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_check_balance_before_withdrawal
BEFORE INSERT ON transactions FOR EACH ROW
BEGIN
  DECLARE cur_bal DECIMAL(15,2);
  IF NEW.type = 'WITHDRAW' AND NEW.from_account_id IS NOT NULL THEN
    SELECT balance INTO cur_bal FROM accounts WHERE id = NEW.from_account_id;
    IF cur_bal < NEW.amount THEN
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
  FROM users u LEFT JOIN accounts a ON u.id = a.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.name, u.email;
END //

CREATE PROCEDURE IF NOT EXISTS sp_monthly_transaction_stats(IN p_year INT, IN p_month INT)
BEGIN
  SELECT type, status,
         COUNT(*) AS transaction_count,
         SUM(amount) AS total_amount,
         AVG(amount) AS avg_amount
  FROM transactions
  WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month
  GROUP BY type, status ORDER BY type, status;
END //

CREATE PROCEDURE IF NOT EXISTS sp_get_pending_loans()
BEGIN
  SELECT l.*, u.name AS user_name, u.email AS user_email
  FROM loans l JOIN users u ON l.user_id = u.id
  WHERE l.status = 'PENDING'
  ORDER BY l.created_at ASC;
END //

DELIMITER ;

-- ────────────────────────────────────────────────────────────────
-- DEFAULT SYSTEM CONFIGURATION
-- ────────────────────────────────────────────────────────────────

INSERT INTO system_config (`key`, `value`, `category`, `description`) VALUES
  ('transaction.dailyTransferLimit',   '50000', NULL, NULL),
  ('transaction.dailyWithdrawalLimit', '10000', NULL, NULL),
  ('transaction.perTransactionLimit',  '25000', NULL, NULL),
  ('fees.transfer',                    '0',     NULL, NULL),
  ('fees.withdrawal',                  '0',     NULL, NULL),
  ('fees.monthlyMaintenance',          '5',     NULL, NULL),
  ('interest.SAVINGS',                 '6',     NULL, NULL),   -- 6 % p.a.
  ('interest.CHECKING',                '0',     NULL, NULL),
  ('loan.interest.PERSONAL',           '12',    NULL, NULL),
  ('loan.interest.HOME',               '8',     NULL, NULL),
  ('loan.interest.VEHICLE',            '10',    NULL, NULL),
  ('loan.interest.EDUCATION',          '6',     NULL, NULL),
  ('penalty.lateFeePercentage',        '2',     NULL, NULL),
  ('penalty.overdraftFee',             '35',    NULL, NULL),
  ('penalty.minimumBalanceFee',        '10',    NULL, NULL),
  ('system.defaultCurrency',           'USD',   NULL, NULL),
  ('system.maintenanceMode',           'false', NULL, NULL)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ────────────────────────────────────────────────────────────────
-- SEED / TEST USERS  (password: password123)
-- bcrypt hash: $2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi
-- ────────────────────────────────────────────────────────────────

INSERT INTO users (name, email, password, role, isActive) VALUES
  ('Test Customer', 'customer@banking.com',  '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', 1),
  ('test',          'test@gmail.com',         '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', 1),
  ('admin',         'admin@banking.com',      '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'ADMIN',    1),
  ('rakib',         'rakib@gmail.com',         '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'EMPLOYEE', 1),
  ('rakib',         'mdrakib789@gmail.com',    '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', 1);

-- ────────────────────────────────────────────────────────────────
-- QUICK-REFERENCE QUERIES
-- ────────────────────────────────────────────────────────────────
-- SELECT * FROM view_account_summary;
-- SELECT * FROM view_transaction_summary;
-- SELECT * FROM view_loan_summary;
-- CALL sp_get_user_balance(1);
-- CALL sp_monthly_transaction_stats(2026, 2);
-- CALL sp_get_pending_loans();
-- SELECT fn_calculate_emi(50000, 8.5, 36) AS emi;
-- SELECT fn_get_account_balance(1) AS balance;
```

> The seed users above all have the password **`password123`** pre-hashed with bcrypt (10 rounds). No need to run the password script when importing from the SQL dump.

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

> All seed users share the password **`password123`** (bcrypt-hashed and included in `banking_system.sql` — no extra step needed).

| Role     | Name          | Email                | Password    | Notes              |
| -------- | ------------- | -------------------- | ----------- | ------------------ |
| Admin    | admin         | admin@banking.com    | password123 |                    |
| Employee | rakib         | rakib@gmail.com      | password123 |                    |
| Customer | Test Customer | customer@banking.com | password123 |                    |
| Customer | test          | test@gmail.com       | password123 |                    |
| Customer | rakib         | mdrakib789@gmail.com | password123 |                    |
| Customer | Bulbul        | bulbul@gmail.com     | password123 | 2FA enabled (TOTP) |

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
