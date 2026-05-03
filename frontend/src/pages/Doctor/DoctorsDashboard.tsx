import React, { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { apiCall } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { AppointmentIcon, MedicalRecordIcon, PatientsIcon, ViewIcon } from '@/api/icons';

export default function DoctorDashboard() {
  const navigate  = useNavigate();
  const userRaw   = localStorage.getItem('user');
  const user      = userRaw ? JSON.parse(userRaw) : null;

  const [stats, setStats]       = useState({ appointments: 0, patients: 0, records: 0, pending: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    apiCall<any>('GET', `/doctor/get/${user.id}`)
      .then(async (docRes) => {
        const profileData = docRes?.doctor || docRes?.data ;
        const doctorId = profileData?.id;
        console.log(profileData)
        setProfile(profileData);

        const appts = await apiCall<any>('GET', `/appointments/doctor/${doctorId}`);

        const apptList   = Array.isArray(appts) ? appts : appts?.appointments || appts?.data || [];
        console.log("APP:",apptList);
        const records = await apiCall<any>('GET', `/medical-records/doctor/${doctorId}`);
        const recordList = records?.medicalRecords || records?.data  || [];

        const pending    = apptList.filter((a: any) => a.status?.toLowerCase() === 'scheduled').length;
        const patientIds = [...new Set(apptList.map((a: any) => a.patientId))];

        setStats({
          appointments: apptList.length,
          patients:     patientIds.length,
          records:      recordList.length,
          pending,
        });

        setUpcoming(apptList.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge: Record<string, string> = {
    scheduled: 'badge-blue',
    completed:  'badge-emerald',
    cancelled:  'badge-rose',
  };

  const cards = [
    { label: 'Total Appointments', value: stats.appointments, icon: <AppointmentIcon size={30} color="#c3da87"/>, color: 'blue',    sub: 'All time' },
    { label: 'Unique Patients',    value: stats.patients,     icon: <PatientsIcon size={30} color="#2563eb"/>, color: 'teal',    sub: 'Distinct patients' },
    { label: 'Medical Records',    value: stats.records,      icon: <MedicalRecordIcon size={30} color="#2fd851"/>, color: 'emerald', sub: 'Created records' },
    { label: 'Pending Appts',      value: stats.pending,      icon: <AppointmentIcon size={30} color="#c3da87"/>, color: 'amber',   sub: 'Scheduled' },
  ];

  return (
    <DoctorLayout title="Dashboard" subtitle={`Welcome back, Dr. ${user?.name || ''}`}>

      {/* Profile Banner */}
      {profile && (
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700 }}>
              Dr. {user?.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: 2 }}>
              {profile.specialization} &nbsp;·&nbsp; {profile.deptName || 'CarePlus Hospital'}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => navigate('/doctor/profile')}
          >
            <ViewIcon/>View Profile 
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
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

      {/* Upcoming Appointments */}
      <div className="section-header">
        <div><h2>Recent Appointments</h2><p>Your latest 5 appointments</p></div>
        <button className="btn btn-ghost" onClick={() => navigate('/doctor/appointments')}>
          View All →
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={4}>Loading...</td></tr>
            ) : upcoming.length === 0 ? (
              <tr><td colSpan={4}>
                <div className="empty-state">
                  <div className="empty-icon"><AppointmentIcon size={30} color="#c3da87"/></div>
                  <h3>No appointments yet</h3>
                </div>
              </td></tr>
            ) : upcoming.map(a => (
              <tr key={a.appointmentId}>
                <td><span className="td-primary">{a.patientName || `Patient #${a.patientId}`}</span></td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{a.appointmentDateTime}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.reason || '—'}
                </td>
                <td>
                  <span className={`badge ${statusBadge[a.status?.toLowerCase()] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Access */}
      <div className="section-header" style={{ marginTop: 28 }}>
        <div><h2>Quick Access</h2></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: <AppointmentIcon size={30} color="#c3da87"/>, title: 'My Appointments', desc: 'View all your appointments',    link: '/doctor/appointments', color: 'var(--accent)' },
          { icon: <PatientsIcon size={30} color="#2563eb"/>, title: 'My Patients',     desc: 'View your patient list',       link: '/doctor/patients',     color: 'var(--teal)' },
          { icon: <MedicalRecordIcon size={30} color="#2fd851"/>, title: 'Medical Records', desc: 'Manage your medical records',   link: '/doctor/records',      color: 'var(--emerald)' },
        ].map(item => (
          <div
            key={item.title}
            className="table-card"
            style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
            onClick={() => navigate(item.link)}
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
            <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{item.desc}</p>
          </div>
        ))}
      </div>

    </DoctorLayout>
  );
}