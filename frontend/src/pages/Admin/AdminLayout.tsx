import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../HMS.css';
import { DashboardIcon, HMSIcon, LogoutIcon, SearchIcon, DoctorIcon, PatientsIcon, DepartmentIcon, AppointmentIcon, UsersIcon, ProfileIcon, MedicalRecordIcon } from '@/api/icons';

interface Props { children: React.ReactNode; title: string; subtitle?: string; }

const navItems = [
  { icon: <DashboardIcon/>, label: 'Dashboard',   path: '/admin/dashboard' },
  { icon: <DoctorIcon />, label: 'Doctors',     path: '/admin/doctors' },
  { icon: <PatientsIcon/>, label: 'Patients',    path: '/admin/patients' },
  { icon: <DepartmentIcon/>, label: 'Departments', path: '/admin/departments' },
  { icon: <AppointmentIcon/>, label: 'Appointments',path: '/admin/appointments' },
  { icon: <MedicalRecordIcon/>, label: 'Medical Records',path: '/admin/records' },
  { icon: <UsersIcon/>, label: 'Users',       path: '/admin/users' },
  { icon: <ProfileIcon/>, label: 'My Profile',       path: '/admin/profile' }
];

export default function AdminLayout({ children, title, subtitle }: Props) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userRaw   = localStorage.getItem('user');
  const user      = userRaw ? JSON.parse(userRaw) : { name: 'Admin', email: 'admin@hms.com' };
  const initials  = user.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/admin/profile')
  }

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="layout-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HMSIcon/>
          </div>
          <div className="sidebar-logo-text">
            <h2>CarePlus</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
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

      {/* ── Main ── */}
      <div className="layout-main">
        <header className="layout-header">
          <div className="header-left">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="header-right">
            <div className="header-search">
              <span>
                <SearchIcon/>
              </span>
              <input placeholder="Search anything..." />
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