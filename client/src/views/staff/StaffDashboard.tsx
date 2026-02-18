import React, { useEffect, useState, useCallback } from 'react';
import { useStaffStore } from '../../controllers/staff.controller';
import { useAuthStore } from '../../controllers/auth.controller';
import './StaffDashboard.css';

type ActiveTab = 'overview' | 'customers' | 'transactions';
type TransactionModal = 'deposit' | 'withdraw' | 'transfer' | null;

export const StaffDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    customers,
    selectedCustomer,
    customerAccounts,
    customerTransactions,
    isLoading,
    actionLoading,
    error,
    successMessage,
    fetchAllCustomers,
    searchCustomers,
    selectCustomer,
    clearSelectedCustomer,
    freezeAccount,
    unfreezeAccount,
    performDeposit,
    performWithdrawal,
    performTransfer,
    clearMessages,
  } = useStaffStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [txModal, setTxModal] = useState<TransactionModal>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [toAccountId, setToAccountId] = useState<number | ''>('');
  const [freezeReason, setFreezeReason] = useState('');
  const [showFreezeModal, setShowFreezeModal] = useState<number | null>(null);

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(clearMessages, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);
      const debounce = setTimeout(() => searchCustomers(q), 400);
      return () => clearTimeout(debounce);
    },
    [searchCustomers],
  );

  const handleCustomerClick = (id: number) => {
    selectCustomer(id);
    setActiveTab('customers');
  };

  const openTxModal = (type: TransactionModal, accountId: number) => {
    setTxModal(type);
    setSelectedAccountId(accountId);
    setTxAmount('');
    setTxDesc('');
    setToAccountId('');
  };

  const handleTxSubmit = async () => {
    if (!txAmount) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (txModal === 'deposit' && selectedCustomer)
      await performDeposit(selectedCustomer.id, amount, txDesc);
    else if (txModal === 'withdraw' && selectedCustomer)
      await performWithdrawal(selectedCustomer.id, amount, txDesc);
    else if (txModal === 'transfer' && selectedAccountId && toAccountId)
      await performTransfer(
        selectedAccountId,
        Number(toAccountId),
        amount,
        txDesc,
      );

    setTxModal(null);
  };

  const handleFreeze = async (accountId: number) => {
    if (!freezeReason.trim()) return;
    await freezeAccount(accountId, freezeReason);
    setShowFreezeModal(null);
    setFreezeReason('');
  };

  const totalBalance = customerAccounts.reduce(
    (sum, a) => sum + parseFloat(String(a.balance || 0)),
    0,
  );

  const stats = {
    customers: customers.length,
    activeAccounts: customers.reduce(
      (s: number, c: any) => s + (c.accountCount || 0),
      0,
    ),
  };

  return (
    <div className="staff-dashboard">
      {/* ── Header ── */}
      <div className="staff-header">
        <div className="staff-header-left">
          <div className="staff-badge">STAFF</div>
          <div>
            <h1 className="staff-title">Bank Staff Dashboard</h1>
            <p className="staff-subtitle">
              Welcome, {user?.name} · Manage customers & transactions
            </p>
          </div>
        </div>
        <div className="staff-header-right">
          <div className="staff-stat-pill">
            <span>{customers.length}</span>
            <label>Customers</label>
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && <div className="staff-alert staff-alert-error">⚠ {error}</div>}
      {successMessage && (
        <div className="staff-alert staff-alert-success">
          ✓ {successMessage}
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="staff-tabs">
        {(['overview', 'customers', 'transactions'] as ActiveTab[]).map((t) => (
          <button
            key={t}
            className={`staff-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'overview' && '📊 '}
            {t === 'customers' && '👥 '}
            {t === 'transactions' && '💸 '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <div className="staff-section">
          {/* Stats */}
          <div className="staff-grid-4">
            <div className="staff-stat-card">
              <div className="staff-stat-icon">👥</div>
              <div>
                <div className="staff-stat-label">Total Customers</div>
                <div className="staff-stat-value">{stats.customers}</div>
              </div>
            </div>
            <div className="staff-stat-card">
              <div className="staff-stat-icon">🏦</div>
              <div>
                <div className="staff-stat-label">Total Accounts</div>
                <div className="staff-stat-value">
                  {stats.activeAccounts || '—'}
                </div>
              </div>
            </div>
            <div className="staff-stat-card">
              <div className="staff-stat-icon">💳</div>
              <div>
                <div className="staff-stat-label">Active Today</div>
                <div className="staff-stat-value">—</div>
              </div>
            </div>
            <div className="staff-stat-card">
              <div className="staff-stat-icon">🔔</div>
              <div>
                <div className="staff-stat-label">Pending Requests</div>
                <div className="staff-stat-value">—</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="staff-card">
            <div className="staff-card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="staff-quick-actions">
              <button
                className="staff-action-btn"
                onClick={() => setActiveTab('customers')}
              >
                <span className="action-icon">👤</span>
                <span>Search Customer</span>
              </button>
              <button
                className="staff-action-btn"
                onClick={() => setActiveTab('transactions')}
              >
                <span className="action-icon">💰</span>
                <span>Process Deposit</span>
              </button>
              <button
                className="staff-action-btn"
                onClick={() => setActiveTab('transactions')}
              >
                <span className="action-icon">💸</span>
                <span>Process Withdrawal</span>
              </button>
              <button
                className="staff-action-btn"
                onClick={() => setActiveTab('customers')}
              >
                <span className="action-icon">📋</span>
                <span>View Accounts</span>
              </button>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="staff-card">
            <div className="staff-card-header">
              <h2>Recent Customers</h2>
            </div>
            {isLoading ? (
              <div className="staff-loading">
                <div className="staff-spinner" />
              </div>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 8).map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <div className="staff-customer-name">
                          <div className="staff-avatar">
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>
                        <span className="staff-badge-sm">{c.role}</span>
                      </td>
                      <td>
                        <button
                          className="staff-btn-link"
                          onClick={() => handleCustomerClick(c.id)}
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ CUSTOMERS TAB ══════════════ */}
      {activeTab === 'customers' && (
        <div className="staff-section staff-customers-layout">
          {/* Left: Search + List */}
          <div className="staff-customer-list-panel">
            <div className="staff-card">
              <div className="staff-card-header">
                <h2>Customer Search</h2>
              </div>
              <div className="staff-search-box">
                <span className="staff-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="staff-search-input"
                />
              </div>
              {isLoading ? (
                <div className="staff-loading">
                  <div className="staff-spinner" />
                </div>
              ) : (
                <div className="staff-customer-list">
                  {customers.map((c: any) => (
                    <div
                      key={c.id}
                      className={`staff-customer-list-item ${
                        selectedCustomer?.id === c.id ? 'active' : ''
                      }`}
                      onClick={() => handleCustomerClick(c.id)}
                    >
                      <div className="staff-avatar">
                        {c.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="staff-customer-info">
                        <div className="staff-customer-list-name">{c.name}</div>
                        <div className="staff-customer-list-email">
                          {c.email}
                        </div>
                      </div>
                      <span className="staff-chevron">›</span>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <div className="staff-empty">No customers found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Customer Detail */}
          <div className="staff-customer-detail-panel">
            {!selectedCustomer ? (
              <div className="staff-card staff-empty-detail">
                <div className="staff-empty-icon">👤</div>
                <p>Select a customer to view details</p>
              </div>
            ) : (
              <>
                {/* Customer Info Card */}
                <div className="staff-card">
                  <div className="staff-card-header">
                    <div className="staff-customer-profile">
                      <div className="staff-avatar-lg">
                        {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h2>{selectedCustomer.name}</h2>
                        <p>{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <button
                      className="staff-btn-ghost"
                      onClick={clearSelectedCustomer}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="staff-customer-meta">
                    <div className="staff-meta-item">
                      <label>Total Balance</label>
                      <span className="staff-meta-highlight">
                        ${totalBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="staff-meta-item">
                      <label>Accounts</label>
                      <span>{customerAccounts.length}</span>
                    </div>
                    <div className="staff-meta-item">
                      <label>Joined</label>
                      <span>
                        {new Date(
                          selectedCustomer.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="staff-meta-item">
                      <label>Status</label>
                      <span className="staff-status-active">Active</span>
                    </div>
                  </div>
                </div>

                {/* Accounts */}
                <div className="staff-card">
                  <div className="staff-card-header">
                    <h2>Accounts ({customerAccounts.length})</h2>
                  </div>
                  <div className="staff-accounts-list">
                    {customerAccounts.map((acc: any) => (
                      <div key={acc.id} className="staff-account-row">
                        <div className="staff-account-info">
                          <div className="staff-account-number">
                            {acc.account_number}
                          </div>
                          <div className="staff-account-type">
                            {acc.account_type}
                          </div>
                          {acc.isFrozen && (
                            <span className="staff-badge-frozen">FROZEN</span>
                          )}
                        </div>
                        <div className="staff-account-balance">
                          ${parseFloat(String(acc.balance || 0)).toFixed(2)}
                        </div>
                        <div className="staff-account-actions">
                          <button
                            className="staff-btn-sm"
                            onClick={() => openTxModal('deposit', acc.id)}
                            disabled={acc.isFrozen || actionLoading}
                          >
                            Deposit
                          </button>
                          <button
                            className="staff-btn-sm staff-btn-outline"
                            onClick={() => openTxModal('withdraw', acc.id)}
                            disabled={acc.isFrozen || actionLoading}
                          >
                            Withdraw
                          </button>
                          <button
                            className="staff-btn-sm staff-btn-outline"
                            onClick={() => openTxModal('transfer', acc.id)}
                            disabled={acc.isFrozen || actionLoading}
                          >
                            Transfer
                          </button>
                          {acc.isFrozen ? (
                            <button
                              className="staff-btn-sm staff-btn-success"
                              onClick={() => unfreezeAccount(acc.id)}
                              disabled={actionLoading}
                            >
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              className="staff-btn-sm staff-btn-danger"
                              onClick={() => setShowFreezeModal(acc.id)}
                              disabled={actionLoading}
                            >
                              Freeze
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {customerAccounts.length === 0 && (
                      <div className="staff-empty">No accounts found</div>
                    )}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="staff-card">
                  <div className="staff-card-header">
                    <h2>Recent Transactions</h2>
                  </div>
                  <table className="staff-table">
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
                      {customerTransactions.slice(0, 10).map((tx: any) => (
                        <tr key={tx.id}>
                          <td>
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <span
                              className={`staff-tx-type staff-tx-${tx.type?.toLowerCase()}`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="staff-amount">
                            ${parseFloat(String(tx.amount || 0)).toFixed(2)}
                          </td>
                          <td>
                            <span
                              className={`staff-status-badge status-${tx.status?.toLowerCase()}`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="staff-tx-desc">
                            {tx.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {customerTransactions.length === 0 && (
                    <div className="staff-empty">No transactions</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TRANSACTIONS TAB ══════════════ */}
      {activeTab === 'transactions' && (
        <div className="staff-section">
          <div className="staff-card">
            <div className="staff-card-header">
              <h2>Transaction Processing</h2>
            </div>
            <div className="staff-tx-guide">
              <div className="staff-tx-guide-item">
                <div className="staff-tx-guide-icon">👥</div>
                <h3>Step 1: Find Customer</h3>
                <p>
                  Go to the Customers tab and search for the customer you want
                  to assist.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('customers')}
                >
                  Go to Customers
                </button>
              </div>
              <div className="staff-tx-guide-arrow">→</div>
              <div className="staff-tx-guide-item">
                <div className="staff-tx-guide-icon">🏦</div>
                <h3>Step 2: Select Account</h3>
                <p>Choose the relevant account from their account list.</p>
              </div>
              <div className="staff-tx-guide-arrow">→</div>
              <div className="staff-tx-guide-item">
                <div className="staff-tx-guide-icon">✅</div>
                <h3>Step 3: Process Transaction</h3>
                <p>
                  Click Deposit, Withdraw, or Transfer to process the
                  transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Responsibility Summary */}
          <div className="staff-grid-2">
            <div className="staff-card">
              <div className="staff-card-header">
                <h2>📋 Staff Responsibilities</h2>
              </div>
              <ul className="staff-responsibility-list">
                <li>
                  <span className="resp-icon">🏦</span>
                  <div>
                    <strong>Account Management</strong>
                    <p>Create, update, freeze, and close customer accounts</p>
                  </div>
                </li>
                <li>
                  <span className="resp-icon">💸</span>
                  <div>
                    <strong>Transaction Handling</strong>
                    <p>Process deposits, withdrawals, and fund transfers</p>
                  </div>
                </li>
                <li>
                  <span className="resp-icon">👤</span>
                  <div>
                    <strong>Customer Support</strong>
                    <p>Help customers with account issues and statements</p>
                  </div>
                </li>
                <li>
                  <span className="resp-icon">📝</span>
                  <div>
                    <strong>Data Entry & Verification</strong>
                    <p>Enter and verify customer information and KYC</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="staff-card">
              <div className="staff-card-header">
                <h2>🔑 Access Controls</h2>
              </div>
              <div className="staff-access-grid">
                {[
                  { label: 'View Customer Accounts', allowed: true },
                  { label: 'Process Deposits', allowed: true },
                  { label: 'Process Withdrawals', allowed: true },
                  { label: 'Fund Transfers', allowed: true },
                  { label: 'Freeze Accounts', allowed: true },
                  { label: 'Approve Loans', allowed: false },
                  { label: 'Delete Users', allowed: false },
                  { label: 'System Settings', allowed: false },
                ].map((item) => (
                  <div key={item.label} className="staff-access-item">
                    <span
                      className={item.allowed ? 'staff-check' : 'staff-cross'}
                    >
                      {item.allowed ? '✓' : '✗'}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TRANSACTION MODAL ══════════════ */}
      {txModal && (
        <div className="staff-modal-overlay" onClick={() => setTxModal(null)}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>
                {txModal === 'deposit' && '💰 Process Deposit'}
                {txModal === 'withdraw' && '💸 Process Withdrawal'}
                {txModal === 'transfer' && '🔄 Process Transfer'}
              </h2>
              <button
                className="staff-modal-close"
                onClick={() => setTxModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="staff-modal-body">
              {txModal === 'transfer' && (
                <div className="staff-form-group">
                  <label>Destination Account</label>
                  <select
                    className="staff-input"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(Number(e.target.value))}
                  >
                    <option value="">Select account…</option>
                    {customerAccounts
                      .filter((a: any) => a.id !== selectedAccountId)
                      .map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.account_number} ({a.account_type})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="staff-form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  className="staff-input"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </div>
              <div className="staff-form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  className="staff-input"
                  placeholder="Add a note…"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setTxModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTxSubmit}
                disabled={
                  actionLoading ||
                  !txAmount ||
                  (txModal === 'transfer' && !toAccountId)
                }
              >
                {actionLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ FREEZE MODAL ══════════════ */}
      {showFreezeModal !== null && (
        <div
          className="staff-modal-overlay"
          onClick={() => setShowFreezeModal(null)}
        >
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>🔒 Freeze Account</h2>
              <button
                className="staff-modal-close"
                onClick={() => setShowFreezeModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="staff-modal-body">
              <p className="staff-modal-warning">
                Freezing this account will prevent all transactions. Please
                provide a reason.
              </p>
              <div className="staff-form-group">
                <label>Reason for Freezing</label>
                <textarea
                  className="staff-input staff-textarea"
                  placeholder="Enter reason…"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowFreezeModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleFreeze(showFreezeModal)}
                disabled={actionLoading || !freezeReason.trim()}
              >
                {actionLoading ? 'Processing…' : 'Freeze Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
