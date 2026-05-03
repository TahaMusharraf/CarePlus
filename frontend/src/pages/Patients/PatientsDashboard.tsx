import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientsLayout';
import { apiCall } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { AppointmentIcon, MedicalRecordIcon, PlusIcon, ViewIcon } from '@/api/icons';

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [stats, setStats]       = useState({ appointments: 0, records: 0, pending: 0, completed: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const user    = userRaw ? JSON.parse(userRaw) : null;
    if (!user?.id) return;

    apiCall<any>('GET', `/patients/get/${Number(user.id)}`)
      .then(async (res) => {
        const pat = res?.patient || res?.data || res;
        setProfile(pat);
        const patientId = pat?.patientId || pat?.id;

        const appts = await apiCall<any>('GET', `/appointments/patient/${patientId}`);
        const apptList = Array.isArray(appts) ? appts : appts?.appointments || appts?.data || [];

        let recordList: any[] = [];
        try {
          const records = await apiCall<any>('GET', `/medical-records/patient/${patientId}`);
          recordList = records?.medicalRecords || records?.data || [];
        } catch { /* no records */ }

        const pending   = apptList.filter((a: any) => a.status?.toLowerCase() === 'scheduled').length;
        const completed = apptList.filter((a: any) => a.status?.toLowerCase() === 'completed').length;

        setStats({
          appointments: apptList.length,
          records:      recordList.length,
          pending,
          completed,
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
    { label: 'Total Appointments', value: stats.appointments, icon: <AppointmentIcon size={30} />, color: 'blue',    sub: 'All time' },
    { label: 'Scheduled',          value: stats.pending,      icon: <AppointmentIcon size={30} />, color: 'amber',   sub: 'Upcoming' },
    { label: 'Completed',          value: stats.completed,    icon: <AppointmentIcon size={30} />, color: 'emerald', sub: 'Done' },
    { label: 'Medical Records',    value: stats.records,      icon: <MedicalRecordIcon size={30} />, color: 'teal',    sub: 'Your records' },
  ];

  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  return (
    <PatientLayout title="Dashboard" subtitle={`Welcome, ${user?.name || ''}`}>

      {/* Profile Banner */}
      {profile && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px',
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal), var(--emerald))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', color: 'black', fontWeight: 700 }}>
              {user?.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: 2 }}>
              {profile.bloodGroup && <span>{profile.bloodGroup} &nbsp;·&nbsp;</span>}
              {profile.gender && profile.gender === 'M' && <span>Male</span>}
              {profile.gender && profile.gender === 'F' && <span>Female</span>}
              &nbsp;·&nbsp; CarePlus Patient
            </p>
          </div>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate('/patient/profile')}>
           <ViewIcon/> View Profile
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

      {/* Recent Appointments */}
      <div className="section-header">
        <div><h2>Recent Appointments</h2><p>Your latest appointments</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => navigate('/patient/book')}><PlusIcon/>Book New</button>
          <button className="btn btn-ghost" onClick={() => navigate('/patient/appointments')}><ViewIcon/>View All</button>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
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
                  <div className="empty-icon">📅</div>
                  <h3>No appointments yet</h3>
                  <p>Book your first appointment</p>
                </div>
              </td></tr>
            ) : upcoming.map(a => (
              <tr key={a.appointmentId}>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{a.doctorName?.charAt(0).toUpperCase() || '?'}</div>
                    <span className="td-primary">{a.doctorName || `Doctor #${a.doctorId}`}</span>
                  </div>
                </td>
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
          { icon: <PlusIcon size={30}/>, title: 'Book Appointment', desc: 'Schedule a new appointment',     link: '/patient/book',         color: 'var(--accent)' },
          { icon: <AppointmentIcon size={30} />, title: 'My Appointments',  desc: 'View all your appointments',    link: '/patient/appointments', color: 'var(--teal)' },
          { icon: <MedicalRecordIcon size={30} />, title: 'Medical Records',  desc: 'View your medical history',     link: '/patient/records',      color: 'var(--emerald)' },
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

    </PatientLayout>
  );
}