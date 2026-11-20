import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, LogOut, Leaf, Factory,
  ClipboardList, Truck, Users, Settings, DollarSign, Package, ShieldCheck, Box
} from 'lucide-react';
import { ROLES } from '../data/mockData';

const getNavItems = (role) => {
  const allItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.INVENTORY_OFFICER] },
    { key: 'collection', label: 'Leaf Collection', icon: Leaf, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.COLLECTION_OFFICER, ROLES.SUPPLIER] },
    { key: 'production', label: 'Production Batches', icon: Factory, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.WITHERING_OFFICER, ROLES.ROLLING_OFFICER, ROLES.AERATION_OFFICER, ROLES.DRYING_OFFICER] },
    { key: 'grading', label: 'Grading & Packaging', icon: Package, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.GRADING_OFFICER, ROLES.PACKAGING_OFFICER, ROLES.INVENTORY_OFFICER] },
    { key: 'packaging', label: 'Packaging Records', icon: Box, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.PACKAGING_OFFICER] },
    { key: 'inventory', label: 'Inventory', icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.INVENTORY_OFFICER] },
    { key: 'suppliers', label: 'Suppliers', icon: Truck, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER, ROLES.COLLECTION_OFFICER] },
    { key: 'employees', label: 'Employees', icon: Users, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER] },
    { key: 'finance', label: 'Finance & Payments', icon: DollarSign, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER] },
    { key: 'reports', label: 'Reports', icon: FileText, roles: [ROLES.ADMIN, ROLES.FACTORY_MANAGER, ROLES.FINANCE_OFFICER, ROLES.GRADING_OFFICER] },
    { key: 'settings', label: 'Settings', icon: Settings, roles: [ROLES.ADMIN] },
  ];
  return allItems.filter(item => item.roles.includes(role));
};

export default function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const navItems = getNavItems(user.role);
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">
            <Leaf size={22} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>TeaSync Pro</h2>
            <span>Estate Management System</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="flex items-center gap-3">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <div
            key={item.key}
            className={`sidebar-nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <item.icon size={17} />
            {item.label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
