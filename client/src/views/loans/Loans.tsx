import React, { useEffect, useState } from 'react';
import { loanController } from '../../controllers/loan.controller';
import { Loan } from '../../models/types';
import './Loans.css';

export const Loans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apply' | 'my-loans'>('my-loans');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [loanData, setLoanData] = useState({
    loan_type: 'PERSONAL',
    amount: '',
    tenure_months: '',
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      await loanController.loadLoans();
      const fetchedLoans = loanController.getLoans();
      setLoans(fetchedLoans);
    } catch (error) {
      console.error('Failed to load loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loanController.applyLoan({
        loan_type: loanData.loan_type,
        amount: parseFloat(loanData.amount),
        tenure_months: parseInt(loanData.tenure_months),
      });
      alert('Loan application submitted successfully!');
      setLoanData({ loan_type: 'PERSONAL', amount: '', tenure_months: '' });
      loadLoans();
      setActiveTab('my-loans');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply for loan');
    } finally {
      setLoading(false);
    }
  };

  const handlePayEMI = async (loanId: number) => {
    if (!confirm('Are you sure you want to pay this EMI?')) return;

    setLoading(true);
    try {
      const result = await loanController.payEMI(loanId);
      alert(
        `EMI paid successfully! ${result.penalty_applied ? `Penalty: $${result.penalty_amount}` : ''}`,
      );
      loadLoans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to pay EMI');
    } finally {
      setLoading(false);
    }
  };

  const viewLoanDetails = async (loan: Loan) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/loans/${loan.id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Failed to fetch loan details');

      const details = await response.json();
      setSelectedLoan({ ...loan, ...details });
    } catch (error) {
      console.error('Failed to load loan details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';
      case 'PENDING':
        return 'status-pending';
      case 'REJECTED':
        return 'status-rejected';
      case 'CLOSED':
        return 'status-closed';
      default:
        return '';
    }
  };

  const calculateInterestRate = (loanType: string): number => {
    switch (loanType) {
      case 'PERSONAL':
        return 12;
      case 'HOME':
        return 8;
      case 'VEHICLE':
        return 10;
      case 'EDUCATION':
        return 9;
      default:
        return 12;
    }
  };

  const estimateEMI = (): number => {
    if (!loanData.amount || !loanData.tenure_months) return 0;

    const principal = parseFloat(loanData.amount);
    const tenure = parseInt(loanData.tenure_months);
    const rate = calculateInterestRate(loanData.loan_type) / 100 / 12;

    const emi =
      (principal * rate * Math.pow(1 + rate, tenure)) /
      (Math.pow(1 + rate, tenure) - 1);
    return emi;
  };

  return (
    <div className="loans-container">
      <h1>Loan Management</h1>

      <div className="tabs">
        <button
          className={activeTab === 'my-loans' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('my-loans')}
        >
          My Loans
        </button>
        <button
          className={activeTab === 'apply' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('apply')}
        >
          Apply for Loan
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'apply' && (
          <form onSubmit={handleApplyLoan} className="loan-form">
            <h2>Apply for a New Loan</h2>

            <div className="form-group">
              <label>Loan Type</label>
              <select
                value={loanData.loan_type}
                onChange={(e) =>
                  setLoanData({ ...loanData, loan_type: e.target.value })
                }
                required
              >
                <option value="PERSONAL">Personal Loan (12% interest)</option>
                <option value="HOME">Home Loan (8% interest)</option>
                <option value="VEHICLE">Vehicle Loan (10% interest)</option>
                <option value="EDUCATION">Education Loan (9% interest)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Loan Amount ($)</label>
              <input
                type="number"
                value={loanData.amount}
                onChange={(e) =>
                  setLoanData({ ...loanData, amount: e.target.value })
                }
                required
                min="1000"
                step="100"
              />
            </div>

            <div className="form-group">
              <label>Tenure (Months)</label>
              <input
                type="number"
                value={loanData.tenure_months}
                onChange={(e) =>
                  setLoanData({ ...loanData, tenure_months: e.target.value })
                }
                required
                min="6"
                max="360"
              />
            </div>

            {loanData.amount && loanData.tenure_months && (
              <div className="emi-estimate">
                <h3>EMI Estimate</h3>
                <p className="emi-amount">
                  ${estimateEMI().toFixed(2)} / month
                </p>
                <p className="interest-info">
                  Interest Rate: {calculateInterestRate(loanData.loan_type)}%
                  per annum
                </p>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Apply for Loan'}
            </button>
          </form>
        )}

        {activeTab === 'my-loans' && (
          <div className="loans-list">
            <h2>My Loans</h2>
            {loading ? (
              <p className="loading">Loading loans...</p>
            ) : loans.length === 0 ? (
              <p className="empty-state">
                No loans found. Apply for a loan to get started!
              </p>
            ) : (
              <div className="loans-grid">
                {loans.map((loan) => (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-header">
                      <h3>{loan.loan_type} Loan</h3>
                      <span className={`status ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>

                    <div className="loan-details">
                      <div className="detail-row">
                        <span>Loan Amount:</span>
                        <span className="amount">
                          ${parseFloat(loan.amount.toString()).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Interest Rate:</span>
                        <span>{loan.interest_rate}%</span>
                      </div>
                      <div className="detail-row">
                        <span>Tenure:</span>
                        <span>{loan.tenure_months} months</span>
                      </div>
                      <div className="detail-row">
                        <span>EMI Amount:</span>
                        <span className="emi">
                          ${parseFloat(loan.emi_amount.toString()).toFixed(2)}
                        </span>
                      </div>

                      {loan.status === 'APPROVED' && (
                        <>
                          {loan.remaining_balance !== undefined && (
                            <div className="detail-row">
                              <span>Remaining Balance:</span>
                              <span className="remaining">
                                $
                                {parseFloat(
                                  loan.remaining_balance.toString(),
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {loan.paid_installments !== undefined && (
                            <div className="detail-row">
                              <span>Installments Paid:</span>
                              <span>
                                {loan.paid_installments} / {loan.tenure_months}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="detail-row">
                        <span>Applied On:</span>
                        <span>
                          {new Date(loan.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {loan.status === 'APPROVED' && loan.updated_at && (
                        <div className="detail-row">
                          <span>Approved On:</span>
                          <span>
                            {new Date(loan.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="loan-actions">
                      {loan.status === 'APPROVED' && (
                        <button
                          className="btn-primary"
                          onClick={() => handlePayEMI(loan.id)}
                          disabled={loading}
                        >
                          Pay EMI
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        onClick={() => viewLoanDetails(loan)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLoan && (
        <div className="modal-overlay" onClick={() => setSelectedLoan(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Loan Details - {selectedLoan.loan_type}</h2>
            <div className="loan-summary">
              <p>
                <strong>Status:</strong> {selectedLoan.status}
              </p>
              <p>
                <strong>Total Amount:</strong> $
                {parseFloat(selectedLoan.amount.toString()).toFixed(2)}
              </p>
              <p>
                <strong>EMI:</strong> $
                {parseFloat(selectedLoan.emi_amount.toString()).toFixed(2)}
              </p>
              <p>
                <strong>Interest Rate:</strong> {selectedLoan.interest_rate}%
              </p>
              <p>
                <strong>Tenure:</strong> {selectedLoan.tenure_months} months
              </p>

              {selectedLoan.remaining_balance !== undefined && (
                <>
                  <p>
                    <strong>Remaining Balance:</strong> $
                    {parseFloat(
                      selectedLoan.remaining_balance.toString(),
                    ).toFixed(2)}
                  </p>
                  <p>
                    <strong>Paid Installments:</strong>{' '}
                    {selectedLoan.paid_installments} /{' '}
                    {selectedLoan.tenure_months}
                  </p>
                </>
              )}
            </div>
            <button
              className="btn-secondary"
              onClick={() => setSelectedLoan(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
