#!/bin/bash

# Banking System Query Runner
# Easy script to run common queries

DB_NAME="banking_system"
DB_USER="root"

echo "======================================"
echo "Banking System - Query Runner"
echo "======================================"
echo ""

# Function to run query
run_query() {
    echo "📊 $1"
    echo "--------------------------------------"
    mysql -u $DB_USER $DB_NAME -e "$2"
    echo ""
}

# Main menu
echo "Select a query to run:"
echo ""
echo "1. System Overview"
echo "2. All Users"
echo "3. All Accounts"
echo "4. User Balance (Alice Johnson)"
echo "5. Recent Transactions"
echo "6. Loan Statistics"
echo "7. Account Summary View"
echo "8. Monthly Interest Calculation"
echo "9. Calculate EMI for ₹100,000 loan"
echo "10. Pending Loans"
echo "11. Run All Queries"
echo "0. Exit"
echo ""
read -p "Enter your choice (0-11): " choice

case $choice in
    1)
        run_query "System Overview" "
        SELECT 
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM accounts) AS total_accounts,
            (SELECT COUNT(*) FROM transactions) AS total_transactions,
            (SELECT COUNT(*) FROM loans) AS total_loans,
            (SELECT SUM(balance) FROM accounts) AS total_deposits,
            (SELECT SUM(amount) FROM loans WHERE status = 'APPROVED') AS total_loans_disbursed;
        "
        ;;
    2)
        run_query "All Users" "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;"
        ;;
    3)
        run_query "All Accounts" "SELECT * FROM view_account_summary;"
        ;;
    4)
        run_query "User Balance - Alice Johnson" "CALL sp_get_user_balance(4);"
        ;;
    5)
        run_query "Recent Transactions (Last 10)" "
        SELECT 
            id,
            type,
            amount,
            status,
            description,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as date
        FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 10;
        "
        ;;
    6)
        run_query "Loan Statistics by Type & Status" "
        SELECT 
            loan_type,
            status,
            COUNT(*) AS loan_count,
            SUM(amount) AS total_amount,
            AVG(interest_rate) AS avg_rate
        FROM loans
        GROUP BY loan_type, status;
        "
        ;;
    7)
        run_query "Account Summary View" "SELECT * FROM view_account_summary LIMIT 10;"
        ;;
    8)
        run_query "Monthly Interest Calculation (4% Annual)" "
        SELECT 
            account_number,
            account_type,
            balance AS current_balance,
            ROUND(balance * 0.04 / 12, 2) AS monthly_interest,
            ROUND(balance + (balance * 0.04 / 12), 2) AS new_balance
        FROM accounts
        WHERE account_type = 'SAVINGS' AND balance > 0;
        "
        ;;
    9)
        run_query "EMI Calculator - ₹100,000 @ 8.5% for 36 months" "
        SELECT 
            100000 AS loan_amount,
            8.5 AS interest_rate,
            36 AS tenure_months,
            fn_calculate_emi(100000, 8.5, 36) AS monthly_emi,
            fn_calculate_emi(100000, 8.5, 36) * 36 AS total_payment,
            (fn_calculate_emi(100000, 8.5, 36) * 36) - 100000 AS total_interest;
        "
        ;;
    10)
        run_query "Pending Loans" "CALL sp_get_pending_loans();"
        ;;
    11)
        echo "Running all queries..."
        echo ""
        run_query "1. System Overview" "
        SELECT 
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM accounts) AS total_accounts,
            (SELECT COUNT(*) FROM transactions) AS total_transactions,
            (SELECT COUNT(*) FROM loans) AS total_loans;
        "
        
        run_query "2. Users by Role" "
        SELECT role, COUNT(*) AS count FROM users GROUP BY role;
        "
        
        run_query "3. Accounts by Type" "
        SELECT account_type, COUNT(*) AS count, SUM(balance) AS total_balance 
        FROM accounts GROUP BY account_type;
        "
        
        run_query "4. Transaction Statistics" "
        SELECT type, status, COUNT(*) AS count, SUM(amount) AS total 
        FROM transactions GROUP BY type, status;
        "
        
        run_query "5. Loan Summary" "
        SELECT status, COUNT(*) AS count, SUM(amount) AS total_amount 
        FROM loans GROUP BY status;
        "
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac

echo "======================================"
echo "Query completed successfully!"
echo "======================================"
