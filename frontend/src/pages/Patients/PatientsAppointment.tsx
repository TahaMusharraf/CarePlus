import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientsLayout';
import { ConfirmModal, Toast } from '../Admin/AdminHelper';
import { apiCall } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { DeleteIcon, EditIcon, SearchIcon } from '@/api/icons';
import { ssrModuleExportsKey } from 'vite/module-runner';

const statusBadge: Record<string, string> = {
  scheduled: 'badge-blue',
  completed: 'badge-emerald',
  cancelled: 'badge-rose',
  pending:   'badge-amber',
};

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filtered, setFiltered]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Cancel state
  const [confirmId, setConfirmId] = useState<number[] | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // Edit state
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editForm, setEditForm]   = useState({ appointmentDate: '', appointmentTime: '', reason: '' });
  const [saving, setSaving]       = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchAppointments = () => {
    const userRaw = localStorage.getItem('user');
    const user    = userRaw ? JSON.parse(userRaw) : null;
    if (!user?.id) return;
    console.log(user)
    apiCall<any>('GET', `/patients/get/${Number(user.id)}`)
      .then(async res => {
        const pat       = res?.patient || res?.data || res;
        console.log("PAT:",pat)
        const patientId = pat?.patientId ?? pat?.patient_id ?? pat?.id;
        const appts     = await apiCall<any>('GET', `/appointments/patient/${patientId}`);
        const data      = Array.isArray(appts) ? appts : appts?.appointments || appts?.data || [];
        setAppointments(data);
        setFiltered(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {fetchAppointments(); } ,[])

  useEffect(() => {
    let data = appointments;
    if (statusFilter !== 'all') data = data.filter(a => a.status?.toLowerCase() === statusFilter);
    const q = search.toLowerCase();
    if (q) data = data.filter(a =>
      a.doctorName?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q)
    );
    setFiltered(data);
  }, [search, statusFilter, appointments]);

const openEdit = (a: any) => {
  const dt = new Date(a.appointmentDateTime);

  setEditModal(a);
  setEditForm({
    appointmentDate: dt.toISOString().split('T')[0],
    appointmentTime: dt.toTimeString().slice(0,5),
    reason: a.reason || '',
  });
};

  // ── Save edit ──
  const handleEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/appointments/update/${editModal.appointmentId}`, {
        appointmentDate: editForm.appointmentDate,
        appointmentTime: editForm.appointmentTime,
        reason:          editForm.reason,
      });
      const formatted = new Date(`${editForm.appointmentDate}T${editForm.appointmentTime}:00+05:00`)
        .toLocaleDateString('en-PK', {
          timeZone: 'Asia/Karachi',
          year: 'numeric', month: 'long', day: 'numeric'
        }) + ' ' + editForm.appointmentTime;

      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === editModal.appointmentId
            ? { ...a, ...editForm, appointmentDateTime: formatted }
            : a
        )
      );
      setToast({ msg: 'Appointment updated successfully', type: 'success' });
      setEditModal(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Update failed';
      setToast({ msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel appointment ──
  const handleCancel = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/appointments/delete',confirmId);
      fetchAppointments()
      setToast({ msg: 'Appointment cancelled successfully', type: 'success' });
    } catch {
      setToast({ msg: 'Could not cancel appointment', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const initials = (name: string) =>
    name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const isActive = (status: string) =>
    ['scheduled', 'pending'].includes(status?.toLowerCase());

  return (
    <PatientLayout title="My Appointments" subtitle={`${appointments.length} total appointments`}>

      <div className="section-header">
        <div>
          <h2>All Appointments</h2>
          <p>Your scheduled and past appointments</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="btn btn-ghost"
            style={{ cursor: 'pointer' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/patient/book')}>
            + Book New
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input
              placeholder="Search by doctor or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={5}>Loading appointments...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No appointments found</h3>
                  <p>Book your first appointment</p>
                </div>
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.appointmentId}>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(a.doctorName)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>Dr. {a.doctorName}</div>
                      <div className="td-secondary">{a.doctorEmail}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {a.appointmentDateTime || `${a.appointmentDate?.split('T')[0] || '—'} ${a.appointmentTime || ''}`}
                </td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.reason || '—'}
                </td>
                <td>
                  <span
                    className={`badge ${statusBadge[a.status?.toLowerCase()] || 'badge-slate'}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {a.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(a)}
                    >
                      <EditIcon size={16}/>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmId([a.appointmentId])}
                    > 
                    <DeleteIcon size={15}/>
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            Showing {filtered.length} of {appointments.length} appointments
          </span>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Appointment</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>

            {/* Doctor — read only */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'var(--bg3)',
              borderRadius: 'var(--radius-sm)', marginBottom: 16,
            }}>
              <div className="td-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>
                {initials(editModal.doctorName || 'Dr')}
              </div>
              <div>
                <div className="td-primary">Dr. {editModal.doctorName || '—'}</div>
                <div className="td-secondary" style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                  Doctor cannot be changed
                </div>
              </div>
            </div>

            <div className="modal-form">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    min={today}
                    value={editForm.appointmentDate}
                    onChange={e => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={editForm.appointmentTime}
                    onChange={e => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  placeholder="Reason for visit..."
                  value={editForm.reason}
                  onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEdit}
                  disabled={saving || !editForm.appointmentDate || !editForm.appointmentTime || !editForm.reason}
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Modal ── */}
      {confirmId && (
        <ConfirmModal
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This cannot be undone."
          onConfirm={handleCancel}
          onCancel={() => setConfirmId(null)}
          loading={deleting}
        />
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

    </PatientLayout>
  );
}