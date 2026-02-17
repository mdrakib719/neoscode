import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { Dashboard } from './views/dashboard/Dashboard';
import { AdminPanel } from './views/admin/AdminPanel';
import { Layout } from './components/Layout/Layout';
import { useAuthStore } from './controllers/auth.controller';
import './index.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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
          <Route
            path="accounts"
            element={
              <div className="card">
                <h2>Accounts Coming Soon</h2>
              </div>
            }
          />
          <Route
            path="transactions"
            element={
              <div className="card">
                <h2>Transactions Coming Soon</h2>
              </div>
            }
          />
          <Route
            path="loans"
            element={
              <div className="card">
                <h2>Loans Coming Soon</h2>
              </div>
            }
          />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
