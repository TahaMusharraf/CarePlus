import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AppLayout.css';

export interface NavItem {
  section?: string;
  label?:   string;
  path?:    string;
  icon?:    string;
}

interface AppLayoutProps {
  children:    React.ReactNode;
  title:       string;
  subtitle?:   string;
  navItems:    NavItem[];
  logoLabel:   string;
  logoSub:     string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children, title, subtitle, navItems, logoLabel, logoSub,
}) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div className="sidebar-logo-text">
            <h2>{logoLabel}</h2>
            <span>{logoSub}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section-label">{item.section}</div>;
            const active = location.pathname === item.path;
            return (
              <button key={item.path} className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path!)}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
          <div className="user-info">
            <p>{user.name ?? 'User'}</p>
            <span>{user.role ?? 'user'}</span>
          </div>
        </div>

        <div className="sidebar-toggle">
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="topbar-right">
            <button className="btn-logout" onClick={handleLogout}>⎋ Logout</button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;