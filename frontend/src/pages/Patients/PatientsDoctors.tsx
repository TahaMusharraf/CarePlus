import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientsLayout';
import { Toast } from '../Admin/AdminHelper';
import { apiCall } from '../../api/axios';
import { PlusIcon, SearchIcon } from '@/api/icons';

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization: string;
  deptName: string;
  phone: string;
}

export default function PatientDoctors() {
  const [doctors, setDoctors]   = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [bookModal, setBookModal] = useState<Doctor | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ appointmentDate: '', appointmentTime: '', reason: '' });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Patient ID fetch karo
    const userRaw = localStorage.getItem('user');
    const user    = userRaw ? JSON.parse(userRaw) : null;
    if (!user?.id) return;
    
    apiCall<any>('GET', `/patients/get/${Number(user.id)}`)
      .then(res => {
        const pat = res?.patient || res?.data || res;
        setPatientId(pat?.patientId || pat?.id);
      })
      .catch(console.error);

    // Doctors fetch karo
    setLoading(true);
    apiCall<any>('GET', '/doctor/all')
      .then(res => {
        const data = res?.doctors || res?.data || res || [];
        console.log(data)
        setDoctors(Array.isArray(data) ? data : []);
        setFiltered(Array.isArray(data) ? data : []);
      })
      .catch(() => setToast({ msg: 'Failed to load doctors', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.deptName?.toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  const handleBook = async () => {
    if (!bookModal || !patientId) return;
    setSaving(true);
    try {
      await apiCall('POST', '/appointments/create', {
        patientId,
        doctorId:        bookModal.id,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason:          form.reason,
        status:          'scheduled',
      });
      setToast({ msg: `Appointment booked with Dr. ${bookModal.name}!`, type: 'success' });
      setBookModal(null);
      setForm({ appointmentDate: '', appointmentTime: '', reason: '' });
    } catch (err: any) {
      setToast({ msg: err?.message || 'Booking failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <PatientLayout title="Book Appointment Of Any Doctor" subtitle={`${doctors.length} doctors available`}>

      <div className="section-header">
        <div><h2>All Doctors</h2><p>Browse and book appointments with our doctors</p></div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search by name, specialization..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={5}>Loading doctors...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-icon">👨‍⚕️</div>
                  <h3>No doctors found</h3>
                  <p>Try a different search term</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(d.name)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>Dr. {d.name}</div>
                      <div className="td-secondary">{d.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-blue">{d.specialization || '—'}</span></td>
                <td><span className="badge badge-teal">{d.deptName || '—'}</span></td>
                <td>{d.phone || '—'}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setBookModal(d); setForm({ appointmentDate: '', appointmentTime: '', reason: '' }); }}
                  >
                    <PlusIcon size={15}/> Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {doctors.length} doctors</span>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {bookModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Book Appointment</h3>
              <button className="modal-close" onClick={() => setBookModal(null)}>✕</button>
            </div>

            {/* Doctor Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div className="td-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{initials(bookModal.name)}</div>
              <div>
                <div className="td-primary">Dr. {bookModal.name}</div>
                <div className="td-secondary">{bookModal.specialization} {bookModal.deptName ? `· ${bookModal.deptName}` : ''}</div>
              </div>
            </div>

            <div className="modal-form">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    min={today}
                    value={form.appointmentDate}
                    onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={form.appointmentTime}
                    onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <input
                  placeholder="e.g. Fever, Checkup, Follow-up..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setBookModal(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleBook}
                  disabled={saving || !form.appointmentDate || !form.appointmentTime || !form.reason}
                >
                  {saving ? 'Booking...' : '📅 Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

    </PatientLayout>
  );
}