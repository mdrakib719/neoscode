import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../controllers/auth.controller';
import './Auth.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const { login, loginWith2FA, requires2FA, isLoading, error, clearError } =
    useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      // If requires2FA, the store sets requires2FA=true and we show step 2
      if (!useAuthStore.getState().requires2FA) {
        navigate('/dashboard');
      }
    } catch {
      // Error handled in store
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await loginWith2FA(otpCode);
      navigate('/dashboard');
    } catch {
      // Error handled in store
    }
  };

  // ── Step 2: OTP input ─────────────────────────────────────────────────────
  if (requires2FA) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="tfa-icon">🔐</div>
          <h1 className="auth-title">Two-Factor Authentication</h1>
          <p className="auth-subtitle">
            Enter the 6-digit code from your authenticator app.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handle2FASubmit}>
            <div className="form-group">
              <label className="form-label">Authentication Code</label>
              <input
                type="text"
                className="form-control tfa-code-input"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              <span className="form-hint">
                Open your authenticator app (Google Authenticator, Authy, etc.)
                and enter the current code.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading || otpCode.length !== 6}
            >
              {isLoading ? 'Verifying…' : 'Verify & Login'}
            </button>
          </form>

          <button
            className="btn-link tfa-back-link"
            onClick={() => {
              clearError();
              useAuthStore.setState({
                requires2FA: false,
                pending2FACredentials: null,
              });
              setOtpCode('');
            }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Email + password ──────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to your banking account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <div className="demo-credentials">
          <p>
            <strong>Demo Accounts:</strong>
          </p>
          <p>Customer: test@gmail.com Password: You@@123</p>
          <p>Admin: rakibiislam@gmail.com Password: You@@123</p>
          <p>Employee: employee@gmail.com Password: You@@123</p>
        </div>
      </div>
    </div>
  );
};
