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
  `account_number` varchar(191) NOT NULL,
  `account_type` enum('SAVINGS','CHECKING','LOAN','FIXED_DEPOSIT','RECURRING_DEPOSIT') NOT NULL DEFAULT 'SAVINGS',
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL,
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
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
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
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime DEFAULT NULL,
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
,`created_at` datetime
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
,`created_at` datetime
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
,`created_at` datetime
,`from_account` varchar(255)
,`to_account` varchar(255)
,`from_user` varchar(255)
,`to_user` varchar(255)
);

-- --------------------------------------------------------

--
-- Structure for view `view_account_summary`
--

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
