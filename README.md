# NeosCode Banking System — UI Guide

A full-featured online banking platform with role-based dashboards for **Admins**, **Employees** (Staff & Loan Officers), and **Customers**.

---

## Getting Started

### 1. Start the Application

````bash
# Install dependencies (root + client)
npm install
cd client && npm install && cd ..

# Start backend + frontend together
npm run start:dev        # backend on http://localhost:3001
cd client && npm run dev # frontend on http://localhost:5173

### 2. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## Authentication

### Register a New Customer Account

1. Go to **http://localhost:5173/register**
2. Fill in your **Name**, **Email**, and **Password**
3. Click **Register**
4. You are redirected to the **Login** page

### Login

1. Go to **http://localhost:5173/login**
2. Enter your **Email** and **Password**
3. Click **Login**
4. You are redirected to your role-based dashboard automatically:
   - **Admin** → Dashboard with Admin Panel, Staff Panel & Loan Officer shortcuts
   - **Employee** → Staff Dashboard or Loan Officer Dashboard
   - **Customer** → Personal Dashboard

### Logout

Click your profile or the **Logout** button in the sidebar navigation.

---

## Role Overview

| Role | Default Landing Page | Access |
|---|---|---|
| Admin | `/dashboard` | All modules + Admin Panel |
| Employee | `/staff` or `/loan-officers` | Staff Dashboard, Loan Officer Dashboard |
| Customer | `/dashboard` | Accounts, Transactions, Loans, Profile, Statements, Notifications |

---

---

# Admin — Features & Workflow

> Login as **Admin** → Click **Admin Panel** from the dashboard quick links or navigate to `/admin`

The Admin Panel has **tabbed sections** at the top. Click each tab to switch between management areas.

---

## Tab: Users

**What you can do:** View all registered users, create employee accounts, activate/deactivate users, lock/unlock accounts.

### View All Users
1. Open **Admin Panel** (`/admin`)
2. The **Users** tab is selected by default
3. A table lists all users with their name, email, role, and current status

### Create a New Employee
1. Click **"+ Create Employee"** (top-right of the Users tab)
2. A modal appears — fill in **Name**, **Email**, **Password**
3. Click **Create Employee**
4. The new employee appears in the user list with the `EMPLOYEE` role

### Activate / Deactivate a User
1. Find the user in the Users table
2. Click **Activate** or **Deactivate** next to their name
3. Confirm the action — the user's status updates immediately

### Lock a User
1. Find the user in the Users table
2. Click **Lock**
3. Enter a **reason** in the prompt and click OK
4. The user is locked and cannot log in

### Unlock a User
1. Find the locked user in the Users table
2. Click **Unlock**
3. Optionally enter a reason, click OK
4. The user's sessions are restored

---

## Tab: Accounts

**What you can do:** View all customer accounts system-wide, freeze/unfreeze accounts, close accounts.

### Freeze an Account
1. Click the **Accounts** tab
2. Find the account in the table
3. Click **Freeze** — enter a **reason** when prompted
4. The account status changes to FROZEN; the customer cannot transact

### Unfreeze an Account
1. Find the frozen account in the Accounts table
2. Click **Unfreeze** — optionally enter a reason
3. The account becomes active again

### Close an Account
1. Find the account in the Accounts table
2. Click **Close Account**
3. Enter a **reason** and confirm
4. The account is permanently marked CLOSED

---

## Tab: Transactions

**What you can do:** View all transactions system-wide, reverse a transaction.

### Reverse a Transaction
1. Click the **Transactions** tab (data loads automatically)
2. Find the transaction in the table
3. Click **Reverse**
4. Enter a **reason** and confirm
5. The reversal is applied and reflected in both accounts

---

## Tab: Loans

**What you can do:** View all loan applications, approve or reject them.

### Approve a Loan
1. Click the **Loans** tab
2. Find a loan with `PENDING` status
3. Click **Approve**
4. Enter **approval notes** and optionally a **recommended EMI**
5. Click Confirm — the loan status changes to `APPROVED`

### Reject a Loan
1. Click the **Loans** tab
2. Find a `PENDING` loan
3. Click **Reject** — enter a rejection reason
4. Click Confirm — the loan status changes to `REJECTED`

---

## Tab: Deposits

**What you can do:** Review customer deposit requests and approve or reject them.

