# 🏦 Banking System — Full Stack

> A production-grade **Banking Management System** built with **NestJS** (backend), **React + Vite** (frontend), **MySQL**, and **Redis**. Supports multi-role access (Admin / Employee / Customer), real-time notifications, loan lifecycle management, automated interest & penalty engines, PDF report exports, JWT + 2FA authentication, and much more.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [UI Navigation — All Features](#ui-navigation--all-features)
- [Database Schema Overview](#database-schema-overview)
- [Environment Setup](#environment-setup)
- [Quick Start — One Command](#-quick-start--one-command)
- [Manual Setup](#-manual-setup)
- [Full Database SQL](#full-database-sql)
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

## Database Schema Overview

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

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```dotenv
# ─── Application ───────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ─── Database ──────────────────────────────────────────────
DB_HOST=sql12.freesqldatabase.com
DB_PORT=3306
DB_USERNAME=sql12817522
DB_PASSWORD=BMMtdwFMxD
DB_DATABASE=sql12817522

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

Frontend → **http://localhost:3000**

---

## Full Database SQL

> The file `banking_system.sql` (exported from phpMyAdmin / MariaDB 10.4) contains a **complete, ready-to-use dump** — all tables, views, triggers, stored procedures, functions, default config, and seed data in one file.

```bash
# Import in one command
mysql -u root -p < banking_system.sql
```

Or paste the DDL below into MySQL Workbench / DBeaver / TablePlus to create an empty schema ready for the application:

```sql
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 19, 2026 at 09:45 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banking_system`
--
CREATE DATABASE IF NOT EXISTS banking_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE banking_system;
-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `account_type` enum('SAVINGS','CHECKING','LOAN','FIXED_DEPOSIT','RECURRING_DEPOSIT') NOT NULL DEFAULT 'SAVINGS',
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `user_id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `currency` varchar(255) NOT NULL DEFAULT 'USD',
  `isFrozen` tinyint(4) NOT NULL DEFAULT 0,
  `frozen_at` timestamp NULL DEFAULT NULL,
  `freeze_reason` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `closedAt` timestamp NULL DEFAULT NULL,
  `closeReason` text DEFAULT NULL,
  `dailyWithdrawalLimit` decimal(15,2) DEFAULT NULL,
  `dailyTransferLimit` decimal(15,2) DEFAULT NULL,
  `monthlyWithdrawalLimit` decimal(15,2) DEFAULT NULL,
  `maturity_date` date DEFAULT NULL,
  `lock_period_months` int(11) DEFAULT NULL,
  `deposit_interest_rate` decimal(5,2) DEFAULT NULL,
  `monthly_deposit_amount` decimal(15,2) DEFAULT NULL,
  `maturity_amount` decimal(15,2) DEFAULT NULL,
  `deposit_start_date` date DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deletion_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `account_number`, `account_type`, `balance`, `user_id`, `created_at`, `updated_at`, `currency`, `isFrozen`, `frozen_at`, `freeze_reason`, `status`, `closedAt`, `closeReason`, `dailyWithdrawalLimit`, `dailyTransferLimit`, `monthlyWithdrawalLimit`, `maturity_date`, `lock_period_months`, `deposit_interest_rate`, `monthly_deposit_amount`, `maturity_amount`, `deposit_start_date`, `deleted_at`, `deletion_reason`) VALUES
(1, '492973920626', 'SAVINGS', 162417.95, 2, '2026-02-17 23:28:17.397650', '2026-02-18 03:28:29.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, '493614434477', 'FIXED_DEPOSIT', 8070.00, 2, '2026-02-17 23:29:21.447719', '2026-02-18 03:07:21.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2026-05-17', 3, 7.50, NULL, 10182.45, '2026-02-17', NULL, NULL),
(3, '493628290198', 'FIXED_DEPOSIT', 7256.36, 2, '2026-02-17 23:29:22.830023', '2026-02-19 01:34:26.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2026-05-17', 3, 7.50, NULL, 10182.45, '2026-02-17', NULL, NULL),
(4, '496326949573', 'SAVINGS', 2210.01, 1, '2026-02-17 23:33:52.696448', '2026-02-19 14:36:35.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, '613260814400', 'FIXED_DEPOSIT', 10851.00, 1, '2026-02-18 02:48:46.085092', '2026-02-19 14:36:35.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2026-06-18', 4, 7.50, NULL, 10244.00, '2026-02-18', NULL, NULL),
(6, '468239429010', 'SAVINGS', 104750.02, 6, '2026-02-19 02:33:43.948348', '2026-02-19 04:48:46.000000', 'USD', 0, NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `account_deletion_requests`
--

CREATE TABLE `account_deletion_requests` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `balance_at_request` decimal(15,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `admin_remarks` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_deletion_requests`
--

INSERT INTO `account_deletion_requests` (`id`, `account_id`, `user_id`, `balance_at_request`, `reason`, `status`, `admin_remarks`, `processed_by`, `processed_at`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 8070.00, 'User requested deletion', 'PENDING', NULL, NULL, NULL, '2026-02-18 03:26:44.029827', '2026-02-18 03:26:44.029827');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `resource` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `resource_id`, `details`, `user_agent`, `action`, `resource`, `ip_address`, `created_at`) VALUES
(1, 3, NULL, '{\"dailyTransferLimit\":50000,\"dailyWithdrawalLimit\":10000,\"perTransactionLimit\":25000}', 'Admin Panel', 'SET_TRANSACTION_LIMITS', 'config', '0.0.0.0', '2026-02-17 21:38:47.948839'),
(2, 3, 4, 'Created employee: rakib@gmail.com', 'Admin Panel', 'CREATE_EMPLOYEE', 'user', '0.0.0.0', '2026-02-17 21:39:22.280965'),
(3, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:22:21.492843'),
(4, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:22:25.889231'),
(5, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:22:33.813575'),
(6, 3, 2, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:22:37.877648'),
(7, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:23:32.110613'),
(8, 3, 1, 'no for test perpose', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-17 22:24:46.731027'),
(9, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:25:09.021231'),
(10, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:27:09.344813'),
(11, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:29:41.114405'),
(12, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:30:21.931080'),
(13, 3, 2, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-17 22:30:44.488701'),
(14, 3, 1, 'test', 'Admin Panel', 'FREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 01:11:20.460686'),
(15, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 01:11:44.684425'),
(16, 3, 4, 'test', 'Admin Panel', 'FREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 02:15:28.447450'),
(17, 3, 4, 't', 'Admin Panel', 'UNFREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 02:18:48.303620'),
(18, 3, 4, 'h', 'Admin Panel', 'FREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 02:33:07.658472'),
(19, 3, 4, 'j', 'Admin Panel', 'UNFREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 02:34:30.499507'),
(20, 3, 11, 'h', 'Admin Panel', 'REVERSE_TRANSACTION', 'transaction', '0.0.0.0', '2026-02-18 02:35:42.964609'),
(21, 3, NULL, '{\"accountType\":\"SAVINGS\",\"interestRate\":6}', 'Admin Panel', 'SET_INTEREST_RATE', 'config', '0.0.0.0', '2026-02-18 02:36:50.607230'),
(22, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 02:42:48.053580'),
(23, 3, 1, 'b', 'Admin Panel', 'UNFREEZE_ACCOUNT', 'account', '0.0.0.0', '2026-02-18 03:28:29.287169'),
(24, 3, 1, 'j', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:04:28.287897'),
(25, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 04:05:24.079258'),
(26, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 04:05:27.517978'),
(27, 3, 1, 'j', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:16:37.509622'),
(28, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 04:21:23.897104'),
(29, 3, 1, 'h', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:33:32.279284'),
(30, 3, 1, 'j', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:33:51.940936'),
(31, 3, 1, 'j', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:34:36.562800'),
(32, 3, 1, 'j', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:47:49.818052'),
(33, 3, 1, 'j', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:48:32.496786'),
(34, 3, 1, 'j', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 04:59:27.737012'),
(35, 3, 1, 'n', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-18 05:00:06.560882'),
(36, 3, 2, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-18 05:00:10.258636'),
(37, 3, 2, 'm', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-18 05:03:05.818499'),
(38, 3, 2, 'k', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-18 05:03:18.528388'),
(39, 3, 1, 'No reason provided', 'Admin Panel', 'DEACTIVATE_USER', 'user', '0.0.0.0', '2026-02-19 01:04:16.440163'),
(40, 3, 1, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-19 01:04:25.593524'),
(41, 3, 6, 'No reason provided', 'Admin Panel', 'DEACTIVATE_USER', 'user', '0.0.0.0', '2026-02-19 03:13:46.556893'),
(42, 3, 6, 'No reason provided', 'Admin Panel', 'ACTIVATE_USER', 'user', '0.0.0.0', '2026-02-19 03:13:58.967491'),
(43, 3, 6, 'denger ', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-19 03:14:14.394634'),
(44, 3, 6, 'done', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-19 03:14:27.233469'),
(45, 3, 6, 'r', 'Admin Panel', 'LOCK_USER', 'user', '0.0.0.0', '2026-02-19 03:59:40.721854'),
(46, 3, 6, 'g', 'Admin Panel', 'UNLOCK_USER', 'user', '0.0.0.0', '2026-02-19 04:00:41.683687');

-- --------------------------------------------------------

--
-- Table structure for table `beneficiaries`
--

CREATE TABLE `beneficiaries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `beneficiary_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `ifsc_code` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beneficiaries`
--

INSERT INTO `beneficiaries` (`id`, `user_id`, `beneficiary_name`, `account_number`, `bank_name`, `ifsc_code`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 'test', '2', 'test', '1350', '', 1, '2026-02-18 01:57:40.280447', '2026-02-18 01:57:40.280447');

-- --------------------------------------------------------

--
-- Table structure for table `deposit_requests`
--

CREATE TABLE `deposit_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'PENDING',
  `description` text DEFAULT NULL,
  `admin_remarks` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deposit_requests`
--

INSERT INTO `deposit_requests` (`id`, `user_id`, `account_id`, `amount`, `status`, `description`, `admin_remarks`, `approved_by`, `processed_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1200.00, 'COMPLETED', 'Deposit request', 'test', 3, '2026-02-17 19:54:56', '2026-02-18 01:54:13.758379', '2026-02-18 01:54:56.000000'),
(2, 2, 2, 1000.00, 'PENDING', 'test', NULL, NULL, NULL, '2026-02-18 02:48:01.440026', '2026-02-18 02:48:01.440026'),
(3, 6, 6, 100000.00, 'COMPLETED', 'Deposit request', 'done', 3, '2026-02-18 20:34:26', '2026-02-19 02:34:00.633955', '2026-02-19 02:34:26.000000');

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `loan_type` enum('PERSONAL','HOME','VEHICLE','EDUCATION') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `tenure_months` int(11) NOT NULL,
  `emi_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','APPROVED','REJECTED','CLOSED') NOT NULL DEFAULT 'PENDING',
  `remarks` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `remaining_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `paid_installments` int(11) NOT NULL DEFAULT 0,
  `grace_period_days` int(11) NOT NULL DEFAULT 5,
  `penalty_rate` decimal(5,2) NOT NULL DEFAULT 2.00,
  `total_penalty` decimal(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `user_id`, `loan_type`, `amount`, `interest_rate`, `tenure_months`, `emi_amount`, `status`, `remarks`, `created_at`, `updated_at`, `remaining_balance`, `paid_installments`, `grace_period_days`, `penalty_rate`, `total_penalty`) VALUES
(1, 2, 'VEHICLE', 10000.00, 10.00, 8, 1297.33, 'APPROVED', 'done', '2026-02-18 01:10:28.413746', '2026-02-18 02:12:16.000000', 7561.89, 2, 5, 2.00, 0.00),
(2, 2, 'HOME', 150000.00, 8.00, 30, 5533.25, 'APPROVED', 'test | test', '2026-02-18 01:56:32.436765', '2026-02-19 02:07:34.000000', 150000.00, 0, 5, 2.00, 0.00),
(3, 6, 'VEHICLE', 5000.00, 10.00, 10, 523.20, 'APPROVED', 'done', '2026-02-19 02:34:57.798452', '2026-02-19 02:42:39.000000', 5000.00, 0, 5, 2.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `loan_payments`
--

CREATE TABLE `loan_payments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `penalty_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outstanding_balance` decimal(15,2) NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'COMPLETED',
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_payments`
--

INSERT INTO `loan_payments` (`id`, `loan_id`, `installment_number`, `amount_paid`, `principal_amount`, `interest_amount`, `penalty_amount`, `outstanding_balance`, `status`, `due_date`, `paid_date`, `remarks`, `created_at`) VALUES
(1, 1, 1, 1297.33, 1214.00, 83.33, 0.00, 8786.00, 'COMPLETED', '2026-03-18', '2026-02-18', 'EMI payment #1', '2026-02-18 02:11:43.756151'),
(2, 1, 2, 1297.33, 1224.11, 73.22, 0.00, 7561.89, 'COMPLETED', '2026-04-18', '2026-02-18', 'EMI payment #2', '2026-02-18 02:12:16.127501');

-- --------------------------------------------------------

--
-- Table structure for table `loan_penalties`
--

CREATE TABLE `loan_penalties` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `days_overdue` int(11) NOT NULL DEFAULT 0,
  `emi_amount` decimal(15,2) NOT NULL,
  `penalty_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalty_rate_used` decimal(5,2) NOT NULL DEFAULT 2.00,
  `status` enum('PENDING','COLLECTED','WAIVED') NOT NULL DEFAULT 'PENDING',
  `penalty_start_date` date DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('TRANSACTION','LOAN','ACCOUNT','SECURITY','GENERAL') NOT NULL,
  `channel` enum('EMAIL','SMS','IN_APP') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(4) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `is_sent` tinyint(4) NOT NULL DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `channel`, `title`, `message`, `is_read`, `read_at`, `is_sent`, `sent_at`, `created_at`, `updated_at`, `metadata`) VALUES
(2, 1, 'ACCOUNT', 'IN_APP', 'Account Frozen', 'Your account 613260814400 has been frozen.', 0, NULL, 0, NULL, '2026-02-19 14:36:16.236211', '2026-02-19 14:36:16.236211', NULL),
(3, 1, 'ACCOUNT', 'IN_APP', 'Account Unfrozen', 'Your account 613260814400 has been unfrozen.', 0, NULL, 0, NULL, '2026-02-19 14:36:23.935336', '2026-02-19 14:36:23.935336', NULL),
(4, 1, 'TRANSACTION', 'IN_APP', 'Transfer Transaction', 'Your transfer of $100 has been completed successfully.', 1, '2026-02-19 08:36:50', 0, NULL, '2026-02-19 14:36:35.017063', '2026-02-19 14:36:50.000000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_config`
--

CREATE TABLE `system_config` (
  `id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_config`
--

INSERT INTO `system_config` (`id`, `key`, `value`, `category`, `description`, `created_at`, `updated_at`) VALUES
(1, 'transaction.dailyTransferLimit', '50000', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(2, 'transaction.dailyWithdrawalLimit', '10000', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(3, 'transaction.perTransactionLimit', '25000', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(4, 'fees.transfer', '0', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(5, 'fees.withdrawal', '0', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(6, 'fees.monthlyMaintenance', '5', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(7, 'interest.SAVINGS', '6', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-18 02:36:50.000000'),
(8, 'interest.CHECKING', '0', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(9, 'loan.interest.PERSONAL', '12', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(10, 'loan.interest.HOME', '8', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(11, 'loan.interest.VEHICLE', '10', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(12, 'loan.interest.EDUCATION', '6', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(13, 'penalty.lateFeePercentage', '2', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(14, 'penalty.overdraftFee', '35', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(15, 'penalty.minimumBalanceFee', '10', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(16, 'system.defaultCurrency', 'USD', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107'),
(17, 'system.maintenanceMode', 'false', NULL, NULL, '2026-02-17 21:27:20.547929', '2026-02-17 21:27:20.564107');

-- --------------------------------------------------------

--
-- Table structure for table `token_blacklist`
--

CREATE TABLE `token_blacklist` (
  `id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'logout',
  `reason` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist`
--

INSERT INTO `token_blacklist` (`id`, `token_hash`, `user_id`, `type`, `reason`, `expires_at`, `created_at`) VALUES
(1, 'd580e3c2953a22162c5f0a95c73b9380b1fdd0e4de0097f2f3c6dfca878b6e25', NULL, 'logout', 'logout', '2026-02-19 04:47:24', '2026-02-18 04:47:35.045149'),
(6, '5dab91206c78aaaa5bea07da09e62c87ed07b7bc2462d73e2fc8acb9526b4386', NULL, 'logout', 'logout', '2026-02-19 23:39:41', '2026-02-19 02:10:13.790431'),
(7, '3dcec576bca7cc6b41d2cd8d7a32f7bd82b83c6490eaf31787b01f1c6a1ee4a5', NULL, 'logout', 'logout', '2026-02-20 02:14:39', '2026-02-19 02:15:52.831853'),
(11, 'ca1f803a2e472296638cb4c115f408fd994ac9c6e663ef589ef6ee1fc005207e', NULL, 'logout', 'logout', '2026-02-20 02:16:16', '2026-02-19 04:07:41.108365'),
(12, '56ff3479ceebd55b5565b683381ae590a170f9e34323e3101d5a6e0395bfd272', NULL, 'logout', 'logout', '2026-02-20 04:08:10', '2026-02-19 04:10:54.855869'),
(13, '1411ed8b4a93f428b9753e88aa140723499a3a466690831431d052be569713ce', NULL, 'logout', 'logout', '2026-02-20 04:11:43', '2026-02-19 04:12:10.204985'),
(14, 'eb37b221f9ec5337315fb2b6311343e59ddd277373441447a5eacc40a82956fc', NULL, 'logout', 'logout', '2026-02-19 23:48:58', '2026-02-19 14:20:48.261583');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `from_account_id` int(11) DEFAULT NULL,
  `to_account_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('DEPOSIT','WITHDRAW','TRANSFER','EXTERNAL_TRANSFER','REVERSAL') NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','REVERSED') NOT NULL DEFAULT 'PENDING',
  `description` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `transfer_type` varchar(20) DEFAULT NULL,
  `external_bank_name` varchar(255) DEFAULT NULL,
  `external_account_number` varchar(255) DEFAULT NULL,
  `external_beneficiary_name` varchar(255) DEFAULT NULL,
  `external_ifsc_code` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `from_account_id`, `to_account_id`, `amount`, `type`, `status`, `description`, `created_at`, `transfer_type`, `external_bank_name`, `external_account_number`, `external_beneficiary_name`, `external_ifsc_code`) VALUES
(1, NULL, 4, 1000.00, 'DEPOSIT', 'COMPLETED', 'Deposit', '2026-02-17 23:37:29.879756', NULL, NULL, NULL, NULL, NULL),
(2, 4, 2, 100.00, 'TRANSFER', 'COMPLETED', 'test', '2026-02-18 01:15:58.266738', NULL, NULL, NULL, NULL, NULL),
(3, 4, 2, 200.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 01:16:40.921611', NULL, NULL, NULL, NULL, NULL),
(4, NULL, 1, 10000.00, 'DEPOSIT', 'COMPLETED', 'Loan disbursement - VEHICLE Loan #1 (8 months @ 10.00% interest)', '2026-02-18 01:40:14.728039', NULL, NULL, NULL, NULL, NULL),
(5, NULL, 1, 1200.00, 'DEPOSIT', 'COMPLETED', 'Deposit request', '2026-02-18 01:54:56.581374', NULL, NULL, NULL, NULL, NULL),
(6, NULL, 1, 150000.00, 'DEPOSIT', 'COMPLETED', 'Loan disbursement - HOME Loan #2 (30 months @ 8.00% interest)', '2026-02-18 02:02:22.788323', NULL, NULL, NULL, NULL, NULL),
(7, 3, NULL, 1297.33, 'WITHDRAW', 'COMPLETED', 'EMI Payment #1 - VEHICLE Loan #1', '2026-02-18 02:11:43.747389', NULL, NULL, NULL, NULL, NULL),
(8, 3, NULL, 1297.33, 'WITHDRAW', 'COMPLETED', 'EMI Payment #2 - VEHICLE Loan #1', '2026-02-18 02:12:16.124898', NULL, NULL, NULL, NULL, NULL),
(9, 4, 2, 50.00, 'TRANSFER', 'REVERSED', 'Transfer', '2026-02-18 02:15:54.065305', NULL, NULL, NULL, NULL, NULL),
(10, 2, 4, 50.00, 'REVERSAL', 'COMPLETED', 'Reversal of transaction #9: test', '2026-02-18 02:16:21.485589', NULL, NULL, NULL, NULL, NULL),
(11, 4, 2, 19.98, 'TRANSFER', 'REVERSED', 'Transfer', '2026-02-18 02:34:55.272577', NULL, NULL, NULL, NULL, NULL),
(12, 2, 4, 19.98, 'REVERSAL', 'COMPLETED', 'Reversal of transaction #11: h', '2026-02-18 02:35:42.959203', NULL, NULL, NULL, NULL, NULL),
(13, 3, 1, 100.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:38:25.407339', NULL, NULL, NULL, NULL, NULL),
(14, 2, 1, 100.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:39:56.720651', NULL, NULL, NULL, NULL, NULL),
(15, 2, 1, 1000.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:48:18.920732', NULL, NULL, NULL, NULL, NULL),
(16, 3, 1, 17.95, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:55:25.255849', NULL, NULL, NULL, NULL, NULL),
(17, 3, 2, 20.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:56:21.763754', NULL, NULL, NULL, NULL, NULL),
(18, 3, 4, 111.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:56:38.360495', NULL, NULL, NULL, NULL, NULL),
(19, 2, 4, 100.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 02:58:42.117172', NULL, NULL, NULL, NULL, NULL),
(20, 2, 4, 200.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 03:06:48.238795', NULL, NULL, NULL, NULL, NULL),
(21, 2, 4, 900.00, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-18 03:07:21.788588', NULL, NULL, NULL, NULL, NULL),
(22, NULL, 5, 100.00, 'DEPOSIT', 'COMPLETED', 'Staff deposit: DEP-1771441693939', '2026-02-19 01:08:13.996716', NULL, NULL, NULL, NULL, NULL),
(23, 5, NULL, 50.00, 'WITHDRAW', 'COMPLETED', 'Staff withdrawal: WDR-1771441710089', '2026-02-19 01:08:30.140642', NULL, NULL, NULL, NULL, NULL),
(24, NULL, NULL, 199.00, 'TRANSFER', 'COMPLETED', 'Staff transfer: TRF-1771441731456', '2026-02-19 01:08:51.508832', NULL, NULL, NULL, NULL, NULL),
(25, NULL, 5, 1000.00, 'DEPOSIT', 'COMPLETED', 'Staff deposit: DEP-1771441738589', '2026-02-19 01:08:58.635428', NULL, NULL, NULL, NULL, NULL),
(26, 4, 3, 99.97, 'TRANSFER', 'COMPLETED', 'Transfer', '2026-02-19 01:34:26.458524', NULL, NULL, NULL, NULL, NULL),
(27, NULL, 6, 100000.00, 'DEPOSIT', 'COMPLETED', 'Deposit request', '2026-02-19 02:34:26.522282', NULL, NULL, NULL, NULL, NULL),
(28, NULL, 6, 5000.00, 'DEPOSIT', 'COMPLETED', 'Loan approval: done', '2026-02-19 02:42:39.575600', NULL, NULL, NULL, NULL, NULL),
(29, 6, 4, 100.00, 'TRANSFER', 'COMPLETED', 'Internal Transfer', '2026-02-19 04:47:16.816634', 'INTERNAL', NULL, NULL, NULL, NULL),
(30, 6, 4, 49.98, 'TRANSFER', 'COMPLETED', 'Internal Transfer', '2026-02-19 04:47:52.738989', 'INTERNAL', NULL, NULL, NULL, NULL),
(31, 6, NULL, 100.00, 'EXTERNAL_TRANSFER', 'COMPLETED', '1350', '2026-02-19 04:48:46.554757', 'EXTERNAL', 'prime', '496326949573', 'rakib', '1230'),
(32, 4, 5, 100.00, 'TRANSFER', 'COMPLETED', 'Internal Transfer', '2026-02-19 14:22:33.801203', 'INTERNAL', NULL, NULL, NULL, NULL),
(33, NULL, NULL, 100.00, 'TRANSFER', 'COMPLETED', 'test', '2026-02-19 14:36:34.997082', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `isLocked` tinyint(4) NOT NULL DEFAULT 0,
  `locked_at` timestamp NULL DEFAULT NULL,
  `lock_reason` text DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_enabled` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `isActive`, `isLocked`, `locked_at`, `lock_reason`, `two_factor_secret`, `two_factor_enabled`) VALUES
(1, 'Test Customer', 'customer@banking.com', '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', '2026-02-17 20:39:02.342870', '2026-02-19 01:04:25.000000', 1, 0, NULL, NULL, NULL, 0),
(2, 'test', 'test@gmail.com', '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', '2026-02-17 20:50:10.546605', '2026-02-19 00:47:36.847132', 1, 0, NULL, NULL, NULL, 0),
(3, 'admin', 'admin@banking.com', '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'ADMIN', '2026-02-17 20:54:04.826620', '2026-02-19 00:47:36.847132', 1, 0, NULL, NULL, NULL, 0),
(4, 'rakib', 'rakib@gmail.com', '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'EMPLOYEE', '2026-02-17 21:39:22.275113', '2026-02-19 00:47:36.847132', 1, 0, NULL, NULL, NULL, 0),
(5, 'rakib', 'mdrakib789@gmail.com', '$2b$10$9GLc/pPfcORPanDXN0V32OOE1qA/29RZ8DX2k12QkHQGNiag4HSYi', 'CUSTOMER', '2026-02-18 04:47:19.398343', '2026-02-19 00:47:36.847132', 1, 0, NULL, NULL, NULL, 0),
(6, 'Bulbul', 'bulbul@gmail.com', '$2b$10$oGQxwrLi3R6VPS.ksBMF7OKcqOvQmWpXlJiOFfj0tERpOMYQ/g2HC', 'CUSTOMER', '2026-02-19 02:15:30.655975', '2026-02-19 04:10:40.000000', 1, 0, NULL, NULL, 'PBCEILS5PA6E2MLPIBXXQRJIKRXGWMBRFYTC6TDOJBDHI5LCHNOQ', 1);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_account_summary`
-- (See below for the actual view)
--
CREATE TABLE `view_account_summary` (
`account_id` int(11)
,`account_number` varchar(255)
,`account_type` enum('SAVINGS','CHECKING','LOAN','FIXED_DEPOSIT','RECURRING_DEPOSIT')
,`balance` decimal(15,2)
,`currency` varchar(255)
,`user_id` int(11)
,`user_name` varchar(255)
,`user_email` varchar(255)
,`created_at` datetime(6)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_loan_summary`
-- (See below for the actual view)
--
CREATE TABLE `view_loan_summary` (
`loan_id` int(11)
,`loan_type` enum('PERSONAL','HOME','VEHICLE','EDUCATION')
,`amount` decimal(15,2)
,`interest_rate` decimal(5,2)
,`tenure_months` int(11)
,`emi_amount` decimal(15,2)
,`status` enum('PENDING','APPROVED','REJECTED','CLOSED')
,`created_at` datetime(6)
,`user_id` int(11)
,`user_name` varchar(255)
,`user_email` varchar(255)
,`total_payable` decimal(35,8)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_transaction_summary`
-- (See below for the actual view)
--
CREATE TABLE `view_transaction_summary` (
`transaction_id` int(11)
,`type` enum('DEPOSIT','WITHDRAW','TRANSFER','EXTERNAL_TRANSFER','REVERSAL')
,`amount` decimal(15,2)
,`status` enum('PENDING','COMPLETED','FAILED','REVERSED')
,`description` text
,`created_at` datetime(6)
,`from_account` varchar(255)
,`to_account` varchar(255)
,`from_user` varchar(255)
,`to_user` varchar(255)
);

-- --------------------------------------------------------

--
-- Structure for view `view_account_summary`
--
DROP TABLE IF EXISTS `view_account_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_account_summary`  AS SELECT `a`.`id` AS `account_id`, `a`.`account_number` AS `account_number`, `a`.`account_type` AS `account_type`, `a`.`balance` AS `balance`, `a`.`currency` AS `currency`, `u`.`id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`email` AS `user_email`, `a`.`created_at` AS `created_at` FROM (`accounts` `a` join `users` `u` on(`a`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_loan_summary`
--
DROP TABLE IF EXISTS `view_loan_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_loan_summary`  AS SELECT `l`.`id` AS `loan_id`, `l`.`loan_type` AS `loan_type`, `l`.`amount` AS `amount`, `l`.`interest_rate` AS `interest_rate`, `l`.`tenure_months` AS `tenure_months`, `l`.`emi_amount` AS `emi_amount`, `l`.`status` AS `status`, `l`.`created_at` AS `created_at`, `u`.`id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`email` AS `user_email`, `l`.`amount`+ `l`.`amount` * `l`.`interest_rate` * `l`.`tenure_months` / 1200 AS `total_payable` FROM (`loans` `l` join `users` `u` on(`l`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_transaction_summary`
--
DROP TABLE IF EXISTS `view_transaction_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_transaction_summary`  AS SELECT `t`.`id` AS `transaction_id`, `t`.`type` AS `type`, `t`.`amount` AS `amount`, `t`.`status` AS `status`, `t`.`description` AS `description`, `t`.`created_at` AS `created_at`, `fa`.`account_number` AS `from_account`, `ta`.`account_number` AS `to_account`, `fu`.`name` AS `from_user`, `tu`.`name` AS `to_user` FROM ((((`transactions` `t` left join `accounts` `fa` on(`t`.`from_account_id` = `fa`.`id`)) left join `accounts` `ta` on(`t`.`to_account_id` = `ta`.`id`)) left join `users` `fu` on(`fa`.`user_id` = `fu`.`id`)) left join `users` `tu` on(`ta`.`user_id` = `tu`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_ffd1ae96513bfb2c6eada0f7d3` (`account_number`),
  ADD KEY `FK_3000dad1da61b29953f07476324` (`user_id`);

--
-- Indexes for table `account_deletion_requests`
--
ALTER TABLE `account_deletion_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_3fad356676a0d6f5a40ecc2dfb0` (`account_id`),
  ADD KEY `FK_741b76f2bbc0cc65281abb08287` (`user_id`),
  ADD KEY `FK_7ce7375fa8e619159f771efec35` (`processed_by`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_bd2726fd31b35443f2245b93ba0` (`user_id`);

--
-- Indexes for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_38906de3393c7787c3c89e29d3b` (`user_id`);

--
-- Indexes for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_e011c5dfcdc413491d1d642f26f` (`user_id`),
  ADD KEY `FK_48b01d0f671018da15a2e7695dc` (`account_id`),
  ADD KEY `FK_baeb6ad6d320788ab51b35906a3` (`approved_by`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_d135791c39e46e13ca4c2725fbb` (`user_id`);

--
-- Indexes for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_6584bab09ac53bd8d00d74a58cd` (`loan_id`);

--
-- Indexes for table `loan_penalties`
--
ALTER TABLE `loan_penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_9819fee6def2763c9edc00d5045` (`loan_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_9a8a82462cab47c73d25f49261f` (`user_id`);

--
-- Indexes for table `system_config`
--
ALTER TABLE `system_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_eedd3cd0f227c7fb5eff2204e9` (`key`);

--
-- Indexes for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_fc93690d4ba3c359bfaaa99a7a` (`token_hash`),
  ADD KEY `IDX_f843323a807f2db43c4d8ba888` (`expires_at`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_91ac87a22755563425b98ffc3c0` (`from_account_id`),
  ADD KEY `FK_d81b9f7079880ed2c82d60a94b9` (`to_account_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `account_deletion_requests`
--
ALTER TABLE `account_deletion_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loan_payments`
--
ALTER TABLE `loan_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `loan_penalties`
--
ALTER TABLE `loan_penalties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_config`
--
ALTER TABLE `system_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `FK_3000dad1da61b29953f07476324` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `account_deletion_requests`
--
ALTER TABLE `account_deletion_requests`
  ADD CONSTRAINT `FK_3fad356676a0d6f5a40ecc2dfb0` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_741b76f2bbc0cc65281abb08287` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_7ce7375fa8e619159f771efec35` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `FK_bd2726fd31b35443f2245b93ba0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  ADD CONSTRAINT `FK_38906de3393c7787c3c89e29d3b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD CONSTRAINT `FK_48b01d0f671018da15a2e7695dc` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_baeb6ad6d320788ab51b35906a3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_e011c5dfcdc413491d1d642f26f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `FK_d135791c39e46e13ca4c2725fbb` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD CONSTRAINT `FK_6584bab09ac53bd8d00d74a58cd` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `loan_penalties`
--
ALTER TABLE `loan_penalties`
  ADD CONSTRAINT `FK_9819fee6def2763c9edc00d5045` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK_9a8a82462cab47c73d25f49261f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `FK_91ac87a22755563425b98ffc3c0` FOREIGN KEY (`from_account_id`) REFERENCES `accounts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_d81b9f7079880ed2c82d60a94b9` FOREIGN KEY (`to_account_id`) REFERENCES `accounts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

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
| Customer | Bulbul        | bulbul@gmail.com     | You@@123    | 2FA enabled (TOTP) |

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
npm run dev       # Vite dev server  →  http://localhost:3000
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

## UI Navigation — All Features

> A complete step-by-step walkthrough of every feature available in the browser UI, organized by user role.

### Getting Started

**1. Start the Application**

```bash
# Install dependencies (root + client)
npm install
cd client && npm install && cd ..

# Start backend + frontend together
npm run start:dev        # backend on http://localhost:3001
cd client && npm run dev # frontend on http://localhost:3000
```

**2. Open the App**

Navigate to **http://localhost:3000** in your browser.

---

### Authentication

#### Register a New Customer Account

1. Go to **http://localhost:3000/register**
2. Fill in your **Name**, **Email**, and **Password**
3. Click **Register**
4. You are redirected to the **Login** page

#### Login

1. Go to **http://localhost:3000/login**
2. Enter your **Email** and **Password**
3. Click **Login**
4. You are redirected to your role-based dashboard automatically:
   - **Admin** → Dashboard with Admin Panel, Staff Panel & Loan Officer shortcuts
   - **Employee** → Staff Dashboard or Loan Officer Dashboard
   - **Customer** → Personal Dashboard

#### Logout

Click your profile or the **Logout** button in the sidebar navigation.

---

### Role Overview

| Role     | Default Landing Page         | Access                                                            |
| -------- | ---------------------------- | ----------------------------------------------------------------- |
| Admin    | `/dashboard`                 | All modules + Admin Panel                                         |
| Employee | `/staff` or `/loan-officers` | Staff Dashboard, Loan Officer Dashboard                           |
| Customer | `/dashboard`                 | Accounts, Transactions, Loans, Profile, Statements, Notifications |

---

### 👑 Admin — Features & Workflow

> Login as **Admin** → Click **Admin Panel** from the dashboard quick links or navigate to `/admin`

The Admin Panel has **tabbed sections** at the top. Click each tab to switch between management areas.

---

#### Tab: Users

**What you can do:** View all registered users, create employee accounts, activate/deactivate users, lock/unlock accounts.

**View All Users**

1. Open **Admin Panel** (`/admin`)
2. The **Users** tab is selected by default
3. A table lists all users with their name, email, role, and current status

**Create a New Employee**

1. Click **"+ Create Employee"** (top-right of the Users tab)
2. A modal appears — fill in **Name**, **Email**, **Password**
3. Click **Create Employee**
4. The new employee appears in the user list with the `EMPLOYEE` role

**Activate / Deactivate a User**

1. Find the user in the Users table
2. Click **Activate** or **Deactivate** next to their name
3. Confirm the action — the user's status updates immediately

**Lock a User**

1. Find the user in the Users table
2. Click **Lock**
3. Enter a **reason** in the prompt and click OK
4. The user is locked and cannot log in

**Unlock a User**

1. Find the locked user in the Users table
2. Click **Unlock**
3. Optionally enter a reason, click OK
4. The user's sessions are restored

---

#### Tab: Accounts

**What you can do:** View all customer accounts system-wide, freeze/unfreeze accounts, close accounts.

**Freeze an Account**

1. Click the **Accounts** tab
2. Find the account in the table
3. Click **Freeze** — enter a **reason** when prompted
4. The account status changes to FROZEN; the customer cannot transact

**Unfreeze an Account**

1. Find the frozen account in the Accounts table
2. Click **Unfreeze** — optionally enter a reason
3. The account becomes active again

**Close an Account**

1. Find the account in the Accounts table
2. Click **Close Account**
3. Enter a **reason** and confirm
4. The account is permanently marked CLOSED

---

#### Tab: Transactions

**What you can do:** View all transactions system-wide, reverse a transaction.

**Reverse a Transaction**

1. Click the **Transactions** tab (data loads automatically)
2. Find the transaction in the table
3. Click **Reverse**
4. Enter a **reason** and confirm
5. The reversal is applied and reflected in both accounts

---

#### Tab: Loans

**What you can do:** View all loan applications, approve or reject them.

**Approve a Loan**

1. Click the **Loans** tab
2. Find a loan with `PENDING` status
3. Click **Approve**
4. Enter **approval notes** and optionally a **recommended EMI**
5. Click Confirm — the loan status changes to `APPROVED`

**Reject a Loan**

1. Click the **Loans** tab
2. Find a `PENDING` loan
3. Click **Reject** — enter a rejection reason
4. Click Confirm — the loan status changes to `REJECTED`

---

#### Tab: Deposits

**What you can do:** Review customer deposit requests and approve or reject them.

**Approve a Deposit Request**

1. Click the **Deposits** tab
2. Find the pending deposit request
3. Click **Approve** — optionally enter approval remarks
4. Confirm — the amount is credited to the customer's account

**Reject a Deposit Request**

1. Click the **Deposits** tab
2. Find the deposit request
3. Click **Reject** — enter a rejection reason (required)
4. The request is marked rejected; no amount is credited

---

#### Tab: System Config

**What you can do:** Set transaction limits, fee configuration, and interest rates.

**Set Transaction Limits**

1. Click the **Config** tab and then **Set Limits**
2. A modal opens with fields:
   - **Daily Transfer Limit**
   - **Daily Withdrawal Limit**
   - **Per Transaction Limit**
3. Update values and click **Save**

**Set Fee Configuration**

1. Click **Set Fees** in the Config tab
2. Set **Transfer Fee**, **Withdrawal Fee**, **Monthly Maintenance Fee**
3. Click **Save**

**Set Interest Rate**

1. Click **Set Interest Rate**
2. Choose the **Account Type** (SAVINGS / CHECKING)
3. Enter the **Interest Rate (%)**
4. Click **Save**

---

#### Tab: Audit Logs

**What you can do:** View a full audit trail of every system action.

1. Click the **Audit** tab
2. All admin and system actions are listed in chronological order with timestamps, actor, and description

---

### 👷 Employee (Staff) — Features & Workflow

> Login as **Employee** → You are automatically redirected to `/staff` (Staff Dashboard)

The Staff Dashboard has three tabs: **Overview**, **Customers**, **Transactions**.

---

#### Overview Tab

Displays key stats at a glance:

- Total Customers
- Total Accounts managed
- Active Today count
- Pending Requests count

A **Quick Search** box is available — type a customer's name or email to jump directly to their profile.

---

#### Customers Tab

**What you can do:** Search and select customers, view their accounts, perform account and transaction operations.

**Find a Customer**

1. Click the **Customers** tab
2. Type in the **Search Customers** box (name or email)
3. Results filter in real time as you type
4. Click a customer row to open their Customer Detail Panel

**View Customer Accounts & Transactions**

1. Select a customer from the search results or the customer list
2. The detail panel shows their **Account Cards** (balance, type, status) and their **Recent Transactions**

**Deposit to a Customer Account**

1. Open a customer's detail panel
2. On the account card, click **Deposit**
3. A modal opens — enter the **Amount** and an optional **Description**
4. Click **Submit** — the amount is credited and a success message appears

**Withdraw from a Customer Account**

1. Open a customer's detail panel
2. Click **Withdraw** on the account card
3. Enter the **Amount** and optional **Description**
4. Click **Submit** — the amount is debited

**Transfer Between Accounts**

1. Open a customer's detail panel
2. Click **Transfer** on the source account card
3. Enter the **Destination Account ID**, **Amount**, and optional **Description**
4. Click **Submit**

**Freeze a Customer Account**

1. Open a customer's detail panel
2. Click **Freeze** on the account card
3. A modal appears — enter a **Reason** (required)
4. Click **Freeze Account** — the account is frozen; the customer cannot transact

**Unfreeze a Customer Account**

1. Find the frozen account in the customer's panel
2. Click **Unfreeze** — the account is immediately reactivated

---

#### Transactions Tab

Provides a real-time overview of recent transactions across all customers managed by this staff member.

---

### 🏦 Employee (Loan Officer) — Features & Workflow

> Login as **Employee** → Click the **Loan Officer** shortcut on your dashboard, or navigate to `/loan-officers`

The Loan Officer Dashboard has five tabs: **Overview**, **Pending**, **Approved**, **Overdue**, **All Loans**.

---

#### Overview Tab

Shows summary statistics:

- Total Loans in the system
- Pending Loans count
- Approved Loans active
- Overdue Loans count
- Total Disbursed Amount

---

#### Pending Tab

**What you can do:** Review and act on loan applications waiting for a decision.

**Approve a Loan**

1. Click the **Pending** tab — all pending loan applications are listed with customer name, loan type, amount, interest rate, tenure, and EMI
2. Click **✓ Approve** on a loan card
3. A modal opens — enter **Approval Notes** (required) and optionally a **Recommended EMI**
4. Click **Confirm Approval** — the loan is approved and the customer is notified

**Reject a Loan**

1. Click the **Pending** tab
2. Click **✗ Reject** on the loan card
3. Enter a **Rejection Reason** (required)
4. Click **Confirm Rejection** — the loan is rejected and the customer is notified

**View Full Loan Details**

1. Click **Details** on any loan card
2. A detail panel opens showing:
   - Loan info: type, amount, interest rate, tenure, EMI, remaining balance
   - Repayment schedule
   - Payment history
   - Penalty history
3. Click **Close** to dismiss

**Add Remarks to a Loan**

1. Click **+ Remarks** on a loan card
2. Enter your notes or comments
3. Click **Save Remarks**

---

#### Approved Tab

Lists all active (approved) loans with full details — remaining balance, payment schedule, and history.

---

#### Overdue Tab

**What you can do:** Manage loans with missed payments and handle penalties.

**View Overdue Loans**

1. Click the **Overdue** tab
2. All loans with missed EMIs are listed with the overdue amount and penalty info

**Waive a Penalty**

1. Find the loan in the Overdue tab
2. Click **Waive Penalty**
3. Enter **waive remarks** and confirm
4. The penalty is waived for that loan

**Collect a Penalty**

1. Find the overdue loan
2. Click **Collect Penalty** and confirm
3. The penalty amount is collected from the customer

**Run Penalty Check**

1. Click the **Run Penalty Check** button (in the Overdue or Overview tab)
2. The system scans all active loans for missed EMIs and applies penalties automatically

---

#### All Loans Tab

**What you can do:** Browse the complete loan portfolio with optional status filtering.

1. Click the **All Loans** tab
2. Use the **Filter by Status** dropdown: `PENDING` / `APPROVED` / `REJECTED` / `CLOSED` / `OVERDUE`
3. Matching loans are listed with full details

---

### 👤 Customer — Features & Workflow

> Login as **Customer** → You land on `/dashboard`

---

#### Dashboard (`/dashboard`)

Gives you a summary view:

- **Total Balance** across all your accounts
- **Recent Transactions** (last 5)
- **Active Loans** count with quick links
- Navigation shortcuts to Accounts, Transactions, Loans, Profile, Statements, Notifications

---

#### Accounts (`/accounts`)

**What you can do:** View your accounts, open new accounts, create Fixed Deposits and Recurring Deposits.

**View Your Accounts**

1. Click **Accounts** in the sidebar or navigate to `/accounts`
2. All your accounts are listed with account number, type, balance, and status

**Open a New Account**

1. Click **+ New Account**
2. Choose account type: **Savings** or **Checking**
3. Click **Create Account**
4. The new account appears in your list

**Create a Fixed Deposit (FD)**

1. Click **+ Fixed Deposit**
2. Enter the **Amount** and **Lock Period (months)**
3. Click **Create** — the FD is set up and listed as a locked account

**Create a Recurring Deposit (RD)**

1. Click **+ Recurring Deposit**
2. Enter the **Monthly Amount** and **Lock Period (months)**
3. Click **Create** — the RD is set up with automatic monthly contributions

---

#### Transactions (`/transactions`)

The Transactions page has five tabs: **Deposit**, **Withdraw**, **Transfer**, **Beneficiaries**, **History**.

**Request a Deposit**

1. Click the **Deposit** tab
2. Select your **Account** from the dropdown
3. Enter the **Amount** and optional **Description**
4. Click **Submit Deposit Request**
5. The request goes to admin for approval — you receive a notification once credited

**Withdraw Funds**

1. Click the **Withdraw** tab
2. Select the **Account** to withdraw from
3. Enter the **Amount** and optional **Description**
4. Click **Withdraw** — funds are deducted immediately if sufficient balance exists

**Internal Transfer (within NeosCode)**

1. Click the **Transfer** tab
2. Make sure **Internal Transfer** mode is selected
3. Choose your **From Account** (by account number)
4. Enter the **To Account Number** — the account holder name is verified live as you type
5. Enter the **Amount** and optional **Description**
6. Click **Transfer** — funds move instantly

**External Transfer**

1. Click the **Transfer** tab
2. Switch to **External Transfer** mode
3. Fill in: From Account, Beneficiary Name, Bank Name, Account Number, IFSC Code, Amount, Description
4. Click **Send**

**Manage Beneficiaries**

1. Click the **Beneficiaries** tab
2. View your saved beneficiaries list
3. To add one, fill in: **Beneficiary Name**, **Account Number**, **Bank Name**, **IFSC Code**, **Notes**
4. Click **Add Beneficiary** — saved for future quick transfers
5. To remove, click the **Delete** icon next to any beneficiary

**View Transaction History**

1. Click the **History** tab
2. All past transactions are listed with date, type, amount, and status

---

#### Loans (`/loans`)

**Apply for a Loan**

1. Click **Loans** in the sidebar or go to `/loans`
2. Click the **Apply** tab
3. Select **Loan Type**: Personal, Home, Vehicle, or Education
4. Enter the **Amount** and **Tenure (months)**
5. The **Estimated EMI** is calculated and shown live before you submit
6. Click **Apply** — the application is submitted with `PENDING` status and sent to a Loan Officer

**Track Your Loans**

1. Click the **My Loans** tab
2. All your loan applications are listed with status badges: `PENDING` / `APPROVED` / `REJECTED` / `CLOSED`
3. Click **View Details** on any approved loan to see the full repayment schedule and payment history

**Pay an EMI**

1. On the **My Loans** tab, find an approved active loan
2. Click **Pay EMI**
3. A modal shows the **EMI amount due**, **due date**, and any **penalty** if the payment is overdue
4. Select the **Account** to pay from
5. Click **Confirm Payment** — the EMI is deducted and the loan's remaining balance updates

---

#### Profile (`/profile`)

**View Profile Information**

1. Click **Profile** in the sidebar or go to `/profile`
2. Your name, email, role, and linked accounts are displayed

**Enable Two-Factor Authentication (2FA)**

1. Go to `/profile`
2. Find the **Two-Factor Authentication** section
3. Click **Enable 2FA**
4. A **QR Code** is displayed — scan it with an authenticator app (Google Authenticator, Authy, etc.)
5. Enter the **6-digit OTP** from your authenticator app
6. Click **Verify & Enable** — 2FA is now active on your account

**Disable 2FA**

1. Go to `/profile`
2. Click **Disable 2FA**
3. Enter your **current password** to confirm
4. Click **Disable** — 2FA is removed

**Delete an Account**

1. Go to `/profile`
2. Under your accounts list, click **Delete** on the account you want to close
3. If the account has a balance, a deletion request is sent to admin for approval
4. If the balance is zero, the account is deleted immediately

---

#### Monthly Statements (`/statements`)

**Generate a Monthly Statement**

1. Click **Statements** in the sidebar or go to `/statements`
2. Select your **Account** from the dropdown
3. Choose the **Year** and **Month**
4. Click **Generate Statement**
5. The statement displays: opening balance, all credits, all debits, closing balance, and a full transaction list

**Download Statement as PDF**

1. After generating a statement, click **Download PDF**
2. The statement is downloaded as a PDF file to your device

---

#### Notifications (`/notifications`)

**View Notifications**

1. Click **Notifications** in the sidebar or go to `/notifications`
2. All notifications are listed with type icons:
   - 💳 Transaction alerts
   - 🏦 Loan status updates
   - 📒 Account activity
   - 🔒 Security alerts
   - 🔔 General announcements
3. Unread notifications are visually highlighted

**Filter Notifications**

1. Use the **All / Unread** toggle at the top of the page
2. Select **Unread** to see only new notifications

**Mark as Read**

1. Click **Mark as Read** on an individual notification
2. Or click **Mark All as Read** to clear all unread at once

**Delete a Notification**
Click the **× (Delete)** button on any notification to remove it permanently

---

### Navigation Summary

| Page                   | URL              | Who Can Access                     |
| ---------------------- | ---------------- | ---------------------------------- |
| Login                  | `/login`         | Everyone                           |
| Register               | `/register`      | Everyone (self-signup as Customer) |
| Dashboard              | `/dashboard`     | Admin, Customer                    |
| Admin Panel            | `/admin`         | Admin only                         |
| Staff Dashboard        | `/staff`         | Admin, Employee                    |
| Loan Officer Dashboard | `/loan-officers` | Admin, Employee                    |
| Accounts               | `/accounts`      | Customer, Admin                    |
| Transactions           | `/transactions`  | Customer, Admin                    |
| Loans                  | `/loans`         | Customer, Admin                    |
| Profile                | `/profile`       | All logged-in users                |
| Monthly Statements     | `/statements`    | Customer, Admin                    |
| Notifications          | `/notifications` | All logged-in users                |

---

## 📄 License

This project is licensed under the **MIT License**.
