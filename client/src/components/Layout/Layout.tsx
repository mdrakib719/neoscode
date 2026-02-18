import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../controllers/auth.controller';
import './Layout.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  const navLinkClass = (path: string) =>
    `nav-link${location.pathname === path || location.pathname.startsWith(path + '/') ? ' nav-link-active' : ''}`;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">🏦 Banking System</Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/profile" className={navLinkClass('/profile')}>
            Profile
          </Link>

          {/* Customer navigation */}
          {isCustomer && (
            <>
              <Link to="/accounts" className={navLinkClass('/accounts')}>
                Accounts
              </Link>
              <Link
                to="/transactions"
                className={navLinkClass('/transactions')}
              >
                Transactions
              </Link>
              <Link to="/loans" className={navLinkClass('/loans')}>
                Loans
              </Link>
              <Link to="/statements" className={navLinkClass('/statements')}>
                📄 Statements
              </Link>
            </>
          )}

          {/* Employee / Staff navigation */}
          {isEmployee && (
            <>
              <Link to="/staff" className={navLinkClass('/staff')}>
                🏦 Staff Panel
              </Link>
              <Link
                to="/loan-officers"
                className={navLinkClass('/loan-officers')}
              >
                📋 Loan Officer
              </Link>
            </>
          )}

          {/* Admin only */}
          {isAdmin && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              ⚙ Admin
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <span className={`user-role role-${user?.role?.toLowerCase()}`}>
            {user?.role}
          </span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
