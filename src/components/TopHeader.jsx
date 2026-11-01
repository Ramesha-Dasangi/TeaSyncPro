import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';

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
  settings: { title: 'Settings', subtitle: 'System configuration' },
};

export default function TopHeader({ currentPage, user }) {
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
