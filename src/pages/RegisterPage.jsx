import React, { useState } from 'react';
import { Leaf, User, Lock, Eye, EyeOff, Phone, Mail, MapPin, Landmark, Truck, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage({ onBack }) {
  const [step, setStep] = useState(1); // 1 = personal info, 2 = account credentials
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
    bank_name: '', bank_account: '', transport_mode: 'Own Vehicle',
    username: '', password: '', confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Username and password are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: form.email || null,
          address: form.address || null, bank_name: form.bank_name || null,
          bank_account: form.bank_account || null, transport_mode: form.transport_mode,
          username: form.username, password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return; }
      setSuccess(true);
    } catch {
      setError('Could not connect to server. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-logo"><Leaf size={42} color="white" strokeWidth={1.5} /></div>
            <h1>TeaSync Pro</h1>
            <p>Estate Management &amp; Traceability Portal</p>
          </div>
        </div>
        <div className="login-right">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <CheckCircle size={56} color="var(--emerald-500)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ color: 'var(--emerald-400)', marginBottom: 8 }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your supplier account has been created. You can now log in with your credentials.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Username: <strong style={{ color: 'var(--text-primary)' }}>{form.username}</strong>
            </p>
            <button className="login-btn" onClick={onBack}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <button className="login-back-btn" onClick={onBack} title="Back to Login">
          <ArrowLeft size={16} /><span>Back to Login</span>
        </button>
        <div className="login-brand">
          <div className="login-logo"><Leaf size={42} color="white" strokeWidth={1.5} /></div>
          <h1>TeaSync Pro</h1>
          <p>Estate Management &amp; Traceability Portal</p>
        </div>
        <div className="login-secure" style={{ marginTop: 'auto' }}>
          New suppliers can register to track their leaf deliveries and payments online.
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Supplier Registration</h2>
            <p>{step === 1 ? 'Step 1 of 2 — Personal & Contact Info' : 'Step 2 of 2 — Create Login Credentials'}</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[1,2].map(s => (
              <div key={s} style={{
                height: 4, flex: 1, borderRadius: 2,
                background: step >= s ? 'var(--emerald-500)' : 'var(--card-border)'
              }} />
            ))}
          </div>

          {error && (
            <div className="login-error">
              <Lock size={14} /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div className="form-group">
                <label>Full Name *</label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <div className="form-input-wrap">
                  <Phone size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="0771234567" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="form-input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input className="form-input" type="email" placeholder="Optional" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <div className="form-input-wrap">
                  <MapPin size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="Estate / village address" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <div className="form-input-wrap">
                  <Landmark size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="e.g. Bank of Ceylon" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Bank Account Number</label>
                <div className="form-input-wrap">
                  <Landmark size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="Account number" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Transport Mode</label>
                <div className="form-input-wrap">
                  <Truck size={16} className="input-icon" />
                  <select className="form-input" value={form.transport_mode} onChange={e => set('transport_mode', e.target.value)}>
                    <option>Own Vehicle</option>
                    <option>Factory Collection</option>
                    <option>Third Party</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="login-btn">Next — Create Credentials →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Choose Username *</label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon" />
                  <input className="form-input" type="text" placeholder="e.g. asela_kumara" value={form.username} onChange={e => set('username', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <div className="form-input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="form-input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} style={{ paddingRight: 44 }} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                <button type="submit" className="login-btn" disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Registering...' : 'Create My Account'}
                </button>
              </div>
            </form>
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
