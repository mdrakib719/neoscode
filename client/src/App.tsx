import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { Dashboard } from './views/dashboard/Dashboard';
import { AdminPanel } from './views/admin/AdminPanel';
import { Accounts } from './views/accounts/Accounts';
import { Transactions } from './views/transactions/Transactions';
import { Loans } from './views/loans/Loans';
import { Profile } from './views/profile/Profile';
import { StaffDashboard } from './views/staff/StaffDashboard';
import { LoanOfficerDashboard } from './views/loan-officers/LoanOfficerDashboard';
import { MonthlyStatement } from './views/reports/MonthlyStatement';
import { Notifications } from './views/notifications/Notifications';
import { Layout } from './components/Layout/Layout';
import { useAuthStore } from './controllers/auth.controller';
import './index.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const EmployeeRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'EMPLOYEE' && user?.role !== 'ADMIN')
    return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="loans" element={<Loans />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="statements" element={<MonthlyStatement />} />
          <Route path="notifications" element={<Notifications />} />
          {/* Employee-only routes */}
          <Route
            path="staff"
            element={
              <EmployeeRoute>
                <StaffDashboard />
              </EmployeeRoute>
            }
          />
          <Route
            path="loan-officers"
            element={
              <EmployeeRoute>
                <LoanOfficerDashboard />
              </EmployeeRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