### Approve a Deposit Request
1. Click the **Deposits** tab
2. Find the pending deposit request
3. Click **Approve** — optionally enter approval remarks
4. Confirm — the amount is credited to the customer's account

### Reject a Deposit Request
1. Click the **Deposits** tab
2. Find the deposit request
3. Click **Reject** — enter a rejection reason (required)
4. The request is marked rejected; no amount is credited

---

## Tab: System Config

**What you can do:** Set transaction limits, fee configuration, and interest rates.

### Set Transaction Limits
1. Click the **Config** tab and then **Set Limits**
2. A modal opens with fields:
   - **Daily Transfer Limit**
   - **Daily Withdrawal Limit**
   - **Per Transaction Limit**
3. Update values and click **Save**

### Set Fee Configuration
1. Click **Set Fees** in the Config tab
2. Set **Transfer Fee**, **Withdrawal Fee**, **Monthly Maintenance Fee**
3. Click **Save**

### Set Interest Rate
1. Click **Set Interest Rate**
2. Choose the **Account Type** (SAVINGS / CHECKING)
3. Enter the **Interest Rate (%)**
4. Click **Save**

---

## Tab: Audit Logs

**What you can do:** View a full audit trail of every system action.

1. Click the **Audit** tab
2. All admin and system actions are listed in chronological order with timestamps, actor, and description

---

---

# Employee (Staff) — Features & Workflow

> Login as **Employee** → You are automatically redirected to `/staff` (Staff Dashboard)

The Staff Dashboard has three tabs: **Overview**, **Customers**, **Transactions**.

---

## Overview Tab

Displays key stats at a glance:
- Total Customers
- Total Accounts managed
- Active Today count
- Pending Requests count

A **Quick Search** box is available — type a customer's name or email to jump directly to their profile.

---

## Customers Tab

**What you can do:** Search and select customers, view their accounts, perform account and transaction operations.

### Find a Customer
1. Click the **Customers** tab
2. Type in the **Search Customers** box (name or email)
3. Results filter in real time as you type
4. Click a customer row to open their Customer Detail Panel

### View Customer Accounts & Transactions
1. Select a customer from the search results or the customer list
2. The detail panel shows their **Account Cards** (balance, type, status) and their **Recent Transactions**

### Deposit to a Customer Account
1. Open a customer's detail panel
2. On the account card, click **Deposit**
3. A modal opens — enter the **Amount** and an optional **Description**
4. Click **Submit** — the amount is credited and a success message appears

### Withdraw from a Customer Account
1. Open a customer's detail panel
2. Click **Withdraw** on the account card
3. Enter the **Amount** and optional **Description**
4. Click **Submit** — the amount is debited

### Transfer Between Accounts
1. Open a customer's detail panel
2. Click **Transfer** on the source account card
3. Enter the **Destination Account ID**, **Amount**, and optional **Description**
4. Click **Submit**

### Freeze a Customer Account
1. Open a customer's detail panel
2. Click **Freeze** on the account card
3. A modal appears — enter a **Reason** (required)
4. Click **Freeze Account** — the account is frozen; the customer cannot transact

### Unfreeze a Customer Account
1. Find the frozen account in the customer's panel
2. Click **Unfreeze** — the account is immediately reactivated

---

## Transactions Tab

Provides a real-time overview of recent transactions across all customers managed by this staff member.

---

---

# Employee (Loan Officer) — Features & Workflow

> Login as **Employee** → Click the **Loan Officer** shortcut on your dashboard, or navigate to `/loan-officers`

The Loan Officer Dashboard has five tabs: **Overview**, **Pending**, **Approved**, **Overdue**, **All Loans**.

---

## Overview Tab

Shows summary statistics:
- Total Loans in the system
- Pending Loans count
- Approved Loans active
- Overdue Loans count
- Total Disbursed Amount

---

## Pending Tab

**What you can do:** Review and act on loan applications waiting for a decision.

### Approve a Loan
1. Click the **Pending** tab — all pending loan applications are listed with customer name, loan type, amount, interest rate, tenure, and EMI
2. Click **✓ Approve** on a loan card
3. A modal opens — enter **Approval Notes** (required) and optionally a **Recommended EMI**
4. Click **Confirm Approval** — the loan is approved and the customer is notified

### Reject a Loan
1. Click the **Pending** tab
2. Click **✗ Reject** on the loan card
3. Enter a **Rejection Reason** (required)
4. Click **Confirm Rejection** — the loan is rejected and the customer is notified

