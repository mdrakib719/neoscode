import { useEffect, useState } from 'react';
import { useAdminStore } from '../../controllers/admin.controller';
import { useAuthStore } from '../../controllers/auth.controller';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    users,
    accounts,
    transactions,
    auditLogs,
    systemConfig,
    loading,
    error,
    getAllUsers,
    getAllAccounts,
    getAllTransactions,
    getSystemConfig,
    getAuditLogs,
    createEmployee,
    activateUser,
    lockUser,
    freezeAccount,
    closeAccount,
    reverseTransaction,
    setTransactionLimits,
    setFeeConfiguration,
    setInterestRate,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('users');
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configType, setConfigType] = useState('');

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [limitForm, setLimitForm] = useState({
    dailyTransferLimit: 50000,
    dailyWithdrawalLimit: 10000,
    perTransactionLimit: 25000,
  });

  const [feeForm, setFeeForm] = useState({
    transferFee: 0,
    withdrawalFee: 0,
    monthlyMaintenanceFee: 5,
  });

  const [interestForm, setInterestForm] = useState({
    accountType: 'SAVINGS',
    interestRate: 4,
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    getAllUsers();
    getAllAccounts();
    getSystemConfig();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      getAllTransactions();
    } else if (activeTab === 'audit') {
      getAuditLogs();
    }
  }, [activeTab]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee(employeeForm);
      setShowCreateEmployee(false);
      setEmployeeForm({ name: '', email: '', password: '' });
      getAllUsers();
      alert('Employee created successfully!');
    } catch (error) {
      alert('Failed to create employee');
    }
  };

  const handleActivateUser = async (userId: number, isActive: boolean) => {
    try {
      await activateUser(userId, isActive);
      getAllUsers();
      alert(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleLockUser = async (userId: number, isLocked: boolean) => {
    const reason = prompt('Enter reason for locking:');
    if (!reason && isLocked) return;

    try {
      await lockUser(userId, isLocked, reason || undefined);
      getAllUsers();
      alert(`User ${isLocked ? 'locked' : 'unlocked'} successfully!`);
    } catch (error) {
      alert('Failed to lock user');
    }
  };

  const handleFreezeAccount = async (accountId: number, isFrozen: boolean) => {
    const reason = prompt('Enter reason:');
    if (!reason && isFrozen) return;

    try {
      await freezeAccount(accountId, isFrozen, reason || undefined);
      getAllAccounts();
      alert(`Account ${isFrozen ? 'frozen' : 'unfrozen'} successfully!`);
    } catch (error) {
      alert('Failed to freeze account');
    }
  };

  const handleCloseAccount = async (accountId: number) => {
    const reason = prompt('Enter reason for closing account:');
    if (!reason) return;

    if (!confirm('Are you sure you want to close this account?')) return;

    try {
      await closeAccount(accountId, reason);
      getAllAccounts();
      alert('Account closed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to close account');
    }
  };

  const handleReverseTransaction = async (transactionId: number) => {
    const reason = prompt('Enter reason for reversal:');
    if (!reason) return;

    if (!confirm('Are you sure you want to reverse this transaction?')) return;

    try {
      await reverseTransaction(transactionId, reason);
      getAllTransactions();
      alert('Transaction reversed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reverse transaction');
    }
  };

  const handleSaveTransactionLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setTransactionLimits(limitForm);
      alert('Transaction limits updated successfully!');
      setShowConfigModal(false);
    } catch (error) {
      alert('Failed to update limits');
    }
  };

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setFeeConfiguration(feeForm);
      alert('Fee configuration updated successfully!');
      setShowConfigModal(false);
    } catch (error) {
      alert('Failed to update fees');
    }
  };

  const handleSaveInterestRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setInterestRate(interestForm);
      getSystemConfig();
      alert('Interest rate updated successfully!');
      setShowConfigModal(false);
    } catch (error) {
      alert('Failed to update interest rate');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="admin-panel">
        <p>Access Denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>🔐 Admin Control Panel</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={activeTab === 'accounts' ? 'active' : ''}
          onClick={() => setActiveTab('accounts')}
        >
          🏦 Accounts Oversight
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          💸 Transactions
        </button>
        <button
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ System Config
        </button>
        <button
          className={activeTab === 'audit' ? 'active' : ''}
          onClick={() => setActiveTab('audit')}
        >
          🔒 Audit Logs
        </button>
      </div>

      <div className="admin-content">
        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <button
                onClick={() => setShowCreateEmployee(true)}
                className="btn-primary"
              >
                + Create Employee
              </button>
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge badge-${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.isLocked && (
                          <span className="badge badge-warning">Locked</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleActivateUser(user.id, !user.isActive)
                          }
                          className="btn-small"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() =>
                            handleLockUser(user.id, !user.isLocked)
                          }
                          className="btn-small btn-warning"
                        >
                          {user.isLocked ? 'Unlock' : 'Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ACCOUNTS OVERSIGHT TAB */}
        {activeTab === 'accounts' && (
          <div className="accounts-section">
            <h2>Accounts Oversight</h2>

            {loading ? (
              <p>Loading accounts...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Account Number</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account: any) => (
                    <tr key={account.id}>
                      <td>{account.id}</td>
                      <td>{account.account_number}</td>
                      <td>{account.user?.name}</td>
                      <td>{account.account_type}</td>
                      <td>${account.balance.toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${account.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}
                        >
                          {account.status}
                        </span>
                        {account.isFrozen && (
                          <span className="badge badge-warning">Frozen</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleFreezeAccount(account.id, !account.isFrozen)
                          }
                          className="btn-small"
                        >
                          {account.isFrozen ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button
                          onClick={() => handleCloseAccount(account.id)}
                          className="btn-small btn-danger"
                          disabled={account.status === 'CLOSED'}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <h2>Transaction Monitoring</h2>

            {loading ? (
              <p>Loading transactions...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn: any) => (
                    <tr key={txn.id}>
                      <td>{txn.id}</td>
                      <td>{txn.type}</td>
                      <td>${txn.amount.toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge badge-${txn.status.toLowerCase()}`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td>{new Date(txn.created_at).toLocaleString()}</td>
                      <td>
                        {txn.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleReverseTransaction(txn.id)}
                            className="btn-small btn-warning"
                          >
                            Reverse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SYSTEM CONFIG TAB */}
        {activeTab === 'config' && (
          <div className="config-section">
            <h2>System Configuration</h2>

            <div className="config-grid">
              <div className="config-card">
                <h3>💰 Transaction Limits</h3>
                <button
                  onClick={() => {
                    setConfigType('limits');
                    setShowConfigModal(true);
                  }}
                  className="btn-primary"
                >
                  Configure
                </button>
              </div>

              <div className="config-card">
                <h3>💵 Fee Configuration</h3>
                <button
                  onClick={() => {
                    setConfigType('fees');
                    setShowConfigModal(true);
                  }}
                  className="btn-primary"
                >
                  Configure
                </button>
              </div>

              <div className="config-card">
                <h3>📈 Interest Rates</h3>
                <button
                  onClick={() => {
                    setConfigType('interest');
                    setShowConfigModal(true);
                  }}
                  className="btn-primary"
                >
                  Configure
                </button>
              </div>

              <div className="config-card">
                <h3>⚠️ Penalty Rules</h3>
                <button
                  onClick={() => {
                    setConfigType('penalties');
                    setShowConfigModal(true);
                  }}
                  className="btn-primary"
                >
                  Configure
                </button>
              </div>
            </div>

            {systemConfig && (
              <div className="config-details">
                <h3>Current Configuration</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(systemConfig).map(
                      ([key, config]: [string, any]) => (
                        <tr key={key}>
                          <td>
                            <code>{key}</code>
                          </td>
                          <td>{config.value}</td>
                          <td>
                            {new Date(config.updated_at).toLocaleString()}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="audit-section">
            <h2>Audit Logs</h2>

            {loading ? (
              <p>Loading audit logs...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.user?.name || 'Unknown'}</td>
                      <td>
                        <span className="badge badge-info">{log.action}</span>
                      </td>
                      <td>{log.resource}</td>
                      <td title={log.details}>
                        {log.details?.substring(0, 30)}...
                      </td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {showCreateEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateEmployee(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Employee</h2>
            <form onSubmit={handleCreateEmployee}>
              <input
                type="text"
                placeholder="Full Name"
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, email: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={employeeForm.password}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, password: e.target.value })
                }
                required
                minLength={6}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateEmployee(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIG MODALS */}
      {showConfigModal && configType === 'limits' && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfigModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Transaction Limits</h2>
            <form onSubmit={handleSaveTransactionLimits}>
              <label>Daily Transfer Limit (USD)</label>
              <input
                type="number"
                value={limitForm.dailyTransferLimit}
                onChange={(e) =>
                  setLimitForm({
                    ...limitForm,
                    dailyTransferLimit: +e.target.value,
                  })
                }
                required
              />
              <label>Daily Withdrawal Limit (USD)</label>
              <input
                type="number"
                value={limitForm.dailyWithdrawalLimit}
                onChange={(e) =>
                  setLimitForm({
                    ...limitForm,
                    dailyWithdrawalLimit: +e.target.value,
                  })
                }
                required
              />
              <label>Per Transaction Limit (USD)</label>
              <input
                type="number"
                value={limitForm.perTransactionLimit}
                onChange={(e) =>
                  setLimitForm({
                    ...limitForm,
                    perTransactionLimit: +e.target.value,
                  })
                }
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfigModal && configType === 'fees' && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfigModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Fee Configuration</h2>
            <form onSubmit={handleSaveFees}>
              <label>Transfer Fee (USD)</label>
              <input
                type="number"
                step="0.01"
                value={feeForm.transferFee}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, transferFee: +e.target.value })
                }
                required
              />
              <label>Withdrawal Fee (USD)</label>
              <input
                type="number"
                step="0.01"
                value={feeForm.withdrawalFee}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, withdrawalFee: +e.target.value })
                }
                required
              />
              <label>Monthly Maintenance Fee (USD)</label>
              <input
                type="number"
                step="0.01"
                value={feeForm.monthlyMaintenanceFee}
                onChange={(e) =>
                  setFeeForm({
                    ...feeForm,
                    monthlyMaintenanceFee: +e.target.value,
                  })
                }
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfigModal && configType === 'interest' && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfigModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Interest Rates</h2>
            <form onSubmit={handleSaveInterestRate}>
              <label>Account Type</label>
              <select
                value={interestForm.accountType}
                onChange={(e) =>
                  setInterestForm({
                    ...interestForm,
                    accountType: e.target.value,
                  })
                }
              >
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
              </select>
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestForm.interestRate}
                onChange={(e) =>
                  setInterestForm({
                    ...interestForm,
                    interestRate: +e.target.value,
                  })
                }
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
