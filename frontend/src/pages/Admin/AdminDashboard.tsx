import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiCall } from '../../api/axios';
import { AppointmentIcon, DepartmentIcon, DoctorIcon, MedicalRecordIcon, PatientsIcon, UsersIcon } from '@/api/icons';

interface Stats {
  doctors: number;
  patients: number;
  departments: number;
  appointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ doctors: 0, patients: 0, departments: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall<any>('GET', '/doctor/all'),
      apiCall<any>('GET', '/patients/all'),
      apiCall<any>('GET', '/departments/all'),
      apiCall<any>('GET', '/appointments/all'),
    ]).then(([doctors, patients, departments, appointments]) => {
      console.log(patients);
      setStats({
        doctors:      (doctors?.doctors      || doctors?.data      || []).length,
        patients:     (patients?.patient     || patients?.data     || []).length,
        departments:  (departments?.departments || departments?.data || []).length,
        appointments: (appointments?.appointments || appointments?.data || []).length,
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Doctors',      value: stats.doctors,      icon: <DoctorIcon size={30} color="#e51009"/>, color: 'blue',    sub: 'Registered doctors' },
    { label: 'Total Patients',     value: stats.patients,     icon: <PatientsIcon size={30} color="#2563eb"/>, color: 'teal',    sub: 'Active patients' },
    { label: 'Departments',        value: stats.departments,  icon: <DepartmentIcon size={30} color="#8d17c9"/>, color: 'emerald', sub: 'Medical departments' },
    { label: 'Appointments',       value: stats.appointments, icon: <AppointmentIcon size={30} color="#c3da87"/>, color: 'amber',   sub: 'Total appointments' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, here's what's happening today">
      {/* Stats */}
      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-top">
              <span className="stat-label">{card.label}</span>
              <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            </div>
            <div className="stat-value">{loading ? '—' : card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Nav Cards */}
      <div className="section-header">
        <div>
          <h2>Quick Access</h2>
          <p>Jump to any section</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: <DoctorIcon size={30} color="#e51009"/>, title: 'Manage Doctors',      desc: 'View, edit and remove doctors',      link: '/admin/doctors',      color: 'var(--accent)' },
          { icon: <PatientsIcon size={30} color="#2563eb"/>, title: 'Manage Patients',     desc: 'View and manage patient records',    link: '/admin/patients',     color: 'var(--teal)' },
          { icon: <DepartmentIcon size={30} color="#8d17c9"/>, title: 'Departments',           desc: 'Add and manage departments',          link: '/admin/departments',  color: 'var(--emerald)' },
          { icon: <AppointmentIcon size={30} color="#c3da87"/>, title: 'Appointments',          desc: 'View all scheduled appointments',     link: '/admin/appointments', color: 'var(--amber)' },
          { icon: <MedicalRecordIcon size={30} color="#2fd851"/>, title: 'Medical Records',       desc: 'Browse all medical records',          link: '/admin/records', color: 'var(--rose)' },
          { icon: <UsersIcon size={30}/>, title: 'All Users',             desc: 'View all registered users',           link: '/admin/users',      color: '#a78bfa' },
        ].map(item => (
          <div
            key={item.title}
            className="table-card"
            style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
            onClick={() => window.location.href = item.link}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = item.color;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{item.icon}</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{item.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}