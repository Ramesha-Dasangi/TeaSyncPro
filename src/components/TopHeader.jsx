import React, { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, Sun, Moon, X, CheckCircle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { api } from '../services/api';
import { PRODUCTION_BATCHES, SUPPLIER_PAYMENTS, TEA_COLLECTIONS } from '../data/mockData';

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

const typeIcon = { success: CheckCircle, warning: AlertCircle, info: Info };
const typeColor = { success: '#10b981', warning: '#f59e0b', info: '#3b82f6' };

function getNotifStorageKey(user) {
  const identity = user?.user_id || user?.username || 'guest';
  return `teasync_notif_state_${identity}`;
}

function loadNotifPrefs(user) {
  try {
    const raw = localStorage.getItem(getNotifStorageKey(user));
    if (!raw) return { readIds: [], dismissedIds: [] };
    const parsed = JSON.parse(raw);
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
    };
  } catch {
    return { readIds: [], dismissedIds: [] };
  }
}

function saveNotifPrefs(user, prefs) {
  try {
    localStorage.setItem(getNotifStorageKey(user), JSON.stringify({
      readIds: Array.from(new Set(prefs.readIds)).slice(-200),
      dismissedIds: Array.from(new Set(prefs.dismissedIds)).slice(-200),
    }));
  } catch {
    // ignore storage quota errors
  }
}

function buildOfflineFallbackNotifications(user) {
  const items = [];
  if (user?.role === 'Supplier') {
    const supId = user?.supplier_id || 1;
    SUPPLIER_PAYMENTS.filter(p => p.supplier_id === supId).slice(0, 3).forEach(p => {
      items.push({
        id: `pay-${p.payment_id}-${p.payment_status}`,
        type: p.payment_status === 'Pending' ? 'warning' : 'success',
        title: `${p.payment_status === 'Pending' ? 'Pending Payment' : 'Payment Settled'}: ${p.invoice_no}`,
        body: `Rs. ${Number(p.net_payable || 0).toLocaleString()} (${p.total_leaf_kg} kg leaf).`,
        time: p.pay_date,
        page: 'supplier_payments',
      });
    });
    TEA_COLLECTIONS.filter(c => c.supplier_id === supId).slice(0, 3).forEach(c => {
      items.push({
        id: `col-${c.collection_id}`,
        type: 'info',
        title: `Leaf Intake: ${c.slip_no}`,
        body: `${c.net_weight} kg net leaf received.`,
        time: `${c.date} ${c.time}`,
        page: 'collection',
      });
    });
    return items;
  }

  PRODUCTION_BATCHES.slice(0, 2).forEach(b => {
    items.push({
      id: `batch-${b.batch_id}-${b.batch_status}`,
      type: b.batch_status === 'Completed' ? 'success' : 'info',
      title: `Batch ${b.batch_code} ${b.batch_status}`,
      body: `${b.input_qty} kg green leaf input.`,
      time: b.prod_date,
      page: 'production',
    });
  });
  return items;
}

export default function TopHeader({ currentPage, user, theme, onToggleTheme, onNavigate }) {
  const page = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifSource, setNotifSource] = useState('Live MySQL');

  const applyPrefsAndSet = useCallback((rawList) => {
    const prefs = loadNotifPrefs(user);
    const dismissedSet = new Set(prefs.dismissedIds);
    const readSet = new Set(prefs.readIds);

    const processed = (rawList || [])
      .filter(n => !dismissedSet.has(n.id))
      .map(n => ({ ...n, read: readSet.has(n.id) }));

    setNotifs(processed);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const liveData = await api.getNotifications();
    if (Array.isArray(liveData)) {
      setNotifSource('Live MySQL Alerts');
      applyPrefsAndSet(liveData);
    } else {
      setNotifSource('Local Fallback Alerts');
      applyPrefsAndSet(buildOfflineFallbackNotifications(user));
    }
  }, [user, applyPrefsAndSet]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    const handleDataChanged = () => {
      fetchNotifications();
    };
    window.addEventListener('teasync:data-changed', handleDataChanged);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('teasync:data-changed', handleDataChanged);
    };
  }, [fetchNotifications]);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    const prefs = loadNotifPrefs(user);
    const nextReadIds = Array.from(new Set([...prefs.readIds, ...notifs.map(n => n.id)]));
    saveNotifPrefs(user, { ...prefs, readIds: nextReadIds });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      const prefs = loadNotifPrefs(user);
      const nextReadIds = Array.from(new Set([...prefs.readIds, notif.id]));
      saveNotifPrefs(user, { ...prefs, readIds: nextReadIds });
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.page && onNavigate) {
      onNavigate(notif.page);
      setShowNotif(false);
    }
  };

  const dismiss = (e, id) => {
    e.stopPropagation();
    const prefs = loadNotifPrefs(user);
    saveNotifPrefs(user, {
      readIds: Array.from(new Set([...prefs.readIds, id])),
      dismissedIds: Array.from(new Set([...prefs.dismissedIds, id])),
    });
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const toggleDropdown = () => {
    const nextState = !showNotif;
    setShowNotif(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

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
            onClick={toggleDropdown}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>{unread > 99 ? '99+' : unread}</span>
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
                width: 350, zIndex: 999,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      No active notifications
                    </div>
                  ) : notifs.map(n => {
                    const Icon = typeIcon[n.type] || Info;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          display: 'flex', gap: 12, padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          background: n.read ? 'transparent' : 'rgba(16,185,129,0.06)',
                          transition: 'background 0.2s',
                          cursor: n.page ? 'pointer' : 'default',
                        }}
                      >
                        <div style={{ marginTop: 2, flexShrink: 0 }}>
                          <Icon size={16} color={typeColor[n.type] || '#3b82f6'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />}
                            <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)' }}>{n.title}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
                        </div>
                        <button
                          onClick={(e) => dismiss(e, n.id)}
                          title="Dismiss notification"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', alignSelf: 'flex-start', flexShrink: 0 }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notifSource}</span>
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
