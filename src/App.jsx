import React, { useState, useEffect } from 'react';
import './index.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './pages/Dashboard';
import ReportsPage from './pages/ReportsPage';
import CollectionPage from './pages/CollectionPage';
import ProductionPage from './pages/ProductionPage';
import GradingPage from './pages/GradingPage';
import InventoryPage from './pages/InventoryPage';
import PlaceholderPage from './pages/PlaceholderPage';
import WitheringPage from './pages/WitheringPage';
import RollingPage from './pages/RollingPage';
import AerationPage from './pages/AerationPage';
import DryingPage from './pages/DryingPage';
import SupplierProfilePage from './pages/SupplierProfilePage';
import SupplierPaymentsPage from './pages/SupplierPaymentsPage';
import PackagingPage from './pages/PackagingPage';
import FinancePage from './pages/FinancePage';
import AdminPage from './pages/AdminPage';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { ROLES } from './data/mockData';
import { api } from './services/api';

const PAGE_ROLES = {
  dashboard: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.INVENTORY_OFFICER],
  aeration: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.AERATION_OFFICER],
  rolling: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.ROLLING_OFFICER, ROLES.AERATION_OFFICER],
  withering: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.WITHERING_OFFICER, ROLES.ROLLING_OFFICER],
  drying: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.DRYING_OFFICER],
  collection: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.COLLECTION_OFFICER, ROLES.SUPPLIER, ROLES.INVENTORY_OFFICER],
  production: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.WITHERING_OFFICER, ROLES.ROLLING_OFFICER, ROLES.AERATION_OFFICER, ROLES.DRYING_OFFICER, ROLES.INVENTORY_OFFICER],
  grading: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.GRADING_OFFICER, ROLES.PACKAGING_OFFICER, ROLES.INVENTORY_OFFICER],
  packaging: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.PACKAGING_OFFICER],
  inventory: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.INVENTORY_OFFICER],
  suppliers: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER, ROLES.COLLECTION_OFFICER],
  employees: [ROLES.ADMIN, ROLES.FACTORY_MANAGER],
  finance: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER],
  reports: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER, ROLES.GRADING_OFFICER],
  admin: [ROLES.ADMIN],
  settings: [ROLES.ADMIN],
  supplier_profile: [ROLES.SUPPLIER],
  supplier_payments: [ROLES.SUPPLIER],
};

function App() {
  // view controls which screen is shown: 'landing' | 'login' | 'register' | 'app'
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('teasync_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('teasync_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // set landing page based on assigned user role
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    const roleDefaults = {
      [ROLES.ADMIN]: 'dashboard',
      [ROLES.FACTORY_MANAGER]: 'dashboard',
      [ROLES.WITHERING_OFFICER]: 'withering',
      [ROLES.ROLLING_OFFICER]: 'rolling',
      [ROLES.AERATION_OFFICER]: 'aeration',
      [ROLES.DRYING_OFFICER]: 'drying',
      [ROLES.GRADING_OFFICER]: 'grading',
      [ROLES.PACKAGING_OFFICER]: 'packaging',
      [ROLES.INVENTORY_OFFICER]: 'inventory',
      [ROLES.FINANCE_OFFICER]: 'finance',
      [ROLES.COLLECTION_OFFICER]: 'collection',
      [ROLES.SUPPLIER]: 'collection',
    };
    setCurrentPage(roleDefaults[loggedInUser.role] || 'dashboard');
    setView('app');
  };

  // clear session - go back to landing page
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentPage('dashboard');
    setView('landing');
  };

  // show landing page first
  if (view === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={() => setView('login')} theme={theme} onToggleTheme={toggleTheme} />
        <FloatingWhatsApp />
      </>
    );
  }

  // show login page after Get Started clicked
  if (view === 'login') {
    return (
      <>
        <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} theme={theme} onToggleTheme={toggleTheme} onRegister={() => setView('register')} />
        <FloatingWhatsApp />
      </>
    );
  }
  if (view === 'register') {
    return (
      <>
        <RegisterPage onBack={() => setView('login')} />
        <FloatingWhatsApp />
      </>
    );
  }

  // render view based on active tab with RBAC guard
  const renderPage = () => {
    const allowed = PAGE_ROLES[currentPage];
    if (allowed && user?.role && !allowed.includes(user.role)) {
      return (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <h3 style={{ color: 'var(--red-400)', marginBottom: 8 }}>403 — Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your role ({user.role}) does not have permission to access this module.
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <ReportsPage />;
      case 'collection':
        return <CollectionPage user={user} />;
      case 'withering':
        return <WitheringPage user={user} onNavigate={setCurrentPage} />;
      case 'rolling':
        return <RollingPage user={user} onNavigate={setCurrentPage} />;
      case 'aeration':
        return <AerationPage user={user} onNavigate={setCurrentPage} />;
      case 'drying':
        return <DryingPage user={user} onNavigate={setCurrentPage} />;
      case 'supplier_profile':
        return <SupplierProfilePage user={user} onLogout={handleLogout} />;
      case 'supplier_payments':
        return <SupplierPaymentsPage user={user} />;
      case 'production':
        return <ProductionPage />;
      case 'grading':
        return <GradingPage />;
      case 'packaging':
        return <PackagingPage user={user} onNavigate={setCurrentPage} />;
      case 'inventory':
        return <InventoryPage />;
      case 'admin':
        return <AdminPage user={user} initialTab="users" onNavigate={setCurrentPage} />;
      case 'suppliers':
        return <AdminPage user={user} initialTab="suppliers" onNavigate={setCurrentPage} />;
      case 'employees':
        return <AdminPage user={user} initialTab="employees" onNavigate={setCurrentPage} />;
      case 'finance':
        return <FinancePage user={user} onNavigate={setCurrentPage} />;
      case 'settings':
        return <AdminPage user={user} initialTab="settings" onNavigate={setCurrentPage} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* sidebar navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-area">
        {/* top navigation bar */}
        <TopHeader
          currentPage={currentPage}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={setCurrentPage}
        />
        {/* page content container */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
      <FloatingWhatsApp />
    </div>
  );
}

export default App;
