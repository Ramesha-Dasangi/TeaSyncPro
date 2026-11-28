import React, { useState, useEffect } from 'react';
import { Leaf, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Sun, Moon, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { USERS } from '../data/mockData';
import { api } from '../services/api';

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function LoginPage({ onLogin, onBack, theme, onToggleTheme, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0 = login, 1 = request code, 2 = enter code & new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [devCodeHint, setDevCodeHint] = useState('');
  const [stats, setStats] = useState({ totalBatches: 0, totalSuppliers: 0, totalUsers: 0, totalCollections: 0 });

  // Fetch real DB counts on mount
  useEffect(() => {
    fetch('/api/dashboard/public-stats')
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(data => { if (data) setStats(data); });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    const authResult = await api.login(username, password);
    if (authResult?.user) {
      onLogin(authResult.user);
      return;
    }
    if (authResult?.error) {
      setError(authResult.error);
      setLoading(false);
      return;
    }

    // Fallback when API server is offline
    const passwordHash = await sha256Hex(password);
    const user = USERS.find(u => u.username === username && u.password_sha256 === passwordHash);
    if (user) {
      const { password_sha256: _ignored, ...safeUser } = user;
      onLogin(safeUser);
    } else {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setError('');
    setNotice('');
    setDevCodeHint('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotStep(1);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.requestPasswordReset(username, resetEmail);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDevCodeHint(res.devCode || '');
    setForgotStep(2);
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await api.resetPassword(username, resetCode, newPassword);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setForgotStep(0);
    setPassword('');
    setDevCodeHint('');
    setNotice(res.message || 'Password updated successfully. Please sign in.');
  };

  return (
    <div className="login-page">
      {/* Left Branding Panel with Estate Imagery */}
      <div className="login-left">
        {onBack && (
          <button className="login-back-btn" onClick={onBack} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
        )}
        <div className="login-brand">
          <div className="login-logo">
            <Leaf size={42} color="white" strokeWidth={1.5} />
          </div>
          <h1>TeaSync Pro</h1>
          <p>Estate Management &amp; Traceability Portal</p>
        </div>
        <div className="login-stats">
          <div className="login-stat">
            <div className="stat-num">{stats.totalBatches}</div>
            <div className="stat-text">Batches Processed</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">{stats.totalUsers}</div>
            <div className="stat-text">Registered Users</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">{stats.totalSuppliers}</div>
            <div className="stat-text">Registered Suppliers</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">{stats.totalCollections}</div>
            <div className="stat-text">Leaf Collections</div>
          </div>
        </div>
        <div className="login-secure">
          <ShieldCheck size={14} />
          SECURE LOGIN &nbsp;|&nbsp; ISO 27001 Certified &nbsp;|&nbsp; AES-256 Encrypted
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="login-right" style={{ position: 'relative' }}>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="theme-toggle-login-btn"
            title={theme === 'light' ? 'Switch to Dark Mode (🌙)' : 'Switch to Light Mode (☀️)'}
            style={{
              position: 'absolute', top: 24, right: 28,
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--slate-850)', border: '1px solid var(--card-border)',
              borderRadius: '10px', padding: '7px 12px', cursor: 'pointer',
              color: 'var(--slate-200)', fontSize: '0.8rem', fontWeight: 600,
              transition: 'all 0.2s', zIndex: 10
            }}
          >
            {theme === 'light' ? (
              <>
                <Moon size={15} style={{ color: '#64748b' }} />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun size={15} style={{ color: '#fbbf24' }} />
                <span>Light</span>
              </>
            )}
          </button>
        )}
        <div className="login-card">
          <div className="login-card-header">
            <h2>
              {forgotStep === 0
                ? (<>Welcome to<br />TeaSync Pro</>)
                : 'Reset Password'}
            </h2>
            <p>
              {forgotStep === 0 && 'Sign in with your credentials to access your personalized dashboard'}
              {forgotStep === 1 && 'Enter your username and registered email to receive a reset code'}
              {forgotStep === 2 && 'Enter the 6-digit verification code and your new password'}
            </p>
          </div>

          {error && (
            <div className="login-error">
              <Lock size={14} />
              {error}
            </div>
          )}

          {notice && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 10, marginBottom: 16, fontSize: '0.84rem', fontWeight: 500,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981'
            }}>
              <CheckCircle2 size={15} />
              <span>{notice}</span>
            </div>
          )}

          {forgotStep === 0 && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username / Email</label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="form-input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--slate-500)',
                      background: 'none', border: 'none', cursor: 'pointer'
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" style={{ accentColor: 'var(--emerald-500)' }} />
                  Remember Me
                </label>
                <span className="forgot-link" onClick={openForgotPassword} style={{ cursor: 'pointer' }}>
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In to Estate Portal'}
              </button>
            </form>
          )}

          {forgotStep === 1 && (
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label>Username</label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Registered Email</label>
                <div className="form-input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. admin@teasyncpro.lk"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setError(''); setForgotStep(0); }}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button type="submit" className="login-btn" disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 2 && (
            <form onSubmit={handleConfirmReset}>
              {devCodeHint && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.82rem',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--emerald-400)'
                }}>
                  Local Dev Verification Code: <strong>{devCodeHint}</strong>
                </div>
              )}

              <div className="form-group">
                <label>6-Digit Verification Code</label>
                <div className="form-input-wrap">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="form-input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--slate-500)',
                      background: 'none', border: 'none', cursor: 'pointer'
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="form-input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setError(''); setForgotStep(1); }}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button type="submit" className="login-btn" disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 0 && onRegister && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--slate-400)' }}>
              New supplier?{' '}
              <span
                onClick={onRegister}
                style={{ color: 'var(--emerald-400)', cursor: 'pointer', fontWeight: 600 }}
              >
                Register here
              </span>
            </div>
          )}

          <div style={{
            textAlign: 'center', marginTop: 18, paddingTop: 14,
            borderTop: '1px solid var(--card-border)', fontSize: '0.78rem', color: 'var(--text-muted)'
          }}>
            Support:{' '}
            <a href="mailto:teasyncpro.portal@gmail.com" style={{ color: 'var(--emerald-400)', textDecoration: 'none', fontWeight: 600 }}>
              teasyncpro.portal@gmail.com
            </a>
            {' · '}
            <a href="https://wa.me/94725603073" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald-400)', textDecoration: 'none', fontWeight: 600 }}>
              +94 72 560 3073
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
