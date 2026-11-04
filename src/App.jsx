import React, { useState } from 'react';
import './index.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './pages/Dashboard';
import ReportsPage from './pages/ReportsPage';
import CollectionPage from './pages/CollectionPage';
import ProductionPage from './pages/ProductionPage';
import GradingPage from './pages/GradingPage';
import InventoryPage from './pages/InventoryPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { ROLES } from './data/mockData';

function App() {
  // view controls which screen is shown: 'landing' | 'login' | 'app'
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // set landing page based on assigned user role
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    const roleDefaults = {
      [ROLES.ADMIN]: 'dashboard',
      [ROLES.FACTORY_MANAGER]: 'dashboard',
      [ROLES.WITHERING_OFFICER]: 'production',
      [ROLES.ROLLING_OFFICER]: 'production',
      [ROLES.AERATION_OFFICER]: 'production',
      [ROLES.DRYING_OFFICER]: 'production',
      [ROLES.GRADING_OFFICER]: 'grading',
      [ROLES.PACKAGING_OFFICER]: 'grading',
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
    setUser(null);
    setCurrentPage('dashboard');
    setView('landing');
  };

  // show landing page first
  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} />;
  }

  // show login page after Get Started clicked
  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  // render view based on active tab
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <ReportsPage />;
      case 'collection':
        return <CollectionPage />;
      case 'production':
        return <ProductionPage />;
      case 'grading':
        return <GradingPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'suppliers':
        return <PlaceholderPage title="Supplier Management" description="Supplier profiles, registration, and leaf supply records." />;
      case 'employees':
        return <PlaceholderPage title="Employee Management" description="Factory workforce, shift allocations, and attendance records." />;
      case 'finance':
        return <PlaceholderPage title="Finance & Payments" description="Supplier payments, daily leaf rate adjustments, and accounts." />;
      case 'settings':
        return <PlaceholderPage title="System Settings" description="Factory configuration, estate details, and account preferences." />;
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
        <TopHeader currentPage={currentPage} user={user} />
        {/* page content container */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
