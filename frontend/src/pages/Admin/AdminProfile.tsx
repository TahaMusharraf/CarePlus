import React, { useEffect, useState } from 'react';
import { apiCall } from '../../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminProfile() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiCall<any>('GET', `/users/get/${Number(user.id)}`)
      .then(res => {
        console.log(res.user)
        const data = res?.user;
        console.log("DATA:",data)
        setProfile(data);
        console.log(profile)
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  console.log(profile)
  const infoRows = profile ? [
    { label: 'Full Name',      value: user?.name,       field: null },
    { label: 'Email',          value: user?.email,      field: null },
    { label: 'Date of Birth',  value: profile.dob ? new Date(profile.dob).toLocaleDateString('en-PK') : '—', field: null },
    { label: 'Phone',          value: profile.phone,    field: null },
  ] : [];

  return (
    <AdminLayout title="My Profile" subtitle="View and update your details">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Avatar Card */}
        <div className="table-card" style={{ padding: 28, marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal), var(--emerald))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 700, color: 'white',
            margin: '0 auto 14px',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'black' }}>
            {user?.name}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 4 }}>
            {user?.email}
          </p>
          {user?.role && user?.role === 'admin' &&  <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <span className="badge badge-teal">Admin</span>
          </div>}
        </div>

        {/* Info Card */}
        <div className="table-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--white)' }}>
              Profile Information
            </h3>
            
          </div>

          {loading ? (
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Loading profile...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {infoRows.map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {row.label}
                  </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                        {row.value || '—'}
                      </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>
        </div>
      )}
    </AdminLayout>
  );
}