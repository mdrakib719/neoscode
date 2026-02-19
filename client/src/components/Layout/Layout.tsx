import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../controllers/auth.controller';
import { useNotificationStore } from '../../controllers/notification.controller';
import './Layout.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, []);
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
          {/* Notification bell */}
          <Link
            to="/notifications"
            title="Notifications"
            style={{
              position: 'relative',
              textDecoration: 'none',
              fontSize: 22,
              lineHeight: 1,
              marginRight: 6,
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
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