### View Full Loan Details
1. Click **Details** on any loan card
2. A detail panel opens showing:
   - Loan info: type, amount, interest rate, tenure, EMI, remaining balance
   - Repayment schedule
   - Payment history
   - Penalty history
3. Click **Close** to dismiss

### Add Remarks to a Loan
1. Click **+ Remarks** on a loan card
2. Enter your notes or comments
3. Click **Save Remarks**

---

## Approved Tab

Lists all active (approved) loans with full details — remaining balance, payment schedule, and history.

---

## Overdue Tab

**What you can do:** Manage loans with missed payments and handle penalties.

### View Overdue Loans
1. Click the **Overdue** tab
2. All loans with missed EMIs are listed with the overdue amount and penalty info

### Waive a Penalty
1. Find the loan in the Overdue tab
2. Click **Waive Penalty**
3. Enter **waive remarks** and confirm
4. The penalty is waived for that loan

### Collect a Penalty
1. Find the overdue loan
2. Click **Collect Penalty** and confirm
3. The penalty amount is collected from the customer

### Run Penalty Check
1. Click the **Run Penalty Check** button (in the Overdue or Overview tab)
2. The system scans all active loans for missed EMIs and applies penalties automatically

---

## All Loans Tab

**What you can do:** Browse the complete loan portfolio with optional status filtering.

1. Click the **All Loans** tab
2. Use the **Filter by Status** dropdown: PENDING / APPROVED / REJECTED / CLOSED / OVERDUE
3. Matching loans are listed with full details

---

---

# Customer — Features & Workflow

> Login as **Customer** → You land on `/dashboard`

---

## Dashboard (`/dashboard`)

Gives you a summary view:
- **Total Balance** across all your accounts
- **Recent Transactions** (last 5)
- **Active Loans** count with quick links
- Navigation shortcuts to Accounts, Transactions, Loans, Profile, Statements, Notifications

---

## Accounts (`/accounts`)

**What you can do:** View your accounts, open new accounts, create Fixed Deposits and Recurring Deposits.

### View Your Accounts
1. Click **Accounts** in the sidebar or navigate to `/accounts`
2. All your accounts are listed with account number, type, balance, and status

### Open a New Account
1. Click **+ New Account**
2. Choose account type: **Savings** or **Checking**
3. Click **Create Account**
4. The new account appears in your list

### Create a Fixed Deposit (FD)
1. Click **+ Fixed Deposit**
2. Enter the **Amount** and **Lock Period (months)**
3. Click **Create** — the FD is set up and listed as a locked account

### Create a Recurring Deposit (RD)
1. Click **+ Recurring Deposit**
2. Enter the **Monthly Amount** and **Lock Period (months)**
3. Click **Create** — the RD is set up with automatic monthly contributions

---

## Transactions (`/transactions`)

The Transactions page has five tabs: **Deposit**, **Withdraw**, **Transfer**, **Beneficiaries**, **History**.

### Request a Deposit
1. Click the **Deposit** tab
2. Select your **Account** from the dropdown
3. Enter the **Amount** and optional **Description**
4. Click **Submit Deposit Request**
5. The request goes to admin for approval — you receive a notification once credited

### Withdraw Funds
1. Click the **Withdraw** tab
2. Select the **Account** to withdraw from
3. Enter the **Amount** and optional **Description**
4. Click **Withdraw** — funds are deducted immediately if sufficient balance exists

### Internal Transfer (within NeosCode)
1. Click the **Transfer** tab
2. Make sure **Internal Transfer** mode is selected
3. Choose your **From Account** (by account number)
4. Enter the **To Account Number** — the account holder name is verified live as you type
5. Enter the **Amount** and optional **Description**
6. Click **Transfer** — funds move instantly

### External Transfer
1. Click the **Transfer** tab
2. Switch to **External Transfer** mode
3. Fill in: From Account, Beneficiary Name, Bank Name, Account Number, IFSC Code, Amount, Description
4. Click **Send**

### Manage Beneficiaries
1. Click the **Beneficiaries** tab
2. View your saved beneficiaries list
3. To add one, fill in: **Beneficiary Name**, **Account Number**, **Bank Name**, **IFSC Code**, **Notes**
4. Click **Add Beneficiary** — saved for future quick transfers
5. To remove, click the **Delete** icon next to any beneficiary

### View Transaction History
1. Click the **History** tab
2. All past transactions are listed with date, type, amount, and status

