import React, { useEffect, useRef, useState } from 'react';
import { transactionController } from '../../controllers/transaction.controller';
import { accountController } from '../../controllers/account.controller';
import { transactionService } from '../../services/transaction.service';
import { Transaction, Account } from '../../models/types';
import './Transactions.css';

type MainTab = 'deposit' | 'withdraw' | 'transfer' | 'beneficiary' | 'history';
type TransferMode = 'internal' | 'external';

interface BeneficiaryItem {
  id: number;
  beneficiary_name: string;
  account_number: string;
  bank_name?: string;
  ifsc_code?: string;
  notes?: string;
}

const fmt = (v: number | string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(v),
  );

// ─── Inline notification ──────────────────────────────────────────────────────
const Notify: React.FC<{
  type: 'success' | 'error' | 'info' | null;
  message: string | null;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  if (!type || !message) return null;
  return (
    <div className={`txn-notify txn-notify-${type}`}>
      <span>{message}</span>
      <button className="txn-notify-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('transfer');
  const [transferMode, setTransferMode] = useState<TransferMode>('internal');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string | null;
  }>({ type: null, message: null });

  // ── Deposit state ────────────────────────────────────────────────────────
  const [depositData, setDepositData] = useState({
    accountId: '',
    amount: '',
    description: '',
  });

  // ── Withdraw state ───────────────────────────────────────────────────────
  const [withdrawData, setWithdrawData] = useState({
    accountId: '',
    amount: '',
    description: '',
  });

  // ── Internal transfer state ──────────────────────────────────────────────
  const [intTransfer, setIntTransfer] = useState({
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: '',
    description: '',
  });
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    holder?: string;
    account_type?: string;
  } | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── External transfer state ──────────────────────────────────────────────
  const [extTransfer, setExtTransfer] = useState({
    fromAccountNumber: '',
    externalBeneficiaryName: '',
    externalBankName: '',
    externalAccountNumber: '',
    externalIfscCode: '',
    amount: '',
    description: '',
  });

  // ── Beneficiary form ─────────────────────────────────────────────────────
  const [benData, setBenData] = useState({
    beneficiary_name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    notes: '',
  });

  // ─── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadBeneficiaries();
  }, []);

  const loadAccounts = async () => {
    await accountController.loadAccounts();
    setAccounts(accountController.getAccounts());
  };

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getHistory();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const data = await transactionService.getBeneficiaries();
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    }
  };

  const showNotify = (type: 'success' | 'error' | 'info', message: string) =>
    setNotify({ type, message });
  const clearNotify = () => setNotify({ type: null, message: null });

  // ─── Live account lookup ───────────────────────────────────────────────────
  const onToAccountChange = (value: string) => {
    setIntTransfer((p) => ({ ...p, toAccountNumber: value }));
    setLookupResult(null);
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (value.length >= 8) {
      lookupTimer.current = setTimeout(async () => {
        try {
          const res = await transactionService.validateAccount(value);
          setLookupResult({
            found: true,
            holder: res.holder,
            account_type: res.account_type,
          });
        } catch {
          setLookupResult({ found: false });
        }
      }, 500);
    }
  };

  // ─── Fill transfer from beneficiary ───────────────────────────────────────
  const fillInternalFromBen = (ben: BeneficiaryItem) => {
    setIntTransfer((p) => ({ ...p, toAccountNumber: ben.account_number }));
    setLookupResult(null);
  };
  const fillExternalFromBen = (ben: BeneficiaryItem) => {
    setExtTransfer((p) => ({
      ...p,
      externalBeneficiaryName: ben.beneficiary_name,
      externalBankName: ben.bank_name || '',
      externalAccountNumber: ben.account_number,
      externalIfscCode: ben.ifsc_code || '',
    }));
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotify();
    try {
      await transactionController.deposit({
        accountId: parseInt(depositData.accountId),
        amount: parseFloat(depositData.amount),
        description: depositData.description,
      });
      showNotify(
        'success',
        'Deposit request submitted! Awaiting admin approval.',
      );
      setDepositData({ accountId: '', amount: '', description: '' });
      loadTransactions();
    } catch (err: any) {
      showNotify(
        'error',
        err.response?.data?.message || 'Deposit request failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotify();
    try {
      await transactionController.withdraw({
        accountId: parseInt(withdrawData.accountId),
        amount: parseFloat(withdrawData.amount),
        description: withdrawData.description,
      });
      showNotify('success', 'Withdrawal successful!');
      setWithdrawData({ accountId: '', amount: '', description: '' });
      loadAccounts();
      loadTransactions();
    } catch (err: any) {
      showNotify('error', err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotify();
    try {
      await transactionService.transfer({
        fromAccountNumber: intTransfer.fromAccountNumber,
        toAccountNumber: intTransfer.toAccountNumber,
        amount: parseFloat(intTransfer.amount),
        description: intTransfer.description || 'Internal Transfer',
        isExternal: false,
      });
      showNotify(
        'success',
        `Transferred ${fmt(intTransfer.amount)} successfully!`,
      );
      setIntTransfer({
        fromAccountNumber: '',
        toAccountNumber: '',
        amount: '',
        description: '',
      });
      setLookupResult(null);
      loadAccounts();
      loadTransactions();
    } catch (err: any) {
      showNotify('error', err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotify();
    try {
      await transactionService.transfer({
        fromAccountNumber: extTransfer.fromAccountNumber,
        amount: parseFloat(extTransfer.amount),
        description:
          extTransfer.description ||
          `External transfer to ${extTransfer.externalBankName}`,
        isExternal: true,
        externalBeneficiaryName: extTransfer.externalBeneficiaryName,
        externalBankName: extTransfer.externalBankName,
        externalAccountNumber: extTransfer.externalAccountNumber,
        externalIfscCode: extTransfer.externalIfscCode,
      });
      showNotify(
        'success',
        `External transfer of ${fmt(extTransfer.amount)} initiated!`,
      );
      setExtTransfer({
        fromAccountNumber: '',
        externalBeneficiaryName: '',
        externalBankName: '',
        externalAccountNumber: '',
        externalIfscCode: '',
        amount: '',
        description: '',
      });
      loadAccounts();
      loadTransactions();
    } catch (err: any) {
      showNotify(
        'error',
        err.response?.data?.message || 'External transfer failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotify();
    try {
      await transactionService.addBeneficiary(benData);
      showNotify('success', 'Beneficiary added successfully!');
      setBenData({
        beneficiary_name: '',
        account_number: '',
        bank_name: '',
        ifsc_code: '',
        notes: '',
      });
      loadBeneficiaries();
    } catch (err: any) {
      showNotify(
        'error',
        err.response?.data?.message || 'Failed to add beneficiary',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBeneficiary = async (id: number) => {
    if (!confirm('Delete this beneficiary?')) return;
    try {
      await transactionService.deleteBeneficiary(id);
      showNotify('success', 'Beneficiary removed');
      loadBeneficiaries();
    } catch {
      showNotify('error', 'Failed to delete beneficiary');
    }
  };

  const sendToBeneficiary = (ben: BeneficiaryItem) => {
    const isInternal = !ben.bank_name || ben.bank_name.trim() === '';
    setActiveTab('transfer');
    if (isInternal) {
      setTransferMode('internal');
      fillInternalFromBen(ben);
    } else {
      setTransferMode('external');
      fillExternalFromBen(ben);
    }
  };

  const selectedFromBalance = (accNum: string) => {
    const acc = accounts.find((a) => a.account_number === accNum);
    return acc ? Number(acc.balance) : null;
  };

  return (
    <div className="transactions-container">
      <h1 className="txn-page-title">💳 Transactions</h1>

      <Notify
        type={notify.type}
        message={notify.message}
        onClose={clearNotify}
      />

      {/* Main tabs */}
      <div className="tabs">
        {(
          [
            'deposit',
            'withdraw',
            'transfer',
            'beneficiary',
            'history',
          ] as MainTab[]
        ).map((t) => (
          <button
            key={t}
            className={activeTab === t ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab(t);
              clearNotify();
            }}
          >
            {t === 'deposit' && '⬇ Deposit'}
            {t === 'withdraw' && '⬆ Withdraw'}
            {t === 'transfer' && '🔄 Transfer'}
            {t === 'beneficiary' && '👥 Beneficiaries'}
            {t === 'history' && '📋 History'}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {/* ── Deposit ─────────────────────────────────────────────────────── */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="transaction-form">
            <h2>Request Deposit</h2>
            <div className="info-banner">
              ℹ️ Deposits require admin approval and will be credited once
              reviewed.
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
                    {acc.account_number} — {acc.account_type} (
                    {fmt(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={depositData.amount}
                onChange={(e) =>
                  setDepositData({ ...depositData, amount: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
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
              {loading ? 'Submitting…' : 'Submit Deposit Request'}
            </button>
          </form>
        )}

        {/* ── Withdraw ────────────────────────────────────────────────────── */}
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
                    {acc.account_number} — {acc.account_type} (
                    {fmt(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={withdrawData.amount}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, amount: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
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
              {loading ? 'Processing…' : 'Withdraw'}
            </button>
          </form>
        )}

        {/* ── Transfer ────────────────────────────────────────────────────── */}
        {activeTab === 'transfer' && (
          <div className="transfer-section">
            <h2>Fund Transfer</h2>

            {/* Internal / External toggle */}
            <div className="transfer-mode-toggle">
              <button
                className={`mode-btn ${transferMode === 'internal' ? 'mode-btn-active' : ''}`}
                onClick={() => setTransferMode('internal')}
              >
                🏦 Internal Transfer
                <span className="mode-hint">Within this bank</span>
              </button>
              <button
                className={`mode-btn ${transferMode === 'external' ? 'mode-btn-active' : ''}`}
                onClick={() => setTransferMode('external')}
              >
                🌐 External Transfer
                <span className="mode-hint">Another bank / NEFT / RTGS</span>
              </button>
            </div>

            {/* ── Internal ── */}
            {transferMode === 'internal' && (
              <form
                onSubmit={handleInternalTransfer}
                className="transaction-form transfer-form"
              >
                <div className="form-group">
                  <label>From Account</label>
                  <select
                    value={intTransfer.fromAccountNumber}
                    onChange={(e) =>
                      setIntTransfer({
                        ...intTransfer,
                        fromAccountNumber: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select source account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.account_number}>
                        {acc.account_number} — {acc.account_type} (
                        {fmt(acc.balance)})
                      </option>
                    ))}
                  </select>
                  {intTransfer.fromAccountNumber && (
                    <div className="balance-chip">
                      Available:{' '}
                      <strong>
                        {fmt(
                          selectedFromBalance(intTransfer.fromAccountNumber) ??
                            0,
                        )}
                      </strong>
                    </div>
                  )}
                </div>

                {beneficiaries.length > 0 && (
                  <div className="form-group">
                    <label>Quick-fill from Beneficiary</label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const ben = beneficiaries.find(
                          (b) => String(b.id) === e.target.value,
                        );
                        if (ben) fillInternalFromBen(ben);
                      }}
                    >
                      <option value="">— Select saved beneficiary —</option>
                      {beneficiaries.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.beneficiary_name} ({b.account_number})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Recipient Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={intTransfer.toAccountNumber}
                    onChange={(e) => onToAccountChange(e.target.value)}
                    required
                  />
                  {lookupResult?.found === true && (
                    <div className="lookup-found">
                      ✓ {lookupResult.holder} — {lookupResult.account_type}
                    </div>
                  )}
                  {lookupResult?.found === false && (
                    <div className="lookup-notfound">
                      ✗ Account not found in our system
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={intTransfer.amount}
                      onChange={(e) =>
                        setIntTransfer({
                          ...intTransfer,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rent payment"
                      value={intTransfer.description}
                      onChange={(e) =>
                        setIntTransfer({
                          ...intTransfer,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {intTransfer.amount && intTransfer.fromAccountNumber && (
                  <div className="transfer-summary">
                    <span>Transferring</span>
                    <strong className="summary-amount">
                      {fmt(intTransfer.amount)}
                    </strong>
                    <span>from</span>
                    <code>{intTransfer.fromAccountNumber}</code>
                    {intTransfer.toAccountNumber && (
                      <>
                        <span>→</span>
                        <code>{intTransfer.toAccountNumber}</code>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary btn-transfer"
                  disabled={loading}
                >
                  {loading ? 'Processing…' : '🔄 Transfer Now'}
                </button>
              </form>
            )}

            {/* ── External ── */}
            {transferMode === 'external' && (
              <form
                onSubmit={handleExternalTransfer}
                className="transaction-form transfer-form"
              >
                <div className="info-banner info-banner-blue">
                  🌐 External transfers are processed via NEFT/RTGS simulation.
                  Funds are debited immediately.
                </div>

                <div className="form-group">
                  <label>From Account</label>
                  <select
                    value={extTransfer.fromAccountNumber}
                    onChange={(e) =>
                      setExtTransfer({
                        ...extTransfer,
                        fromAccountNumber: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select source account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.account_number}>
                        {acc.account_number} — {acc.account_type} (
                        {fmt(acc.balance)})
                      </option>
                    ))}
                  </select>
                  {extTransfer.fromAccountNumber && (
                    <div className="balance-chip">
                      Available:{' '}
                      <strong>
                        {fmt(
                          selectedFromBalance(extTransfer.fromAccountNumber) ??
                            0,
                        )}
                      </strong>
                    </div>
                  )}
                </div>

                {beneficiaries.length > 0 && (
                  <div className="form-group">
                    <label>Quick-fill from Saved Beneficiary</label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const ben = beneficiaries.find(
                          (b) => String(b.id) === e.target.value,
                        );
                        if (ben) fillExternalFromBen(ben);
                      }}
                    >
                      <option value="">— Select saved beneficiary —</option>
                      {beneficiaries.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.beneficiary_name} — {b.bank_name || 'Unknown Bank'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Beneficiary Name *</label>
                    <input
                      type="text"
                      placeholder="Full name of recipient"
                      value={extTransfer.externalBeneficiaryName}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          externalBeneficiaryName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Recipient Account Number *</label>
                    <input
                      type="text"
                      placeholder="Account number at external bank"
                      value={extTransfer.externalAccountNumber}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          externalAccountNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bank Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. HSBC, Citibank, Chase"
                      value={extTransfer.externalBankName}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          externalBankName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>IFSC / SWIFT / Routing Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={extTransfer.externalIfscCode}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          externalIfscCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={extTransfer.amount}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reference / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Invoice #1234"
                      value={extTransfer.description}
                      onChange={(e) =>
                        setExtTransfer({
                          ...extTransfer,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {extTransfer.amount && extTransfer.fromAccountNumber && (
                  <div className="transfer-summary">
                    <span>Sending</span>
                    <strong className="summary-amount">
                      {fmt(extTransfer.amount)}
                    </strong>
                    <span>to</span>
                    <strong>
                      {extTransfer.externalBeneficiaryName || 'beneficiary'}
                    </strong>
                    {extTransfer.externalBankName && (
                      <>
                        <span>at</span>
                        <code>{extTransfer.externalBankName}</code>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary btn-transfer btn-external"
                  disabled={loading}
                >
                  {loading ? 'Processing…' : '🌐 Send External Transfer'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Beneficiaries ───────────────────────────────────────────────── */}
        {activeTab === 'beneficiary' && (
          <div className="beneficiary-section">
            <div className="ben-layout">
              <form
                onSubmit={handleAddBeneficiary}
                className="transaction-form ben-add-form"
              >
                <h2>➕ Add Beneficiary</h2>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={benData.beneficiary_name}
                    onChange={(e) =>
                      setBenData({
                        ...benData,
                        beneficiary_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    value={benData.account_number}
                    onChange={(e) =>
                      setBenData({ ...benData, account_number: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Bank Name <small>(leave blank for internal)</small>
                  </label>
                  <input
                    type="text"
                    value={benData.bank_name}
                    onChange={(e) =>
                      setBenData({ ...benData, bank_name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>IFSC / Routing Code</label>
                  <input
                    type="text"
                    value={benData.ifsc_code}
                    onChange={(e) =>
                      setBenData({ ...benData, ifsc_code: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <input
                    type="text"
                    value={benData.notes}
                    onChange={(e) =>
                      setBenData({ ...benData, notes: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving…' : 'Add Beneficiary'}
                </button>
              </form>

              <div className="ben-list-column">
                <h2>Saved Beneficiaries ({beneficiaries.length})</h2>
                {beneficiaries.length === 0 ? (
                  <p className="empty-state">
                    No beneficiaries yet. Add one to speed up future transfers.
                  </p>
                ) : (
                  <div className="beneficiary-grid">
                    {beneficiaries.map((ben) => (
                      <div key={ben.id} className="beneficiary-card">
                        <div className="ben-card-header">
                          <span className="ben-avatar">
                            {ben.beneficiary_name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <h3>{ben.beneficiary_name}</h3>
                            {ben.bank_name && (
                              <span className="ben-bank-badge">
                                {ben.bank_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ben-card-body">
                          <div className="ben-detail">
                            <span className="ben-label">Account</span>
                            <code>{ben.account_number}</code>
                          </div>
                          {ben.ifsc_code && (
                            <div className="ben-detail">
                              <span className="ben-label">IFSC</span>
                              <code>{ben.ifsc_code}</code>
                            </div>
                          )}
                          {ben.notes && (
                            <div className="ben-detail">
                              <span className="ben-label">Note</span>
                              <span>{ben.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="ben-card-actions">
                          <button
                            className="btn-send"
                            onClick={() => sendToBeneficiary(ben)}
                          >
                            💸 Send Money
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleDeleteBeneficiary(ben.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── History ─────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="transaction-history">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="empty-state">No transactions found.</p>
            ) : (
              <div className="table-scroll">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Details</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id}>
                        <td className="txn-date">
                          {new Date(txn.created_at).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge badge-${txn.type.toLowerCase().replace('_', '-')}`}
                          >
                            {txn.type === 'EXTERNAL_TRANSFER'
                              ? '🌐 External'
                              : txn.type}
                          </span>
                        </td>
                        <td className="amount">{fmt(txn.amount)}</td>
                        <td className="txn-detail">
                          {txn.type === 'EXTERNAL_TRANSFER' ? (
                            <span className="ext-detail">
                              → {txn.external_beneficiary_name || '—'}
                              <br />
                              <small>
                                {txn.external_bank_name} ·{' '}
                                {txn.external_account_number}
                              </small>
                            </span>
                          ) : (
                            <span className="int-detail">
                              {(txn as any).from_account?.account_number && (
                                <small>
                                  From:{' '}
                                  {(txn as any).from_account.account_number}
                                </small>
                              )}
                              {(txn as any).to_account?.account_number && (
                                <>
                                  <br />
                                  <small>
                                    To: {(txn as any).to_account.account_number}
                                  </small>
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        <td>{txn.description || '—'}</td>
                        <td>
                          <span
                            className={`status-${txn.status.toLowerCase()}`}
                          >
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
