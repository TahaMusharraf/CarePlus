import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../HMS.css';
import { AppointmentIcon, CarePlusIcon, DashboardIcon, HMSIcon, LogoutIcon, MedicalRecordIcon, PlusIcon, SearchIcon, UsersIcon } from '@/api/icons';

interface Props { children: React.ReactNode; title: string; subtitle?: string; }

const navItems = [
  { icon: <DashboardIcon/>, label: 'Dashboard',        path: '/patient/dashboard' },
  { icon: <AppointmentIcon/>, label: 'My Appointments',  path: '/patient/appointments' },
  { icon: <PlusIcon/>, label: 'Book Appointment', path: '/patient/book' },
  { icon: <MedicalRecordIcon/>, label: 'Medical Records',  path: '/patient/records' },
  { icon: <UsersIcon/>, label: 'My Profile',       path: '/patient/profile' },
];

export default function PatientLayout({ children, title, subtitle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRaw  = localStorage.getItem('user');
  const user     = userRaw ? JSON.parse(userRaw) : { name: 'Patient', email: '' };
  const initials = user.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/patient/profile')
  }

  return (
    <div className="patient-layout">
      <aside className="layout-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><HMSIcon/></div>
          <div className="sidebar-logo-text">
            <h2>CarePlus</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">My Panel</div>
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleProfile}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <h4>{user.name}</h4>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <div className="header-left">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="header-right">
            <div className="header-search">
              <span><SearchIcon/></span>
              <input placeholder="Search..." />
            </div>
            <div className="header-icon-btn" onClick={handleLogout} title="Logout"><LogoutIcon/></div>
          </div>
        </header>

        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}