---

## Loans (`/loans`)

### Apply for a Loan
1. Click **Loans** in the sidebar or go to `/loans`
2. Click the **Apply** tab
3. Select **Loan Type**: Personal, Home, Vehicle, or Education
4. Enter the **Amount** and **Tenure (months)**
5. The **Estimated EMI** is calculated and shown live before you submit
6. Click **Apply** — the application is submitted with `PENDING` status and sent to a Loan Officer

### Track Your Loans
1. Click the **My Loans** tab
2. All your loan applications are listed with status badges: PENDING / APPROVED / REJECTED / CLOSED
3. Click **View Details** on any approved loan to see the full repayment schedule and payment history

### Pay an EMI
1. On the **My Loans** tab, find an approved active loan
2. Click **Pay EMI**
3. A modal shows the **EMI amount due**, **due date**, and any **penalty** if the payment is overdue
4. Select the **Account** to pay from
5. Click **Confirm Payment** — the EMI is deducted and the loan's remaining balance updates

---

## Profile (`/profile`)

### View Profile Information
1. Click **Profile** in the sidebar or go to `/profile`
2. Your name, email, role, and linked accounts are displayed

### Enable Two-Factor Authentication (2FA)
1. Go to `/profile`
2. Find the **Two-Factor Authentication** section
3. Click **Enable 2FA**
4. A **QR Code** is displayed — scan it with an authenticator app (Google Authenticator, Authy, etc.)
5. Enter the **6-digit OTP** from your authenticator app
6. Click **Verify & Enable** — 2FA is now active on your account

### Disable 2FA
1. Go to `/profile`
2. Click **Disable 2FA**
3. Enter your **current password** to confirm
4. Click **Disable** — 2FA is removed

### Delete an Account
1. Go to `/profile`
2. Under your accounts list, click **Delete** on the account you want to close
3. If the account has a balance, a deletion request is sent to admin for approval
4. If the balance is zero, the account is deleted immediately

---

## Monthly Statements (`/statements`)

### Generate a Monthly Statement
1. Click **Statements** in the sidebar or go to `/statements`
2. Select your **Account** from the dropdown
3. Choose the **Year** and **Month**
4. Click **Generate Statement**
5. The statement displays: opening balance, all credits, all debits, closing balance, and a full transaction list

### Download Statement as PDF
1. After generating a statement
2. Click **Download PDF**
3. The statement is downloaded as a PDF file to your device

---

## Notifications (`/notifications`)

### View Notifications
1. Click **Notifications** in the sidebar or go to `/notifications`
2. All notifications are listed with type icons:
   - 💳 Transaction alerts
   - 🏦 Loan status updates
   - 📒 Account activity
   - 🔒 Security alerts
   - 🔔 General announcements
3. Unread notifications are visually highlighted

### Filter Notifications
1. Use the **All / Unread** toggle at the top of the page
2. Select **Unread** to see only new notifications

### Mark as Read
1. Click **Mark as Read** on an individual notification
2. Or click **Mark All as Read** to clear all unread at once

### Delete a Notification
1. Click the **× (Delete)** button on any notification to remove it permanently

---

## Navigation Summary

| Page | URL | Who Can Access |
|---|---|---|
| Login | `/login` | Everyone |
| Register | `/register` | Everyone (self-signup as Customer) |
| Dashboard | `/dashboard` | Admin, Customer |
| Admin Panel | `/admin` | Admin only |
| Staff Dashboard | `/staff` | Admin, Employee |
| Loan Officer Dashboard | `/loan-officers` | Admin, Employee |
| Accounts | `/accounts` | Customer, Admin |
| Transactions | `/transactions` | Customer, Admin |
| Loans | `/loans` | Customer, Admin |
| Profile | `/profile` | All logged-in users |
| Monthly Statements | `/statements` | Customer, Admin |
| Notifications | `/notifications` | All logged-in users |

---

## Default Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bank.com | Admin@123 |
| Employee | employee@bank.com | Employee@123 |
| Customer | customer@bank.com | Customer@123 |

> Credentials may vary based on your seed data. Check `database/seed.sql` for the actual seeded accounts.
READMEEOF`, and this is the output of running that command instead:
mdrakibhossain@Rakib-MacBook-Air neoscode %  cat > /Users/mdrakibhossain/Downloa
ds/github/neoscode/README.md << 'READMEEOF'
# NeosCode Banking System — UI Guide

A full-featured online banking platform with role-based dashboards for
**Admins**, **Employees** (Staff & Loan Officers), and **Customers**.

---

## Getting Started

### 1. Start the Application

```bash
# Install dependencies (root + client)
npm install
cd client && npm install && cd ..

