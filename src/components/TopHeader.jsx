import React, { useState } from 'react';
import { Bell, RefreshCw, Sun, Moon, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const PAGE_TITLES = {
  dashboard:         { title: 'Dashboard',              subtitle: 'Estate-wide operations overview' },
  collection:        { title: 'Leaf Collection',         subtitle: 'Tea leaf intake & daily schedules' },
  production:        { title: 'Production Batches',      subtitle: 'Factory batch processing tracker' },
  grading:           { title: 'Grading & Packaging',     subtitle: 'Finished tea grading & stock' },
  inventory:         { title: 'Inventory',               subtitle: 'Stock management & warehouse' },
  suppliers:         { title: 'Suppliers',               subtitle: 'Supplier management & payment history' },
  employees:         { title: 'Employees',               subtitle: 'Staff management & attendance' },
  finance:           { title: 'Finance & Payments',      subtitle: 'Payment processing & leaf rates' },
  reports:           { title: 'Reports & Analytics',     subtitle: 'Generate, filter & export reports' },
  supplier_profile:  { title: 'My Supplier Profile',     subtitle: 'Estate membership, contact details & banking' },
  supplier_payments: { title: 'My Payment History',      subtitle: 'Verified leaf supply vouchers & settlement status' },
  settings:          { title: 'Settings',                subtitle: 'System configuration' },
  admin:             { title: 'Administration',          subtitle: 'Manage users, suppliers, schedules & system' },
};

const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Batch BT-2026-112 Completed',  body: 'Production batch moved to Grading stage.', time: '5m ago',  read: false },
  { id: 2, type: 'warning', title: 'Low Inventory Alert',          body: 'BOPF Grade stock below threshold (120 kg).', time: '18m ago', read: false },
  { id: 3, type: 'info',    title: 'New Supplier Payment Pending',  body: 'Supplier S-041 payment Rs. 24,500 awaiting approval.', time: '1h ago',  read: false },
  { id: 4, type: 'success', title: 'Daily Leaf Collection Done',    body: '3,840 kg collected from 12 routes today.', time: '2h ago',  read: true  },
  { id: 5, type: 'info',    title: 'System Backup Completed',       body: 'Automated backup finished successfully.', time: '5h ago',  read: true  },
];

const typeIcon = { success: CheckCircle, warning: AlertCircle, info: Info };
const typeColor = { success: '#10b981', warning: '#f59e0b', info: '#3b82f6' };

export default function TopHeader({ currentPage, user, theme, onToggleTheme }) {
  const page = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [showNotif, setShowNotif]   = useState(false);
  const [notifs, setNotifs]         = useState(SAMPLE_NOTIFICATIONS);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const dismiss     = (id) => setNotifs(notifs.filter(n => n.id !== id));

  return (
    <header className="top-header">
      <div className="header-page-title">
        <h1>{page.title}</h1>
        <p>{page.subtitle} &nbsp;·&nbsp; {dateStr} &nbsp;·&nbsp; {timeStr}</p>
      </div>

      <div className="header-actions">
        {/* Theme Toggle */}
        <button
          className="header-icon-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', width: 'auto' }}
        >
          {theme === 'light' ? (
            <><Moon size={16} style={{ color: '#475569' }} /><span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Dark</span></>
          ) : (
            <><Sun size={16} style={{ color: '#fbbf24' }} /><span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Light</span></>
          )}
        </button>

        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            title="Notifications"
            onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>{unread}</span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotif && (
            <>
              {/* Click-outside overlay */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                onClick={() => setShowNotif(false)}
              />
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: 340, zIndex: 999,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'var(--table-header-bg)',
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    Notifications {unread > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>{unread}</span>}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      No notifications
                    </div>
                  ) : notifs.map(n => {
                    const Icon = typeIcon[n.type] || Info;
                    return (
                      <div key={n.id} style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        background: n.read ? 'transparent' : 'rgba(16,185,129,0.04)',
                        transition: 'background 0.2s',
                        cursor: 'default',
                      }}>
                        <div style={{ marginTop: 2, flexShrink: 0 }}>
                          <Icon size={16} color={typeColor[n.type]} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
                        </div>
                        <button onClick={() => dismiss(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', alignSelf: 'flex-start', flexShrink: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>TeaSyncPro Live Alerts</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button className="header-icon-btn" title="Refresh" onClick={() => window.location.reload()}>
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  );
}
