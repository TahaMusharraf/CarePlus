import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, EditIcon, SearchIcon } from '@/api/icons';

const statusBadge: Record<string, string> = {
  scheduled: 'badge-blue',
  completed: 'badge-emerald',
  cancelled: 'badge-rose',
  pending: 'badge-slate'
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered]         = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState<number[]>([]);
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]           = useState<number[] | null>(null);
  const [deleting, setDeleting]         = useState(false);  
  const [editModal, setEditModal]       = useState<Appointment | null>(null);
  const [newStatus, setNewStatus]       = useState('');
  const [saving, setSaving]             = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    apiCall<any>('GET', '/appointments/all')
      .then(res => {
        const data = res?.appointments || res?.data || res || [];
        console.log(data);
        setAppointments(data);
        setFiltered(data);
      })
      .catch(() => showToast('Failed to load appointments', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    let data = appointments;
    if (statusFilter !== 'all') data = data.filter(a => a.status === statusFilter);
    const q = search.toLowerCase();
    if (q) data = data.filter(a =>
      a.patientName?.toLowerCase().includes(q) ||
      a.doctorName?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q)
    );
    setFiltered(data);
  }, [search, statusFilter, appointments]);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.appointmentId));

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/appointments/delete', confirm);
      showToast(`${confirm.length} appointment(s) deleted`, 'success');
      setSelected([]);
      fetchAppointments();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const handleStatusUpdate = async () => {
    if (!editModal || !newStatus) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/appointments/update/${editModal.appointmentId}`, { status: newStatus });
      showToast('Status updated', 'success');
      setEditModal(null);
      fetchAppointments();
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout title="Appointments" subtitle={`${appointments.length} total appointments`}>

      <div className="section-header">
        <div><h2>All Appointments</h2><p>View and manage appointment records</p></div>
        <div className="section-actions">
          {/* Status filter */}
          <select
            className="btn btn-ghost"
            style={{ cursor: 'pointer' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={() => setConfirm(selected)}>
              <DeleteIcon size={15}/>Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search appointments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {selected.length > 0 && <span className="selected-info">{selected.length} selected</span>}
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="cb" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={7}>Loading appointments...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No appointments found</h3>
                  <p>Try a different filter or search</p>
                </div>
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.appointmentId} className={selected.includes(a.appointmentId) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(a.appointmentId)} onChange={() => toggleSelect(a.appointmentId)} /></td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(a.patientName)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>{a.patientName}</div>
                      <div className="td-secondary">{a.patientEmail}</div>
                    </div>
                  </div>               
                </td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(a.doctorName)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>{a.doctorName}</div>
                      <div className="td-secondary">{a.doctorEmail}</div>
                    </div>
                  </div>                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.appointmentDateTime)}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.reason || '—'}
                </td>
                <td>
                  <span className={`badge ${statusBadge[a.status] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                    {a.status || 'unknown'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditModal(a); setNewStatus(a.status); }}>
                    <EditIcon size={15}/>Status
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm([a.appointmentId])}><DeleteIcon size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {appointments.length} appointments</span>
        </div>
      </div>

      {/* Status Update Modal */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Status</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                  <strong style={{ color: 'var(--white)' }}>{editModal.patientName}</strong> → <strong style={{ color: 'var(--white)' }}>{editModal.doctorName}</strong>
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 4 }}>{formatDate(editModal.appointmentDateTime)}</p>
              </div>
              <div className="form-group">
                <label>New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Appointment(s)"
          message={`Delete ${confirm.length} appointment(s)? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}