# Start backend + frontend together
npm run start:dev        # backend on http://localhost:3001
cd client && npm run dev # frontend on http://localhost:5173

### 2. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## Authentication

### Register a New Customer Account

1. Go to **http://localhost:5173/register**
2. Fill in your **Name**, **Email**, and **Password**
3. Click **Register**
4. You are redirected to the **Login** page

### Login

1. Go to **http://localhost:5173/login**
2. Enter your **Email** and **Password**
3. Click **Login**
4. You are redirected to your role-based dashboard automatically:
   - **Admin** → Dashboard with Admin Panel, Staff Panel & Loan Officer
 shortcuts
   - **Employee** → Staff Dashboard or Loan Officer Dashboard
   - **Customer** → Personal Dashboard

### Logout

Click your profile or the **Logout** button in the sidebar navigation.

---

## Role Overview

| Role | Default Landing Page | Access |
|---|---|---|
| Admin | `/dashboard` | All modules + Admin Panel |
| Employee | `/staff` or `/loan-officers` | Staff Dashboard, Loan Offic
er Dashboard |
| Customer | `/dashboard` | Accounts, Transactions, Loans, Profile, Sta
tements, Notifications |

---

---

# Admin — Features & Workflow

> Login as **Admin** → Click **Admin Panel** from the dashboard quick l
inks or navigate to `/admin`

The Admin Panel has **tabbed sections** at the top. Click each tab to s
witch between management areas.

---

## Tab: Users

**What you can do:** View all registered users, create employee account
s, activate/deactivate users, lock/unlock accounts.

### View All Users
1. Open **Admin Panel** (`/admin`)
2. The **Users** tab is selected by default
3. A table lists all users with their name, email, role, and current st
atus

### Create a New Employee
1. Click **"+ Create Employee"** (top-right of the Users tab)
2. A modal appears — fill in **Name**, **Email**, **Password**
3. Click **Create Employee**
4. The new employee appears in the user list with the `EMPLOYEE` role

### Activate / Deactivate a User
1. Find the user in the Users table
2. Click **Activate** or **Deactivate** next to their name
3. Confirm the action — the user's status updates immediately

### Lock a User
1. Find the user in the Users table
2. Click **Lock**
3. Enter a **reason** in the prompt and click OK
4. The user is locked and cannot log in

### Unlock a User
1. Find the locked user in the Users table
2. Click **Unlock**
3. Optionally enter a reason, click OK
4. The user's sessions are restored

---

## Tab: Accounts

**What you can do:** View all customer accounts system-wide, freeze/unf
reeze accounts, close accounts.

### Freeze an Account
1. Click the **Accounts** tab
2. Find the account in the table
3. Click **Freeze** — enter a **reason** when prompted
4. The account status changes to FROZEN; the customer cannot transact

### Unfreeze an Account
1. Find the frozen account in the Accounts table
2. Click **Unfreeze** — optionally enter a reason
3. The account becomes active again

### Close an Account
1. Find the account in the Accounts table
2. Click **Close Account**
3. Enter a **reason** and confirm
4. The account is permanently marked CLOSED

---

## Tab: Transactions

**What you can do:** View all transactions system-wide, reverse a trans
action.

### Reverse a Transaction
1. Click the **Transactions** tab (data loads automatically)
2. Find the transaction in the table
3. Click **Reverse**
4. Enter a **reason** and confirm
5. The reversal is applied and reflected in both accounts

---

## Tab: Loans

**What you can do:** View all loan applications, approve or reject them
.

### Approve a Loan
1. Click the **Loans** tab
2. Find a loan with `PENDING` status
3. Click **Approve**
4. Enter **approval notes** and optionally a **recommended EMI**
5. Click Confirm — the loan status changes to `APPROVED`

### Reject a Loan
1. Click the **Loans** tab
2. Find a `PENDING` loan
3. Click **Reject** — enter a rejection reason
4. Click Confirm — the loan status changes to `REJECTED`

---

## Tab: Deposits

**What you can do:** Review customer deposit requests and approve or re
ject them.

