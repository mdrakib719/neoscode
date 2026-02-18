import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../controllers/auth.controller';
import { useAccountStore } from '../../controllers/account.controller';
import { useTransactionStore } from '../../controllers/transaction.controller';
import { useLoanStore } from '../../controllers/loan.controller';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    accounts,
    fetchAccounts,
    isLoading: accountsLoading,
  } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { loans, fetchLoans } = useLoanStore();

  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    if (!isEmployee) {
      fetchAccounts();
      fetchTransactions();
      fetchLoans();
    }
  }, [isEmployee]);

  // Redirect employees to their dedicated dashboard (after hooks)
  if (isEmployee) {
    return <Navigate to="/staff" replace />;
  }

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(String(acc.balance)),
    0,
  );
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>
          {user?.role === 'ADMIN'
            ? 'System Administrator — Full access to all modules'
            : 'Manage your accounts, transactions, and loans'}
        </p>
      </div>

      {/* Admin quick links to employee dashboards */}
      {user?.role === 'ADMIN' && (
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <Link to="/staff" style={{ textDecoration: 'none' }}>
            <div
              className="summary-card"
              style={{ cursor: 'pointer', border: '2px solid #000' }}
            >
              <div className="summary-icon" style={{ background: '#000' }}>
                🏦
              </div>
              <div>
                <p className="summary-label">Staff Panel</p>
                <h2 className="summary-value" style={{ fontSize: 16 }}>
                  Customer Ops
                </h2>
              </div>
            </div>
          </Link>
          <Link to="/loan-officers" style={{ textDecoration: 'none' }}>
            <div
              className="summary-card"
              style={{ cursor: 'pointer', border: '2px solid #000' }}
            >
              <div className="summary-icon" style={{ background: '#333' }}>
                📋
              </div>
              <div>
                <p className="summary-label">Loan Officer</p>
                <h2 className="summary-value" style={{ fontSize: 16 }}>
                  Loan Mgmt
                </h2>
              </div>
            </div>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <div
              className="summary-card"
              style={{ cursor: 'pointer', border: '1px solid #e0e0e0' }}
            >
              <div className="summary-icon" style={{ background: '#555' }}>
                ⚙
              </div>
              <div>
                <p className="summary-label">Admin Panel</p>
                <h2 className="summary-value" style={{ fontSize: 16 }}>
                  System Config
                </h2>
              </div>
            </div>
          </Link>
          <Link to="/accounts" style={{ textDecoration: 'none' }}>
            <div
              className="summary-card"
              style={{ cursor: 'pointer', border: '1px solid #e0e0e0' }}
            >
              <div className="summary-icon" style={{ background: '#777' }}>
                💳
              </div>
              <div>
                <p className="summary-label">Accounts</p>
                <h2 className="summary-value" style={{ fontSize: 16 }}>
                  All Accounts
                </h2>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-4">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#667eea' }}>
            💰
          </div>
          <div>
            <p className="summary-label">Total Balance</p>
            <h2 className="summary-value">${totalBalance.toFixed(2)}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#48bb78' }}>
            🏦
          </div>
          <div>
            <p className="summary-label">Accounts</p>
            <h2 className="summary-value">{accounts.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#f59e0b' }}>
            💸
          </div>
          <div>
            <p className="summary-label">Transactions</p>
            <h2 className="summary-value">{transactions.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#ef4444' }}>
            📋
          </div>
          <div>
            <p className="summary-label">Loans</p>
            <h2 className="summary-value">{loans.length}</h2>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="card">
        <div className="card-header">
          <h2>Your Accounts</h2>
        </div>

        {accountsLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account.id} className="account-item">
                <div className="account-info">
                  <div className="account-number">{account.account_number}</div>
                  <div className="account-type">{account.account_type}</div>
                </div>
                <div className="account-balance">
                  ${parseFloat(String(account.balance)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((txn) => (
              <tr key={txn.id}>
                <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                <td>{txn.type}</td>
                <td
                  className={
                    txn.type === 'DEPOSIT' ? 'text-success' : 'text-danger'
                  }
                >
                  {txn.type === 'DEPOSIT' ? '+' : '-'}$
                  {parseFloat(String(txn.amount)).toFixed(2)}
                </td>
                <td>
                  <span
                    className={`badge badge-${txn.status === 'COMPLETED' ? 'success' : 'warning'}`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td>{txn.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
