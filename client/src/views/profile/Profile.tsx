import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../controllers/auth.controller';
import { accountController } from '../../controllers/account.controller';
import { Account } from '../../models/types';
import './Profile.css';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newAccount, setNewAccount] = useState({
    account_type: 'SAVINGS',
    currency: 'USD',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      await accountController.loadAccounts();
      const fetchedAccounts = accountController.getAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create account');
      }

      alert('Account created successfully!');
      setShowCreateModal(false);
      setNewAccount({ account_type: 'SAVINGS', currency: 'USD' });
      loadAccounts();
    } catch (error: any) {
      alert(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    const balance = parseFloat(String(account.balance));

    if (balance < 0) {
      alert(
        'Cannot delete account with negative balance. Please clear your debt first.',
      );
      return;
    }

    const confirmMessage =
      balance > 0
        ? `This account has a balance of $${balance.toFixed(2)}. A deletion request will be sent to admin for approval. Continue?`
        : `Are you sure you want to delete this account?`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/accounts/${accountId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }

      const result = await response.json();

      if (result.requiresApproval) {
        alert(
          'Account deletion request submitted. Waiting for admin approval.',
        );
      } else {
        alert('Account deleted successfully!');
      }

      loadAccounts();
    } catch (error: any) {
      alert(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Customer Profile</h1>
      </div>

      <div className="profile-content">
        {/* User Information Section */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="user-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Accounts</h2>
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create New Account
            </button>
          </div>

          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account.id} className="account-card">
                <div className="account-card-header">
                  <h3>{account.account_type}</h3>
                  {account.isFrozen && (
                    <span className="badge badge-danger">Frozen</span>
                  )}
                </div>
                <div className="account-card-body">
                  <p className="account-number">
                    <strong>Account Number:</strong> {account.account_number}
                  </p>
                  <p className="account-balance">
                    <strong>Balance:</strong> $
                    {parseFloat(String(account.balance)).toFixed(2)}{' '}
                    {account.currency}
                  </p>
                  <p className="account-status">
                    <strong>Status:</strong> {account.status}
                  </p>
                </div>
                <div className="account-card-footer">
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    disabled={loading || account.isFrozen}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="no-accounts">
                <p>No accounts found. Create your first account!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Account</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={newAccount.account_type}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      account_type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="CHECKING">Checking</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                  <option value="RECURRING_DEPOSIT">Recurring Deposit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={newAccount.currency}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, currency: e.target.value })
                  }
                  required
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="BDT">BDT</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