### Approve a Deposit Request
1. Click the **Deposits** tab
2. Find the pending deposit request
3. Click **Approve** — optionally enter approval remarks
4. Confirm — the amount is credited to the customer's account

### Reject a Deposit Request
1. Click the **Deposits** tab
2. Find the deposit request
3. Click **Reject** — enter a rejection reason (required)
4. The request is marked rejected; no amount is credited

---

## Tab: System Config

**What you can do:** Set transaction limits, fee configuration, and int
erest rates.

### Set Transaction Limits
1. Click the **Config** tab and then **Set Limits**
2. A modal opens with fields:
   - **Daily Transfer Limit**
   - **Daily Withdrawal Limit**
   - **Per Transaction Limit**
3. Update values and click **Save**

### Set Fee Configuration
1. Click **Set Fees** in the Config tab
2. Set **Transfer Fee**, **Withdrawal Fee**, **Monthly Maintenance Fee*
*
3. Click **Save**

### Set Interest Rate
1. Click **Set Interest Rate**
2. Choose the **Account Type** (SAVINGS / CHECKING)
3. Enter the **Interest Rate (%)**
4. Click **Save**

---

## Tab: Audit Logs

**What you can do:** View a full audit trail of every system action.

1. Click the **Audit** tab
2. All admin and system actions are listed in chronological order with
timestamps, actor, and description

---

---

# Employee (Staff) — Features & Workflow

> Login as **Employee** → You are automatically redirected to `/staff`
(Staff Dashboard)

The Staff Dashboard has three tabs: **Overview**, **Customers**, **Tran
sactions**.

---

## Overview Tab

Displays key stats at a glance:
- Total Customers
- Total Accounts managed
- Active Today count
- Pending Requests count

A **Quick Search** box is available — type a customer's name or email t
o jump directly to their profile.

---

## Customers Tab

**What you can do:** Search and select customers, view their accounts,
perform account and transaction operations.

### Find a Customer
1. Click the **Customers** tab
2. Type in the **Search Customers** box (name or email)
3. Results filter in real time as you type
4. Click a customer row to open their Customer Detail Panel

### View Customer Accounts & Transactions
1. Select a customer from the search results or the customer list
2. The detail panel shows their **Account Cards** (balance, type, statu
s) and their **Recent Transactions**

### Deposit to a Customer Account
1. Open a customer's detail panel
2. On the account card, click **Deposit**
3. A modal opens — enter the **Amount** and an optional **Description**

4. Click **Submit** — the amount is credited and a success message appe
ars

### Withdraw from a Customer Account
1. Open a customer's detail panel
2. Click **Withdraw** on the account card
3. Enter the **Amount** and optional **Description**
4. Click **Submit** — the amount is debited

### Transfer Between Accounts
1. Open a customer's detail panel
2. Click **Transfer** on the source account card
3. Enter the **Destination Account ID**, **Amount**, and optional **Des
cription**
4. Click **Submit**

### Freeze a Customer Account
1. Open a customer's detail panel
2. Click **Freeze** on the account card
3. A modal appears — enter a **Reason** (required)
4. Click **Freeze Account** — the account is frozen; the customer canno
t transact

### Unfreeze a Customer Account
1. Find the frozen account in the customer's panel
2. Click **Unfreeze** — the account is immediately reactivated

---

## Transactions Tab

Provides a real-time overview of recent transactions across all custome
rs managed by this staff member.

---

---

# Employee (Loan Officer) — Features & Workflow

> Login as **Employee** → Click the **Loan Officer** shortcut on your d
ashboard, or navigate to `/loan-officers`

The Loan Officer Dashboard has five tabs: **Overview**, **Pending**, **
Approved**, **Overdue**, **All Loans**.

---

## Overview Tab

Shows summary statistics:
- Total Loans in the system
- Pending Loans count
- Approved Loans active
- Overdue Loans count
- Total Disbursed Amount

---

## Pending Tab

**What you can do:** Review and act on loan applications waiting for a
decision.

### Approve a Loan
1. Click the **Pending** tab — all pending loan applications are listed
 with customer name, loan type, amount, interest rate, tenure, and EMI
2. Click **✓ Approve** on a loan card
3. A modal opens — enter **Approval Notes** (required) and optionally a
 **Recommended EMI**
4. Click **Confirm Approval** — the loan is approved and the customer i
s notified

### Reject a Loan
1. Click the **Pending** tab
2. Click **✗ Reject** on the loan card
3. Enter a **Rejection Reason** (required)
4. Click **Confirm Rejection** — the loan is rejected and the customer
is notified

