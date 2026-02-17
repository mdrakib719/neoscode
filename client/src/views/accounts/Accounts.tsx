import React, { useEffect, useState } from 'react';
import { accountController } from '../../controllers/account.controller';
import { Account } from '../../models/types';
import './Accounts.css';

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFDForm, setShowFDForm] = useState(false);
  const [showRDForm, setShowRDForm] = useState(false);
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING'>(
    'SAVINGS',
  );
  const [fdData, setFdData] = useState({
    amount: '',
    lock_period_months: '',
  });
  const [rdData, setRdData] = useState({
    monthly_amount: '',
    lock_period_months: '',
  });

  const loadAccounts = async () => {
    try {
      setLoading(true);
      await accountController.loadAccounts();
      const fetchedAccounts = accountController.getAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async () => {
    try {
      await accountController.createAccount(accountType);
      setShowCreateForm(false);
      loadAccounts();
      alert('Account created successfully!');
    } catch (error: any) {
      console.error('Failed to create account:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create account';
      alert(`Failed to create account: ${errorMessage}`);
    }
  };

  const handleCreateFD = async () => {
    try {
      await accountController.createFixedDeposit(
        parseFloat(fdData.amount),
        parseInt(fdData.lock_period_months),
      );
      setShowFDForm(false);
      setFdData({ amount: '', lock_period_months: '' });
      loadAccounts();
      alert('Fixed Deposit created successfully!');
    } catch (error: any) {
      console.error('Failed to create FD:', error);
      alert(error.response?.data?.message || 'Failed to create Fixed Deposit');
    }
  };

  const handleCreateRD = async () => {
    try {
      await accountController.createRecurringDeposit(
        parseFloat(rdData.monthly_amount),
        parseInt(rdData.lock_period_months),
      );
      setShowRDForm(false);
      setRdData({ monthly_amount: '', lock_period_months: '' });
      loadAccounts();
      alert('Recurring Deposit created successfully!');
    } catch (error: any) {
      console.error('Failed to create RD:', error);
      alert(
        error.response?.data?.message || 'Failed to create Recurring Deposit',
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading accounts...</div>;
  }

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h1>My Accounts</h1>
        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + New Account
          </button>
          <button className="btn-secondary" onClick={() => setShowFDForm(true)}>
            + Fixed Deposit
          </button>
          <button className="btn-secondary" onClick={() => setShowRDForm(true)}>
            + Recurring Deposit
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Account</h2>
            <div className="form-group">
              <label>Account Type</label>
              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(e.target.value as 'SAVINGS' | 'CHECKING')
                }
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CHECKING">Checking Account</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateAccount}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showFDForm && (
        <div className="modal-overlay" onClick={() => setShowFDForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Fixed Deposit</h2>
            <div className="form-group">
              <label>Deposit Amount ($)</label>
              <input
                type="number"
                value={fdData.amount}
                onChange={(e) =>
                  setFdData({ ...fdData, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group">
              <label>Lock Period (Months)</label>
              <input
                type="number"
                value={fdData.lock_period_months}
                onChange={(e) =>
                  setFdData({ ...fdData, lock_period_months: e.target.value })
                }
                placeholder="Minimum 3 months"
                min="3"
              />
            </div>
            <p className="info-text">Interest Rate: 7.5% per annum</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowFDForm(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateFD}>
                Create FD
              </button>
            </div>
          </div>
        </div>
      )}

      {showRDForm && (
        <div className="modal-overlay" onClick={() => setShowRDForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Recurring Deposit</h2>
            <div className="form-group">
              <label>Monthly Deposit Amount ($)</label>
              <input
                type="number"
                value={rdData.monthly_amount}
                onChange={(e) =>
                  setRdData({ ...rdData, monthly_amount: e.target.value })
                }
                placeholder="Enter monthly amount"
              />
            </div>
            <div className="form-group">
              <label>Lock Period (Months)</label>
              <input
                type="number"
                value={rdData.lock_period_months}
                onChange={(e) =>
                  setRdData({ ...rdData, lock_period_months: e.target.value })
                }
                placeholder="Minimum 6 months"
                min="6"
              />
            </div>
            <p className="info-text">Interest Rate: 6.5% per annum</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowRDForm(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateRD}>
                Create RD
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="accounts-grid">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No accounts found. Create your first account!</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <h3>{account.account_type.replace('_', ' ')}</h3>
                <span className="account-number">{account.account_number}</span>
              </div>
              <div className="account-balance">
                <span className="balance-label">Balance</span>
                <span className="balance-amount">
                  {account.currency}{' '}
                  {parseFloat(account.balance.toString()).toFixed(2)}
                </span>
              </div>

              {(account.account_type === 'FIXED_DEPOSIT' ||
                account.account_type === 'RECURRING_DEPOSIT') && (
                <div className="deposit-details">
                  <div className="detail-row">
                    <span>Interest Rate:</span>
                    <span>{account.deposit_interest_rate}%</span>
                  </div>
                  <div className="detail-row">
                    <span>Lock Period:</span>
                    <span>{account.lock_period_months} months</span>
                  </div>
                  {account.maturity_date && (
                    <div className="detail-row">
                      <span>Maturity Date:</span>
                      <span>{formatDate(account.maturity_date)}</span>
                    </div>
                  )}
                  {account.maturity_amount && (
                    <div className="detail-row">
                      <span>Maturity Amount:</span>
                      <span className="maturity-amount">
                        $
                        {parseFloat(account.maturity_amount.toString()).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="account-footer">
                <small>Created: {formatDate(account.created_at)}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
