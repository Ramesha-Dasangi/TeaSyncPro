import React, { useState } from 'react';
import { Leaf, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Sun, Moon } from 'lucide-react';
import { USERS, ROLES } from '../data/mockData';

const ROLE_CREDENTIALS = [
  { role: ROLES.ADMIN, username: 'admin', password: 'admin123', display: 'Admin' },
  { role: ROLES.FACTORY_MANAGER, username: 'manager01', password: 'pass123', display: 'Factory Manager' },
  { role: ROLES.WITHERING_OFFICER, username: 'wither01', password: 'pass123', display: 'Withering Officer' },
  { role: ROLES.ROLLING_OFFICER, username: 'rolling01', password: 'pass123', display: 'Rolling Officer' },
  { role: ROLES.AERATION_OFFICER, username: 'aeration01', password: 'pass123', display: 'Aeration Officer' },
  { role: ROLES.DRYING_OFFICER, username: 'drying01', password: 'pass123', display: 'Drying Officer' },
  { role: ROLES.GRADING_OFFICER, username: 'grading01', password: 'pass123', display: 'Grading Officer' },
  { role: ROLES.FINANCE_OFFICER, username: 'finance01', password: 'pass123', display: 'Finance Officer' },
  { role: ROLES.COLLECTION_OFFICER, username: 'collect01', password: 'pass123', display: 'Collection Officer' },
  { role: ROLES.SUPPLIER, username: 'supplier01', password: 'pass123', display: 'Supplier' },
];

export default function LoginPage({ onLogin, onBack, theme, onToggleTheme }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (rc) => {
    setSelectedRole(rc);
    setUsername(rc.username);
    setPassword(rc.password);
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 800);
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
            <div className="stat-num">12,903</div>
            <div className="stat-text">Batches Processed</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">1,845</div>
            <div className="stat-text">Registered Users</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">98%</div>
            <div className="stat-text">Traceability Score</div>
          </div>
          <div className="login-stat">
            <div className="stat-num">14</div>
            <div className="stat-text">Active Estates</div>
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
            <h2>Welcome to<br />TeaSync Pro</h2>
            <p>Select your role and sign in to access your personalized dashboard</p>
          </div>

          {/* Role Quick-Select Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ color: 'var(--slate-400)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Quick Role Access (Demo)
              </label>
            </div>
            <div className="role-tabs" style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {ROLE_CREDENTIALS.map(rc => (
                <button
                  key={rc.role}
                  className={`role-tab ${selectedRole?.role === rc.role ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(rc)}
                  style={{ minWidth: '80px' }}
                >
                  {rc.display}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {error && (
              <div className="login-error">
                <Lock size={14} />
                {error}
              </div>
            )}

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
              <span className="forgot-link">Forgot Password?</span>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Estate Portal'}
            </button>
          </form>

          <div className="login-demo-hint">
            Demo: Select any role above → credentials auto-fill →{' '}
            <span>click Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
}