### View Full Loan Details
1. Click **Details** on any loan card
2. A detail panel opens showing:
   - Loan info: type, amount, interest rate, tenure, EMI, remaining bal
ance
   - Repayment schedule
   - Payment history
   - Penalty history
3. Click **Close** to dismiss

### Add Remarks to a Loan
1. Click **+ Remarks** on a loan card
2. Enter your notes or comments
3. Click **Save Remarks**

---

## Approved Tab

Lists all active (approved) loans with full details — remaining balance
, payment schedule, and history.

---

## Overdue Tab

**What you can do:** Manage loans with missed payments and handle penal
ties.

### View Overdue Loans
1. Click the **Overdue** tab
2. All loans with missed EMIs are listed with the overdue amount and pe
nalty info

### Waive a Penalty
1. Find the loan in the Overdue tab
2. Click **Waive Penalty**
3. Enter **waive remarks** and confirm
4. The penalty is waived for that loan

### Collect a Penalty
1. Find the overdue loan
2. Click **Collect Penalty** and confirm
3. The penalty amount is collected from the customer

### Run Penalty Check
1. Click the **Run Penalty Check** button (in the Overdue or Overview t
ab)
2. The system scans all active loans for missed EMIs and applies penalt
ies automatically

---

## All Loans Tab

**What you can do:** Browse the complete loan portfolio with optional s
tatus filtering.

1. Click the **All Loans** tab
2. Use the **Filter by Status** dropdown: PENDING / APPROVED / REJECTED
 / CLOSED / OVERDUE
3. Matching loans are listed with full details

---

---

# Customer — Features & Workflow

> Login as **Customer** → You land on `/dashboard`

---

## Dashboard (`/dashboard`)

Gives you a summary view:
- **Total Balance** across all your accounts
- **Recent Transactions** (last 5)
- **Active Loans** count with quick links
- Navigation shortcuts to Accounts, Transactions, Loans, Profile, State
ments, Notifications

---

## Accounts (`/accounts`)

**What you can do:** View your accounts, open new accounts, create Fixe
d Deposits and Recurring Deposits.

### View Your Accounts
1. Click **Accounts** in the sidebar or navigate to `/accounts`
2. All your accounts are listed with account number, type, balance, and
 status

### Open a New Account
1. Click **+ New Account**
2. Choose account type: **Savings** or **Checking**
3. Click **Create Account**
4. The new account appears in your list

### Create a Fixed Deposit (FD)
1. Click **+ Fixed Deposit**
2. Enter the **Amount** and **Lock Period (months)**
3. Click **Create** — the FD is set up and listed as a locked account

### Create a Recurring Deposit (RD)
1. Click **+ Recurring Deposit**
2. Enter the **Monthly Amount** and **Lock Period (months)**
3. Click **Create** — the RD is set up with automatic monthly contribut
ions

---

## Transactions (`/transactions`)

The Transactions page has five tabs: **Deposit**, **Withdraw**, **Trans
fer**, **Beneficiaries**, **History**.

### Request a Deposit
1. Click the **Deposit** tab
2. Select your **Account** from the dropdown
3. Enter the **Amount** and optional **Description**
4. Click **Submit Deposit Request**
5. The request goes to admin for approval — you receive a notification
once credited

### Withdraw Funds
1. Click the **Withdraw** tab
2. Select the **Account** to withdraw from
3. Enter the **Amount** and optional **Description**
4. Click **Withdraw** — funds are deducted immediately if sufficient ba
lance exists

### Internal Transfer (within NeosCode)
1. Click the **Transfer** tab
2. Make sure **Internal Transfer** mode is selected
3. Choose your **From Account** (by account number)
4. Enter the **To Account Number** — the account holder name is verifie
d live as you type
5. Enter the **Amount** and optional **Description**
6. Click **Transfer** — funds move instantly

### External Transfer
1. Click the **Transfer** tab
2. Switch to **External Transfer** mode
3. Fill in: From Account, Beneficiary Name, Bank Name, Account Number,
IFSC Code, Amount, Description
4. Click **Send**

### Manage Beneficiaries
1. Click the **Beneficiaries** tab
2. View your saved beneficiaries list
3. To add one, fill in: **Beneficiary Name**, **Account Number**, **Ban
k Name**, **IFSC Code**, **Notes**
4. Click **Add Beneficiary** — saved for future quick transfers
5. To remove, click the **Delete** icon next to any beneficiary

