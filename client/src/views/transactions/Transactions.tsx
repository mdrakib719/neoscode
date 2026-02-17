import React, { useEffect, useState } from 'react';
import { transactionController } from '../../controllers/transaction.controller';
import { accountController } from '../../controllers/account.controller';
import { Transaction, Account, Beneficiary } from '../../models/types';
import './Transactions.css';

export const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'deposit' | 'withdraw' | 'transfer' | 'beneficiary' | 'history'
  >('deposit');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);

  const [depositData, setDepositData] = useState({
    accountId: '',
    amount: '',
    description: '',
  });

  const [withdrawData, setWithdrawData] = useState({
    accountId: '',
    amount: '',
    description: '',
  });

  const [transferData, setTransferData] = useState({
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: '',
    description: '',
  });

  const [beneficiaryData, setBeneficiaryData] = useState({
    beneficiary_name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    notes: '',
  });

  useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadBeneficiaries();
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

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:3001/api/transactions/beneficiaries',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Failed to load beneficiaries:', error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionController.deposit({
        accountId: parseInt(depositData.accountId),
        amount: parseFloat(depositData.amount),
        description: depositData.description,
      });
      alert(
        'Deposit request submitted successfully! Waiting for admin approval.',
      );
      setDepositData({ accountId: '', amount: '', description: '' });
      loadAccounts();
      loadTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Deposit request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionController.withdraw({
        accountId: parseInt(withdrawData.accountId),
        amount: parseFloat(withdrawData.amount),
        description: withdrawData.description,
      });
      alert('Withdrawal successful!');
      setWithdrawData({ accountId: '', amount: '', description: '' });
      loadAccounts();
      loadTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionController.transfer({
        fromAccountNumber: transferData.fromAccountNumber,
        toAccountNumber: transferData.toAccountNumber,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
      });
      alert('Transfer successful!');
      setTransferData({
        fromAccountNumber: '',
        toAccountNumber: '',
        amount: '',
        description: '',
      });
      loadAccounts();
      loadTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:3001/api/transactions/beneficiaries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(beneficiaryData),
        },
      );

      if (!response.ok) throw new Error('Failed to add beneficiary');

      alert('Beneficiary added successfully!');
      setBeneficiaryData({
        beneficiary_name: '',
        account_number: '',
        bank_name: '',
        ifsc_code: '',
        notes: '',
      });
      loadBeneficiaries();
    } catch (error) {
      alert('Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBeneficiary = async (id: number) => {
    if (!confirm('Are you sure you want to delete this beneficiary?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/transactions/beneficiaries/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Failed to delete beneficiary');

      alert('Beneficiary deleted successfully!');
      loadBeneficiaries();
    } catch (error) {
      alert('Failed to delete beneficiary');
    }
  };

  return (
    <div className="transactions-container">
      <h1>Transactions</h1>

      <div className="tabs">
        <button
          className={activeTab === 'deposit' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={activeTab === 'withdraw' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          className={activeTab === 'transfer' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer
        </button>
        <button
          className={activeTab === 'beneficiary' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('beneficiary')}
        >
          Beneficiaries
        </button>
        <button
          className={activeTab === 'history' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="transaction-form">
            <h2>Request Deposit</h2>
            <div
              className="info-message"
              style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '15px',
                color: '#856404',
              }}
            >
              ℹ️ Deposit requests require admin approval. Your request will be
              reviewed and processed by an administrator.
            </div>
            <div className="form-group">
              <label>Select Account</label>
              <select
                value={depositData.accountId}
                onChange={(e) =>
                  setDepositData({ ...depositData, accountId: e.target.value })
                }
                required
              >
                <option value="">Choose an account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} - {acc.account_type} ($
                    {parseFloat(String(acc.balance)).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={depositData.amount}
                onChange={(e) =>
                  setDepositData({ ...depositData, amount: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={depositData.description}
                onChange={(e) =>
                  setDepositData({
                    ...depositData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Submit Deposit Request'}
            </button>
          </form>
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="transaction-form">
            <h2>Withdraw Money</h2>
            <div className="form-group">
              <label>Select Account</label>
              <select
                value={withdrawData.accountId}
                onChange={(e) =>
                  setWithdrawData({
                    ...withdrawData,
                    accountId: e.target.value,
                  })
                }
                required
              >
                <option value="">Choose an account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} - {acc.account_type} ($
                    {parseFloat(String(acc.balance)).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={withdrawData.amount}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, amount: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={withdrawData.description}
                onChange={(e) =>
                  setWithdrawData({
                    ...withdrawData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        )}

        {activeTab === 'transfer' && (
          <form onSubmit={handleTransfer} className="transaction-form">
            <h2>Transfer Money</h2>
            <div className="form-group">
              <label>From Account</label>
              <select
                value={transferData.fromAccountNumber}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    fromAccountNumber: e.target.value,
                  })
                }
                required
              >
                <option value="">Choose source account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.account_number}>
                    {acc.account_number} - {acc.account_type} ($
                    {parseFloat(String(acc.balance)).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To Account Number</label>
              <input
                type="text"
                value={transferData.toAccountNumber}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    toAccountNumber: e.target.value,
                  })
                }
                required
                placeholder="Enter recipient account number (e.g., 613260814400)"
              />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={transferData.amount}
                onChange={(e) =>
                  setTransferData({ ...transferData, amount: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={transferData.description}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </form>
        )}

        {activeTab === 'beneficiary' && (
          <div className="beneficiary-section">
            <form onSubmit={handleAddBeneficiary} className="transaction-form">
              <h2>Add Beneficiary</h2>
              <div className="form-group">
                <label>Beneficiary Name</label>
                <input
                  type="text"
                  value={beneficiaryData.beneficiary_name}
                  onChange={(e) =>
                    setBeneficiaryData({
                      ...beneficiaryData,
                      beneficiary_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={beneficiaryData.account_number}
                  onChange={(e) =>
                    setBeneficiaryData({
                      ...beneficiaryData,
                      account_number: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={beneficiaryData.bank_name}
                  onChange={(e) =>
                    setBeneficiaryData({
                      ...beneficiaryData,
                      bank_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={beneficiaryData.ifsc_code}
                  onChange={(e) =>
                    setBeneficiaryData({
                      ...beneficiaryData,
                      ifsc_code: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <input
                  type="text"
                  value={beneficiaryData.notes}
                  onChange={(e) =>
                    setBeneficiaryData({
                      ...beneficiaryData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Beneficiary'}
              </button>
            </form>

            <div className="beneficiary-list">
              <h2>Saved Beneficiaries</h2>
              {beneficiaries.length === 0 ? (
                <p className="empty-state">No beneficiaries added yet.</p>
              ) : (
                <div className="beneficiary-grid">
                  {beneficiaries.map((ben) => (
                    <div key={ben.id} className="beneficiary-card">
                      <h3>{ben.beneficiary_name}</h3>
                      <p>
                        <strong>Account:</strong> {ben.account_number}
                      </p>
                      <p>
                        <strong>Bank:</strong> {ben.bank_name}
                      </p>
                      <p>
                        <strong>IFSC:</strong> {ben.ifsc_code}
                      </p>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteBeneficiary(ben.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="transaction-history">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="empty-state">No transactions found.</p>
            ) : (
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>{new Date(txn.created_at).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge badge-${txn.type.toLowerCase()}`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="amount">
                        ${parseFloat(txn.amount.toString()).toFixed(2)}
                      </td>
                      <td>{txn.description || '-'}</td>
                      <td>
                        <span className={`status-${txn.status.toLowerCase()}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
