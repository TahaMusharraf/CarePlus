import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientsLayout';
import { apiCall } from '../../api/axios';
import { EditIcon } from '@/api/icons';

// Sirf yahi 3 fields editable hain
const EDITABLE: Record<string, boolean> = {
  address:     true,
  blood_group: true,
  gender:      true,
};

export default function PatientProfile() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', address: '', blood_group: '', gender: '', phone: '', dob: '' });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiCall<any>('GET', `/patients/get/${Number(user.id)}`)
      .then(res => {
        const data = res?.patient || res?.data || res;
        setProfile(data);
        // Form mein sirf editable fields set karo
        setForm({
          name:        data?.name || '',
          email:       data.email || '',
          address:     data?.address     || '',
          blood_group: data?.bloodGroup  || data?.blood_group || '',
          gender:      data?.gender      || '',
          phone:       data?.phone || '',
          dob:         data?.dob
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save: sirf editable fields payload mein jayein ──
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const patientId = profile?.patientId || profile?.id;
      const payload = {
        address:     form.address,
        blood_group: form.blood_group,
        gender:      form.gender,
      };
      await apiCall('PATCH', `/patients/update/${patientId}`, payload);
      setProfile({
        name:        form.name,
        email:       form.email,
        address:     form.address,
        blood_group: form.blood_group,
        gender:      form.gender,
        phone:       form.phone,
        dob:         form.dob
      });
      setToast({ msg: 'Profile updated successfully', type: 'success' });
      setEditing(false);
    } catch {
      setToast({ msg: 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const bloodBadge: Record<string, string> = {
    'A+': 'badge-blue',    'A-': 'badge-blue',
    'B+': 'badge-teal',    'B-': 'badge-teal',
    'O+': 'badge-emerald', 'O-': 'badge-emerald',
    'AB+': 'badge-amber',  'AB-': 'badge-amber',
  };

  // ── Info rows: field key sirf editable wali fields pe ──
  const infoRows = profile ? [
    { label: 'Full Name',     value: user?.name,    field: 'mame' },
    { label: 'Email',         value: user?.email,   field: 'email' },
    { label: 'Phone',         value: profile.phone, field: 'phone' },
    { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString('en-PK') : '—', field: 'dob' },
    { label: 'Gender',        value: profile.gender,                              field: 'gender' },
    { label: 'Blood Group',   value: profile.bloodGroup || profile.blood_group,   field: 'blood_group' },
    { label: 'Address',       value: profile.address,                             field: 'address' },
  ] : [];

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 6, padding: '5px 10px', color: 'var(--text)',
    fontSize: '0.85rem', outline: 'none', width: 200,
    fontFamily: 'DM Sans, sans-serif',
  };

  const renderEditField = (field: string) => {
    if (field === 'gender') return (
      <select
        value={form.gender}
        onChange={e => setForm({ ...form, gender: e.target.value })}
        style={inputStyle}
      >
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    );

    if (field === 'blood_group') return (
      <select
        value={form.blood_group}
        onChange={e => setForm({ ...form, blood_group: e.target.value })}
        style={inputStyle}
      >
        {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
          <option key={bg} value={bg}>{bg}</option>
        ))}
      </select>
    );

    // address
    return (
      <input
        value={form[field as keyof typeof form]}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        style={inputStyle}
      />
    );
  };

  return (
    <PatientLayout title="My Profile" subtitle="View and update your details">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* ── Avatar Card ── */}
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            {user?.name}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 4 }}>
            {user?.email}
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <span className="badge badge-teal">Patient</span>
            {(profile?.bloodGroup || profile?.blood_group) && (
              <span className={`badge ${bloodBadge[profile.bloodGroup || profile.blood_group] || 'badge-slate'}`}>
                {profile.bloodGroup || profile.blood_group}
              </span>
            )}
          </div>
        </div>

        {/* ── Info Card ── */}
        <div className="table-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              Profile Information
            </h3>
            {!editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <EditIcon size={15}/> Edit
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Loading profile...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {infoRows.map(row => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 600,
                    color: 'var(--text3)', letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {row.label}
                  </span>

                  {/* Editing mode: sirf editable fields ka input dikhao */}
                  {editing && row.field ? (
                    renderEditField(row.field)
                  ) : (
                    <span style={{ fontSize: '0.88rem', color: 'var(--text)', textTransform: 'capitalize' }}>
                      {row.value || '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {editing && (
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        </div>
      )}
    </PatientLayout>
  );
}