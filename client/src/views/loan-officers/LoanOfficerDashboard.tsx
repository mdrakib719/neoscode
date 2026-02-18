import React, { useEffect, useState } from 'react';
import { useLoanOfficerStore } from '../../controllers/loan-officer.controller';
import { useAuthStore } from '../../controllers/auth.controller';
import './LoanOfficerDashboard.css';

type ActiveTab = 'overview' | 'pending' | 'approved' | 'overdue' | 'all';

export const LoanOfficerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    pendingLoans,
    approvedLoans,
    overdueLoans,
    allLoans,
    selectedLoan,
    repaymentSchedule,
    dashboardStats,
    isLoading,
    actionLoading,
    error,
    successMessage,
    fetchDashboard,
    fetchApprovedLoans,
    fetchAllLoans,
    selectLoan,
    clearSelectedLoan,
    approveLoan,
    rejectLoan,
    addRemarks,
    clearMessages,
  } = useLoanOfficerStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showApproveModal, setShowApproveModal] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<any | null>(null);
  const [approveData, setApproveData] = useState({
    approvalNotes: '',
    recommendedEMI: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [remarksText, setRemarksText] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'approved') fetchApprovedLoans();
    if (activeTab === 'all')
      fetchAllLoans(filterStatus ? { status: filterStatus } : undefined);
  }, [activeTab, filterStatus]);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(clearMessages, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error]);

  const handleApprove = async () => {
    if (!showApproveModal) return;
    if (!approveData.approvalNotes.trim()) return;
    await approveLoan(showApproveModal.id, {
      approvalNotes: approveData.approvalNotes,
      recommendedEMI: approveData.recommendedEMI || undefined,
    });
    setShowApproveModal(null);
    setApproveData({ approvalNotes: '', recommendedEMI: '' });
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason.trim()) return;
    await rejectLoan(showRejectModal.id, rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const handleAddRemarks = async () => {
    if (!showRemarksModal || !remarksText.trim()) return;
    await addRemarks(showRemarksModal, remarksText);
    setShowRemarksModal(null);
    setRemarksText('');
  };

  const stats = dashboardStats || {};
  const pendingCount = pendingLoans.length;

  const loanTypeColor = (type: string) => {
    const map: Record<string, string> = {
      PERSONAL: 'lo-type-personal',
      HOME: 'lo-type-home',
      VEHICLE: 'lo-type-vehicle',
      EDUCATION: 'lo-type-education',
    };
    return map[type] || '';
  };

  const renderLoanList = (loans: any[], showActions = false) => (
    <div className="lo-loan-list">
      {loans.length === 0 ? (
        <div className="lo-empty">No loans found</div>
      ) : (
        loans.map((loan: any) => (
          <div key={loan.id} className="lo-loan-card">
            <div className="lo-loan-top">
              <div className="lo-loan-id">#{loan.id}</div>
              <span
                className={`lo-type-badge ${loanTypeColor(loan.loan_type)}`}
              >
                {loan.loan_type}
              </span>
              <span
                className={`lo-status-badge lo-status-${loan.status?.toLowerCase()}`}
              >
                {loan.status}
              </span>
            </div>
            <div className="lo-loan-body">
              <div className="lo-loan-meta">
                <div className="lo-meta-row">
                  <label>Customer</label>
                  <span>{loan.user?.name || `User #${loan.user_id}`}</span>
                </div>
                <div className="lo-meta-row">
                  <label>Amount</label>
                  <span className="lo-loan-amount">
                    ${parseFloat(String(loan.amount || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="lo-meta-row">
                  <label>Interest Rate</label>
                  <span>{loan.interest_rate}%</span>
                </div>
                <div className="lo-meta-row">
                  <label>Tenure</label>
                  <span>{loan.tenure_months} months</span>
                </div>
                <div className="lo-meta-row">
                  <label>EMI</label>
                  <span>
                    ${parseFloat(String(loan.emi_amount || 0)).toFixed(2)}/mo
                  </span>
                </div>
                {loan.remaining_balance !== undefined && (
                  <div className="lo-meta-row">
                    <label>Remaining</label>
                    <span>
                      $
                      {parseFloat(String(loan.remaining_balance || 0)).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                )}
                <div className="lo-meta-row">
                  <label>Applied</label>
                  <span>{new Date(loan.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {loan.remarks && (
                <div className="lo-existing-remarks">
                  <label>Remarks:</label> {loan.remarks}
                </div>
              )}
            </div>
            {showActions && loan.status === 'PENDING' && (
              <div className="lo-loan-actions">
                <button
                  className="lo-btn-approve"
                  onClick={() => {
                    setShowApproveModal(loan);
                    setApproveData({
                      approvalNotes: '',
                      recommendedEMI: '',
                    });
                  }}
                  disabled={actionLoading}
                >
                  ✓ Approve
                </button>
                <button
                  className="lo-btn-reject"
                  onClick={() => setShowRejectModal(loan)}
                  disabled={actionLoading}
                >
                  ✗ Reject
                </button>
                <button
                  className="lo-btn-details"
                  onClick={() => selectLoan(loan.id)}
                  disabled={isLoading}
                >
                  View Details
                </button>
                <button
                  className="lo-btn-remarks"
                  onClick={() => setShowRemarksModal(loan.id)}
                >
                  + Remarks
                </button>
              </div>
            )}
            {showActions && loan.status !== 'PENDING' && (
              <div className="lo-loan-actions">
                <button
                  className="lo-btn-details"
                  onClick={() => selectLoan(loan.id)}
                >
                  View Details
                </button>
                <button
                  className="lo-btn-remarks"
                  onClick={() => setShowRemarksModal(loan.id)}
                >
                  + Remarks
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="lo-dashboard">
      {/* ── Header ── */}
      <div className="lo-header">
        <div className="lo-header-left">
          <div className="lo-badge">LOAN OFFICER</div>
          <div>
            <h1 className="lo-title">Loan Officer Dashboard</h1>
            <p className="lo-subtitle">
              Welcome, {user?.name} · Review & manage loan applications
            </p>
          </div>
        </div>
        <div className="lo-header-stats">
          <div className="lo-header-stat">
            <span>{pendingCount}</span>
            <label>Pending Review</label>
          </div>
          <div className="lo-header-stat lo-header-stat-alert">
            <span>{overdueLoans.length}</span>
            <label>Overdue</label>
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && <div className="lo-alert lo-alert-error">⚠ {error}</div>}
      {successMessage && (
        <div className="lo-alert lo-alert-success">✓ {successMessage}</div>
      )}

      {/* ── Tabs ── */}
      <div className="lo-tabs">
        {(
          [
            { key: 'overview', label: '📊 Overview' },
            { key: 'pending', label: `⏳ Pending (${pendingCount})` },
            { key: 'approved', label: '✅ Approved' },
            { key: 'overdue', label: `⚠ Overdue (${overdueLoans.length})` },
            { key: 'all', label: '📋 All Loans' },
          ] as { key: ActiveTab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            className={`lo-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════ */}
      {activeTab === 'overview' && (
        <div className="lo-section">
          {/* Stats */}
          <div className="lo-grid-4">
            <div className="lo-stat-card">
              <div className="lo-stat-icon">⏳</div>
              <div>
                <div className="lo-stat-label">Pending Applications</div>
                <div className="lo-stat-value">{pendingLoans.length}</div>
              </div>
            </div>
            <div className="lo-stat-card">
              <div className="lo-stat-icon">✅</div>
              <div>
                <div className="lo-stat-label">Approved Loans</div>
                <div className="lo-stat-value">
                  {stats.approvedLoans ?? '—'}
                </div>
              </div>
            </div>
            <div className="lo-stat-card lo-stat-card-alert">
              <div className="lo-stat-icon">⚠</div>
              <div>
                <div className="lo-stat-label">Overdue Loans</div>
                <div className="lo-stat-value">{overdueLoans.length}</div>
              </div>
            </div>
            <div className="lo-stat-card">
              <div className="lo-stat-icon">💰</div>
              <div>
                <div className="lo-stat-label">Total Portfolio</div>
                <div className="lo-stat-value lo-stat-value-sm">
                  ${(stats.totalPortfolio || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="lo-grid-2">
            <div className="lo-card">
              <div className="lo-card-header">
                <h2>📋 Officer Responsibilities</h2>
              </div>
              <ul className="lo-resp-list">
                {[
                  {
                    icon: '📄',
                    title: 'Loan Processing',
                    desc: 'Review applications, check eligibility and documents',
                  },
                  {
                    icon: '⚖',
                    title: 'Risk Assessment',
                    desc: 'Evaluate repayment capacity and apply appropriate interest rates',
                  },
                  {
                    icon: '📊',
                    title: 'Loan Monitoring',
                    desc: 'Track repayment schedules and monitor overdue payments',
                  },
                  {
                    icon: '📈',
                    title: 'Reporting & Oversight',
                    desc: 'Generate reports on approved/rejected loans',
                  },
                ].map((r) => (
                  <li key={r.title}>
                    <span className="lo-resp-icon">{r.icon}</span>
                    <div>
                      <strong>{r.title}</strong>
                      <p>{r.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lo-card">
              <div className="lo-card-header">
                <h2>🔔 Pending Applications</h2>
              </div>
              {isLoading ? (
                <div className="lo-loading">
                  <div className="lo-spinner" />
                </div>
              ) : pendingLoans.length === 0 ? (
                <div className="lo-empty">No pending applications</div>
              ) : (
                <div className="lo-pending-preview">
                  {pendingLoans.slice(0, 5).map((loan: any) => (
                    <div
                      key={loan.id}
                      className="lo-pending-row"
                      onClick={() => setActiveTab('pending')}
                    >
                      <div className="lo-pending-info">
                        <div className="lo-pending-name">
                          {loan.user?.name || `User #${loan.user_id}`}
                        </div>
                        <div className="lo-pending-type">{loan.loan_type}</div>
                      </div>
                      <div className="lo-pending-amount">
                        ${parseFloat(String(loan.amount || 0)).toLocaleString()}
                      </div>
                      <button
                        className="lo-quick-approve"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowApproveModal(loan);
                          setApproveData({
                            approvalNotes: '',
                            recommendedEMI: '',
                          });
                        }}
                      >
                        Review
                      </button>
                    </div>
                  ))}
                  {pendingLoans.length > 5 && (
                    <button
                      className="lo-view-all"
                      onClick={() => setActiveTab('pending')}
                    >
                      View all {pendingLoans.length} pending →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Overdue Preview */}
          {overdueLoans.length > 0 && (
            <div className="lo-card lo-card-alert-border">
              <div className="lo-card-header">
                <h2>⚠ Overdue Loans Requiring Attention</h2>
                <button
                  className="lo-view-all-btn"
                  onClick={() => setActiveTab('overdue')}
                >
                  View All →
                </button>
              </div>
              <table className="lo-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Due Amount</th>
                    <th>Days Overdue</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.slice(0, 5).map((loan: any) => (
                    <tr key={loan.id}>
                      <td>#{loan.id}</td>
                      <td>{loan.user?.name || `User #${loan.user_id}`}</td>
                      <td>
                        <span
                          className={`lo-type-badge ${loanTypeColor(loan.loan_type)}`}
                        >
                          {loan.loan_type}
                        </span>
                      </td>
                      <td>
                        ${parseFloat(String(loan.amount || 0)).toLocaleString()}
                      </td>
                      <td className="lo-overdue-amount">
                        ${parseFloat(String(loan.emi_amount || 0)).toFixed(2)}
                      </td>
                      <td>
                        <span className="lo-days-overdue">
                          {loan.daysOverdue || '?'} days
                        </span>
                      </td>
                      <td>
                        <button
                          className="lo-btn-details"
                          onClick={() => selectLoan(loan.id)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ PENDING ══════════════ */}
      {activeTab === 'pending' && (
        <div className="lo-section">
          <div className="lo-section-header">
            <h2>Pending Loan Applications ({pendingLoans.length})</h2>
          </div>
          {isLoading ? (
            <div className="lo-loading">
              <div className="lo-spinner" />
            </div>
          ) : (
            renderLoanList(pendingLoans, true)
          )}
        </div>
      )}

      {/* ══════════════ APPROVED ══════════════ */}
      {activeTab === 'approved' && (
        <div className="lo-section">
          <div className="lo-section-header">
            <h2>Approved Loans ({approvedLoans.length})</h2>
          </div>
          {isLoading ? (
            <div className="lo-loading">
              <div className="lo-spinner" />
            </div>
          ) : (
            renderLoanList(approvedLoans, true)
          )}
        </div>
      )}

      {/* ══════════════ OVERDUE ══════════════ */}
      {activeTab === 'overdue' && (
        <div className="lo-section">
          <div className="lo-section-header">
            <h2>Overdue Loans ({overdueLoans.length})</h2>
          </div>
          {isLoading ? (
            <div className="lo-loading">
              <div className="lo-spinner" />
            </div>
          ) : (
            <div className="lo-card">
              <table className="lo-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Loan Amount</th>
                    <th>EMI</th>
                    <th>Remaining Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.map((loan: any) => (
                    <tr key={loan.id}>
                      <td>#{loan.id}</td>
                      <td>
                        <strong>
                          {loan.user?.name || `User #${loan.user_id}`}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`lo-type-badge ${loanTypeColor(loan.loan_type)}`}
                        >
                          {loan.loan_type}
                        </span>
                      </td>
                      <td>
                        ${parseFloat(String(loan.amount || 0)).toLocaleString()}
                      </td>
                      <td>
                        ${parseFloat(String(loan.emi_amount || 0)).toFixed(2)}
                      </td>
                      <td className="lo-overdue-amount">
                        $
                        {parseFloat(
                          String(loan.remaining_balance || 0),
                        ).toFixed(2)}
                      </td>
                      <td>
                        <span className="lo-status-badge lo-status-overdue">
                          OVERDUE
                        </span>
                      </td>
                      <td>
                        <button
                          className="lo-btn-details"
                          onClick={() => selectLoan(loan.id)}
                        >
                          View
                        </button>
                        <button
                          className="lo-btn-remarks"
                          onClick={() => setShowRemarksModal(loan.id)}
                        >
                          + Remarks
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overdueLoans.length === 0 && (
                <div className="lo-empty">No overdue loans</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ ALL LOANS ══════════════ */}
      {activeTab === 'all' && (
        <div className="lo-section">
          <div className="lo-section-header">
            <h2>All Loans</h2>
            <div className="lo-filter-bar">
              <select
                className="lo-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
          {isLoading ? (
            <div className="lo-loading">
              <div className="lo-spinner" />
            </div>
          ) : (
            <div className="lo-card">
              <table className="lo-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Interest</th>
                    <th>Tenure</th>
                    <th>EMI</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allLoans.map((loan: any) => (
                    <tr key={loan.id}>
                      <td>#{loan.id}</td>
                      <td>
                        <strong>
                          {loan.user?.name || `User #${loan.user_id}`}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`lo-type-badge ${loanTypeColor(loan.loan_type)}`}
                        >
                          {loan.loan_type}
                        </span>
                      </td>
                      <td>
                        ${parseFloat(String(loan.amount || 0)).toLocaleString()}
                      </td>
                      <td>{loan.interest_rate}%</td>
                      <td>{loan.tenure_months}m</td>
                      <td>
                        ${parseFloat(String(loan.emi_amount || 0)).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`lo-status-badge lo-status-${loan.status?.toLowerCase()}`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td>{new Date(loan.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="lo-btn-details"
                            onClick={() => selectLoan(loan.id)}
                          >
                            View
                          </button>
                          {loan.status === 'PENDING' && (
                            <button
                              className="lo-btn-approve"
                              onClick={() => {
                                setShowApproveModal(loan);
                                setApproveData({
                                  approvalNotes: '',
                                  recommendedEMI: '',
                                });
                              }}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allLoans.length === 0 && (
                <div className="lo-empty">No loans found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ LOAN DETAIL PANEL ══════════════ */}
      {selectedLoan && (
        <div className="lo-detail-overlay" onClick={clearSelectedLoan}>
          <div className="lo-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="lo-detail-header">
              <div>
                <h2>
                  Loan #{selectedLoan.id} — {selectedLoan.loan_type}
                </h2>
                <p>{selectedLoan.user?.name}</p>
              </div>
              <button className="staff-btn-ghost" onClick={clearSelectedLoan}>
                ✕ Close
              </button>
            </div>

            <div className="lo-detail-body">
              {/* Summary */}
              <div className="lo-detail-grid">
                {[
                  {
                    label: 'Amount',
                    value: `$${parseFloat(String(selectedLoan.amount || 0)).toLocaleString()}`,
                  },
                  {
                    label: 'Interest Rate',
                    value: `${selectedLoan.interest_rate}%`,
                  },
                  {
                    label: 'Tenure',
                    value: `${selectedLoan.tenure_months} months`,
                  },
                  {
                    label: 'EMI',
                    value: `$${parseFloat(String(selectedLoan.emi_amount || 0)).toFixed(2)}/mo`,
                  },
                  {
                    label: 'Remaining',
                    value: `$${parseFloat(String(selectedLoan.remaining_balance || 0)).toFixed(2)}`,
                  },
                  {
                    label: 'Installments Paid',
                    value: `${selectedLoan.paid_installments || 0}/${selectedLoan.tenure_months}`,
                  },
                  {
                    label: 'Status',
                    value: (
                      <span
                        className={`lo-status-badge lo-status-${selectedLoan.status?.toLowerCase()}`}
                      >
                        {selectedLoan.status}
                      </span>
                    ),
                  },
                  {
                    label: 'Applied',
                    value: new Date(
                      selectedLoan.created_at,
                    ).toLocaleDateString(),
                  },
                ].map((item) => (
                  <div key={item.label} className="lo-detail-item">
                    <label>{item.label}</label>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              {selectedLoan.remarks && (
                <div className="lo-detail-remarks">
                  <label>Remarks:</label> {selectedLoan.remarks}
                </div>
              )}

              {/* Repayment Schedule */}
              {repaymentSchedule.length > 0 && (
                <div className="lo-detail-section">
                  <h3>Repayment Schedule</h3>
                  <table className="lo-table lo-schedule-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Due Date</th>
                        <th>EMI</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentSchedule.map((row: any) => (
                        <tr key={row.installment_number}>
                          <td>{row.installment_number}</td>
                          <td>{new Date(row.due_date).toLocaleDateString()}</td>
                          <td>
                            $
                            {parseFloat(String(row.emi_amount || 0)).toFixed(2)}
                          </td>
                          <td>
                            $
                            {parseFloat(
                              String(row.principal_component || 0),
                            ).toFixed(2)}
                          </td>
                          <td>
                            $
                            {parseFloat(
                              String(row.interest_component || 0),
                            ).toFixed(2)}
                          </td>
                          <td>
                            <span
                              className={`lo-status-badge lo-status-${(row.status || 'pending').toLowerCase()}`}
                            >
                              {row.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Approve / Reject if pending */}
              {selectedLoan.status === 'PENDING' && (
                <div className="lo-detail-actions">
                  <button
                    className="lo-btn-approve lo-btn-lg"
                    onClick={() => {
                      setShowApproveModal(selectedLoan);
                      setApproveData({
                        approvalNotes: '',
                        recommendedEMI: '',
                      });
                    }}
                  >
                    ✓ Approve Loan
                  </button>
                  <button
                    className="lo-btn-reject lo-btn-lg"
                    onClick={() => setShowRejectModal(selectedLoan)}
                  >
                    ✗ Reject Loan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ APPROVE MODAL ══════════════ */}
      {showApproveModal && (
        <div
          className="staff-modal-overlay"
          onClick={() => setShowApproveModal(null)}
        >
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>✓ Approve Loan #{showApproveModal.id}</h2>
              <button
                className="staff-modal-close"
                onClick={() => setShowApproveModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="staff-modal-body">
              <div className="lo-approve-summary">
                <strong>{showApproveModal.user?.name}</strong> —{' '}
                {showApproveModal.loan_type} Loan
              </div>
              <div className="staff-form-group">
                <label>
                  Approval Notes <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  className="staff-input staff-textarea"
                  rows={3}
                  placeholder="Enter approval notes…"
                  value={approveData.approvalNotes}
                  onChange={(e) =>
                    setApproveData({
                      ...approveData,
                      approvalNotes: e.target.value,
                    })
                  }
                />
              </div>
              <div className="staff-form-group">
                <label>Recommended EMI (optional)</label>
                <input
                  type="text"
                  className="staff-input"
                  placeholder="e.g. $5,200/month"
                  value={approveData.recommendedEMI}
                  onChange={(e) =>
                    setApproveData({
                      ...approveData,
                      recommendedEMI: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowApproveModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing…' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REJECT MODAL ══════════════ */}
      {showRejectModal && (
        <div
          className="staff-modal-overlay"
          onClick={() => setShowRejectModal(null)}
        >
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>✗ Reject Loan #{showRejectModal.id}</h2>
              <button
                className="staff-modal-close"
                onClick={() => setShowRejectModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="staff-modal-body">
              <p className="staff-modal-warning">
                Rejecting cannot be undone. Please provide a clear reason for
                the customer.
              </p>
              <div className="staff-form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  className="staff-input staff-textarea"
                  rows={4}
                  placeholder="Enter rejection reason…"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Processing…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REMARKS MODAL ══════════════ */}
      {showRemarksModal !== null && (
        <div
          className="staff-modal-overlay"
          onClick={() => setShowRemarksModal(null)}
        >
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>📝 Add Remarks — Loan #{showRemarksModal}</h2>
              <button
                className="staff-modal-close"
                onClick={() => setShowRemarksModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="staff-modal-body">
              <div className="staff-form-group">
                <label>Remarks</label>
                <textarea
                  className="staff-input staff-textarea"
                  rows={4}
                  placeholder="Enter your remarks…"
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRemarksModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddRemarks}
                disabled={actionLoading || !remarksText.trim()}
              >
                {actionLoading ? 'Saving…' : 'Save Remarks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