### View Transaction History
1. Click the **History** tab
2. All past transactions are listed with date, type, amount, and status


---

## Loans (`/loans`)

### Apply for a Loan
1. Click **Loans** in the sidebar or go to `/loans`
2. Click the **Apply** tab
3. Select **Loan Type**: Personal, Home, Vehicle, or Education
4. Enter the **Amount** and **Tenure (months)**
5. The **Estimated EMI** is calculated and shown live before you submit

6. Click **Apply** — the application is submitted with `PENDING` status
 and sent to a Loan Officer

### Track Your Loans
1. Click the **My Loans** tab
2. All your loan applications are listed with status badges: PENDING /
APPROVED / REJECTED / CLOSED
3. Click **View Details** on any approved loan to see the full repaymen
t schedule and payment history

### Pay an EMI
1. On the **My Loans** tab, find an approved active loan
2. Click **Pay EMI**
3. A modal shows the **EMI amount due**, **due date**, and any **penalt
y** if the payment is overdue
4. Select the **Account** to pay from
5. Click **Confirm Payment** — the EMI is deducted and the loan's remai
ning balance updates

---

## Profile (`/profile`)

### View Profile Information
1. Click **Profile** in the sidebar or go to `/profile`
2. Your name, email, role, and linked accounts are displayed

### Enable Two-Factor Authentication (2FA)
1. Go to `/profile`
2. Find the **Two-Factor Authentication** section
3. Click **Enable 2FA**
4. A **QR Code** is displayed — scan it with an authenticator app (Goog
le Authenticator, Authy, etc.)
5. Enter the **6-digit OTP** from your authenticator app
6. Click **Verify & Enable** — 2FA is now active on your account

### Disable 2FA
1. Go to `/profile`
2. Click **Disable 2FA**
3. Enter your **current password** to confirm
4. Click **Disable** — 2FA is removed

### Delete an Account
1. Go to `/profile`
2. Under your accounts list, click **Delete** on the account you want t
o close
3. If the account has a balance, a deletion request is sent to admin fo
r approval
4. If the balance is zero, the account is deleted immediately

---

## Monthly Statements (`/statements`)

### Generate a Monthly Statement
1. Click **Statements** in the sidebar or go to `/statements`
2. Select your **Account** from the dropdown
3. Choose the **Year** and **Month**
4. Click **Generate Statement**
5. The statement displays: opening balance, all credits, all debits, cl
osing balance, and a full transaction list

### Download Statement as PDF
1. After generating a statement
2. Click **Download PDF**
3. The statement is downloaded as a PDF file to your device

---

## Notifications (`/notifications`)

### View Notifications
1. Click **Notifications** in the sidebar or go to `/notifications`
2. All notifications are listed with type icons:
   - 💳 Transaction alerts
   - 🏦 Loan status updates
   - 📒 Account activity
   - 🔒 Security alerts
   - 🔔 General announcements
3. Unread notifications are visually highlighted

### Filter Notifications
1. Use the **All / Unread** toggle at the top of the page
2. Select **Unread** to see only new notifications

### Mark as Read
1. Click **Mark as Read** on an individual notification
2. Or click **Mark All as Read** to clear all unread at once

### Delete a Notification
1. Click the **× (Delete)** button on any notification to remove it per
manently

---

## Navigation Summary

| Page | URL | Who Can Access |
|---|---|---|
| Login | `/login` | Everyone |
| Register | `/register` | Everyone (self-signup as Customer) |
| Dashboard | `/dashboard` | Admin, Customer |
| Admin Panel | `/admin` | Admin only |
| Staff Dashboard | `/staff` | Admin, Employee |
| Loan Officer Dashboard | `/loan-officers` | Admin, Employee |
| Accounts | `/accounts` | Customer, Admin |
| Transactions | `/transactions` | Customer, Admin |
| Loans | `/loans` | Customer, Admin |
| Profile | `/profile` | All logged-in users |
| Monthly Statements | `/statements` | Customer, Admin |
| Notifications | `/notifications` | All logged-in users |

---

## Default Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bank.com | Admin@123 |
| Employee | employee@bank.com | Employee@123 |
| Customer | customer@bank.com | Customer@123 |

> Credentials may vary based on your seed data. Check `database/seed.sq
l` for the actual seeded accounts.
````
