import React, { useEffect } from 'react';
import { useReportsStore } from '../../controllers/reports.controller';
import './MonthlyStatement.css';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const fmt = (amount: number | null | undefined) =>
  amount == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(Number(amount));

const fmtDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export const MonthlyStatement: React.FC = () => {
  const {
    userAccounts,
    statement,
    selectedAccountId,
    selectedYear,
    selectedMonth,
    isLoading,
    isDownloading,
    error,
    successMessage,
    loadUserAccounts,
    fetchStatement,
    downloadPDF,
    setSelectedAccount,
    setYear,
    setMonth,
    clearMessages,
  } = useReportsStore();

  // Load accounts on mount
  useEffect(() => {
    loadUserAccounts();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleGenerate = () => {
    if (!selectedAccountId) return;
    fetchStatement(selectedAccountId, selectedYear, selectedMonth);
  };

  const handleDownload = () => {
    if (!selectedAccountId) return;
    downloadPDF(selectedAccountId, selectedYear, selectedMonth);
  };

  const summary = statement?.summary;
  const transactions: any[] = statement?.transactions ?? [];
  const account = statement?.account;
  const period = statement?.period;

  return (
    <div className="ms-page">
      <div className="ms-header">
        <h1 className="ms-title">📄 Monthly Account Statement</h1>
        <p className="ms-subtitle">
          View and download your detailed account statement for any month.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="ms-alert ms-alert-error">
          ⚠ {error}{' '}
          <button className="ms-alert-close" onClick={clearMessages}>
            ×
          </button>
        </div>
      )}
      {successMessage && (
        <div className="ms-alert ms-alert-success">
          ✓ {successMessage}{' '}
          <button className="ms-alert-close" onClick={clearMessages}>
            ×
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="ms-controls card">
        <div className="ms-controls-grid">
          <div className="ms-control-group">
            <label className="ms-label">Account</label>
            <select
              className="ms-select"
              value={selectedAccountId ?? ''}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              disabled={isLoading}
            >
              {userAccounts.length === 0 && (
                <option value="">No accounts found</option>
              )}
              {userAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_number} — {acc.account_type?.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="ms-control-group">
            <label className="ms-label">Month</label>
            <select
              className="ms-select"
              value={selectedMonth}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ms-control-group">
            <label className="ms-label">Year</label>
            <select
              className="ms-select"
              value={selectedYear}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="ms-control-actions">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!selectedAccountId || isLoading}
            >
              {isLoading ? '⏳ Generating…' : '🔍 Generate Statement'}
            </button>
            {statement && (
              <button
                className="btn btn-secondary"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? '⏳ Downloading…' : '⬇ Download PDF'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading placeholder */}
      {isLoading && (
        <div className="ms-loading">
          <div className="ms-spinner"></div>
          <p>Generating statement…</p>
        </div>
      )}

      {/* Statement Content */}
      {!isLoading && statement && (
        <>
          {/* Statement Header */}
          <div className="ms-statement-header card">
            <div className="ms-stmt-meta">
              <div>
                <span className="ms-meta-label">Account</span>
                <span className="ms-meta-value">{account?.account_number}</span>
              </div>
              <div>
                <span className="ms-meta-label">Type</span>
                <span className="ms-meta-value">
                  {account?.account_type?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="ms-meta-label">Account Holder</span>
                <span className="ms-meta-value">{account?.holder}</span>
              </div>
              <div>
                <span className="ms-meta-label">Period</span>
                <span className="ms-meta-value">
                  {period?.month_name} {period?.year}
                </span>
              </div>
              <div>
                <span className="ms-meta-label">From</span>
                <span className="ms-meta-value">{fmtDate(period?.from)}</span>
              </div>
              <div>
                <span className="ms-meta-label">To</span>
                <span className="ms-meta-value">{fmtDate(period?.to)}</span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="ms-summary-grid">
            <div className="ms-summary-card ms-card-neutral">
              <span className="ms-summary-label">Opening Balance</span>
              <span className="ms-summary-amount">
                {fmt(summary?.opening_balance)}
              </span>
            </div>
            <div className="ms-summary-card ms-card-credit">
              <span className="ms-summary-label">Total Credits</span>
              <span className="ms-summary-amount ms-credit">
                +{fmt(summary?.total_credits)}
              </span>
            </div>
            <div className="ms-summary-card ms-card-debit">
              <span className="ms-summary-label">Total Debits</span>
              <span className="ms-summary-amount ms-debit">
                -{fmt(summary?.total_debits)}
              </span>
            </div>
            <div className="ms-summary-card ms-card-closing">
              <span className="ms-summary-label">Closing Balance</span>
              <span className="ms-summary-amount ms-closing">
                {fmt(summary?.closing_balance)}
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="ms-table-wrapper card">
            <div className="ms-table-header">
              <h2 className="ms-table-title">Transaction Details</h2>
              <span className="ms-txn-count">
                {summary?.transaction_count ?? 0} transaction
                {summary?.transaction_count !== 1 ? 's' : ''}
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="ms-empty">
                <p>No transactions found for this period.</p>
              </div>
            ) : (
              <div className="ms-table-scroll">
                <table className="ms-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Counterpart</th>
                      <th className="ms-col-amount">Debit</th>
                      <th className="ms-col-amount">Credit</th>
                      <th className="ms-col-amount">Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, idx) => (
                      <tr
                        key={txn.id ?? idx}
                        className={
                          txn.direction === 'CREDIT'
                            ? 'ms-row-credit'
                            : 'ms-row-debit'
                        }
                      >
                        <td className="ms-col-date">{fmtDate(txn.date)}</td>
                        <td className="ms-col-desc">
                          {txn.description || '—'}
                        </td>
                        <td>
                          <span
                            className={`ms-badge ms-badge-type ms-type-${txn.type?.toLowerCase()}`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td className="ms-col-counter">
                          {txn.counterpart || '—'}
                        </td>
                        <td className="ms-col-amount ms-debit">
                          {txn.debit > 0 ? fmt(txn.debit) : '—'}
                        </td>
                        <td className="ms-col-amount ms-credit">
                          {txn.credit > 0 ? fmt(txn.credit) : '—'}
                        </td>
                        <td className="ms-col-amount ms-balance">
                          {fmt(txn.balance)}
                        </td>
                        <td>
                          <span
                            className={`ms-badge ms-status-${txn.status?.toLowerCase()}`}
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
        </>
      )}

      {/* Empty state (no statement yet) */}
      {!isLoading && !statement && (
        <div className="ms-empty-state card">
          <div className="ms-empty-icon">📄</div>
          <h3>No Statement Generated</h3>
          <p>
            Select an account and period above, then click{' '}
            <strong>Generate Statement</strong> to view your transactions.
          </p>
        </div>
      )}
    </div>
  );
};
