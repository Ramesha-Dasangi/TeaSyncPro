import React from 'react';
import { Bell, RefreshCw, Sun, Moon } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Estate-wide operations overview' },
  collection: { title: 'Leaf Collection', subtitle: 'Tea leaf intake & daily schedules' },
  production: { title: 'Production Batches', subtitle: 'Factory batch processing tracker' },
  grading: { title: 'Grading & Packaging', subtitle: 'Finished tea grading & stock' },
  inventory: { title: 'Inventory', subtitle: 'Stock management & warehouse' },
  suppliers: { title: 'Suppliers', subtitle: 'Supplier management & payment history' },
  employees: { title: 'Employees', subtitle: 'Staff management & attendance' },
  finance: { title: 'Finance & Payments', subtitle: 'Payment processing & leaf rates' },
  reports: { title: 'Reports & Analytics', subtitle: 'Generate, filter & export reports' },
  supplier_profile: { title: 'My Supplier Profile', subtitle: 'Estate membership, contact details & banking' },
  supplier_payments: { title: 'My Payment History', subtitle: 'Verified leaf supply vouchers & settlement status' },
  settings: { title: 'Settings', subtitle: 'System configuration' },
};

export default function TopHeader({ currentPage, user, theme, onToggleTheme }) {
  const page = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="top-header">
      <div className="header-page-title">
        <h1>{page.title}</h1>
        <p>{page.subtitle} &nbsp;·&nbsp; {dateStr} &nbsp;·&nbsp; {timeStr}</p>
      </div>
      <div className="header-actions">
        {/* Light / Dark Mode Toggle */}
        <button
          className="header-icon-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode (🌙)' : 'Switch to Light Mode (☀️)'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', width: 'auto' }}
        >
          {theme === 'light' ? (
            <>
              <Moon size={16} style={{ color: '#475569' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Dark</span>
            </>
          ) : (
            <>
              <Sun size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Light</span>
            </>
          )}
        </button>

        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE
        </div>
        <button className="header-icon-btn" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="header-icon-btn" title="Refresh" onClick={() => window.location.reload()}>
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  );
}
