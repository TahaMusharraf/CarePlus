import React, { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { apiCall } from '../../api/axios';
import { EditIcon } from '@/api/icons';

export default function DoctorProfile() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiCall<any>('GET', `/doctor/get/${user.id}`)
      .then(res => {
        const data = res?.doctor || res?.data || res;
        setProfile(data);
        setForm({
          name:  user?.name  || '',
          email: user?.email || '',
          phone: data?.phone || '',
          dob:   data?.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/doctor/update/${profile.id}`, {
        name:  form.name,
        email: form.email,
        phone: form.phone,
        dob:   form.dob,
      });
      setProfile({ ...profile, phone: form.phone, dob: form.dob });
      setToast({ msg: 'Profile updated', type: 'success' });
      setEditing(false);
    } catch {
      setToast({ msg: 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const editableFields: { label: string; key: keyof typeof form; type?: string }[] = [
    { label: 'Full Name',     key: 'name' },
    { label: 'Email',         key: 'email', type: 'email' },
    { label: 'Phone',         key: 'phone', type: 'tel' },
    { label: 'Date of Birth', key: 'dob',   type: 'date' },
  ];

  const infoRows = profile ? [
    { label: 'Full Name',      value: form.name },
    { label: 'Email',          value: form.email },
    { label: 'Specialization', value: profile.specialization },
    { label: 'Department',     value: profile.deptName || '—' },
    { label: 'Phone',          value: form.phone || '—' },
    { label: 'Date of Birth',  value: form.dob ? new Date(form.dob).toLocaleDateString('en-PK') : '—' },
  ] : [];

  return (
    <DoctorLayout title="My Profile" subtitle="View and update your details">

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Avatar Card */}
        <div className="table-card" style={{ padding: 28, marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 700, color: 'white',
            margin: '0 auto 14px',
          }}>
            {form.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Dr. {form.name}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 4 }}>
            {profile?.specialization} &nbsp;·&nbsp; CarePlus HMS
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <span className="badge badge-blue">Doctor</span>
            <span className="badge badge-emerald">Active</span>
          </div>
        </div>

        {/* Info Card */}
        <div className="table-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--white)' }}>
              Profile Information
            </h3>
            {!editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><EditIcon/> Edit</button>
            )}
          </div>

          {loading ? (
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Loading profile...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {infoRows.map(row => {
                const editable = editableFields.find(f => f.label === row.label);
                return (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {row.label}
                    </span>
                    {editing && editable ? (
                      <input
                        type={editable.type || 'text'}
                        value={form[editable.key]}
                        onChange={e => setForm({ ...form, [editable.key]: e.target.value })}
                        style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, padding: '5px 10px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', width: 200, fontFamily: 'DM Sans, sans-serif' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{row.value || '—'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {editing && (
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>
        </div>
      )}
    </DoctorLayout>
  );
}