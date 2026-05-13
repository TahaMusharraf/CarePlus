import React, { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { apiCall } from '../../api/axios';
import { ConfirmModal } from '../Admin/AdminHelper';
import { EditIcon, PlusIcon, SearchIcon } from '@/api/icons';

const statusBadge: Record<string, string> = {
  scheduled: 'badge-blue',
  completed:  'badge-emerald',
  cancelled:  'badge-rose',
  pending:    'badge-slate'
};


export default function DoctorAppointments() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered]         = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selected, setSelected]         = useState<number[]>([]);
  const [doctorId, setDoctorId]         = useState<number | null>(null);
  const [saving, setSaving]             = useState(false);
  const [confirm, setConfirm]           = useState<number[] | null>(null);

  // Modals
  const [recordModal, setRecordModal]   = useState<RecordForm | null>(null);
  const [statusModal, setStatusModal]   = useState<Appointment | null>(null);
  const [newStatus, setNewStatus]       = useState('');

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const fetchAppointments = (dId: number) => {
    apiCall<any>('GET', `/appointments/doctor/${dId}`)
      .then(appts => {
        const data = Array.isArray(appts) ? appts : appts?.appointments || appts?.data || [];
        setAppointments(data);
        setFiltered(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user?.id) return;
    apiCall<any>('GET', `/doctor/get/${Number(user.id)}`)
      .then(res => {
        const doc = res?.doctor || res?.data || res;
        setDoctorId(doc?.id);
        fetchAppointments(doc?.id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
            console.log(appointments)

    let data = appointments;
    if (statusFilter !== 'all') data = data.filter(a => a.status?.toLowerCase() === statusFilter);
    const q = search.toLowerCase();
    if (q) data = data.filter(a =>
      a.patientName?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q)
    );
    setFiltered(data);
  }, [search, statusFilter, appointments]);

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.appointmentId));

  const openRecordModal = (apptId: number, patId: number) => {
    setRecordModal({
      patientId:     patId,
      recordId:      0,
      appointmentId: apptId,
      doctorId:      doctorId!,
      diagnosis:     '',
      prescription:  '',
    });
  };

  const openStatusModal = (appt: Appointment) => {
    setStatusModal(appt);
    setNewStatus(appt.status?.toLowerCase() || 'scheduled');
  };

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus || !doctorId) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/appointments/update/${statusModal.appointmentId}`, { status: newStatus });
      showToast('Status updated', 'success');
      setStatusModal(null);
      fetchAppointments(doctorId);
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!recordModal) return;
    setSaving(true);
    try {
      console.log("MODAL: ",recordModal)
      await apiCall('POST', '/medical-records/create', {
        patientId:     recordModal.patientId,
        doctorId:      recordModal.doctorId,
        appointmentId: recordModal.appointmentId,
        diagnosis:     recordModal.diagnosis,
        prescription:  recordModal.prescription,
      });
      showToast('Medical record created successfully', 'success');
      setRecordModal(null);
    } catch {
      showToast('Failed to create record', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout title="My Appointments" subtitle={`${appointments.length} total appointments`}>

      <div className="section-header">
        <div><h2>All Appointments</h2><p>Your scheduled and past appointments</p></div>
        <div className="section-actions">
          <select className="btn btn-ghost" style={{ cursor: 'pointer' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={() => setConfirm(selected)}>
              🗑 Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search by patient or reason..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {selected.length > 0 && <span className="selected-info">{selected.length} selected</span>}
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="cb" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={6}>Loading appointments...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No appointments found</h3>
                  <p>Try a different filter</p>
                </div>
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.appointmentId} className={selected.includes(a.appointmentId) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(a.appointmentId)} onChange={() => toggleSelect(a.appointmentId)} /></td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{a.patientName?.charAt(0).toUpperCase() || '?'}</div>
                    <div>
                      <div className="td-primary">{a.patientName}</div>
                      <div className="td-secondary">{a.patientEmail}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{a.appointmentDateTime}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.reason || '—'}
                </td>
                <td>
                  <span className={`badge ${statusBadge[a.status?.toLowerCase()] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openStatusModal(a)}>
                    <EditIcon size={15}/>
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openRecordModal(a.appointmentId,a.patientId)} title="Create Medical Record">
                    <PlusIcon size={15} color='blue'/>
                    Create Medical Record
                  </button>
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
      {statusModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button className="modal-close" onClick={() => setStatusModal(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 4 }}>
                <div className="td-primary">{statusModal.patientName}</div>
                <div className="td-secondary">{statusModal.appointmentDateTime}</div>
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
                <button className="btn btn-ghost" onClick={() => setStatusModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Medical Record Modal */}
      {recordModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>New Medical Record</h3>
              <button className="modal-close" onClick={() => setRecordModal(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Patient ID</label>
                  <input value={recordModal.patientId} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label>Appointment ID</label>
                  <input value={recordModal.appointmentId} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input placeholder="e.g. Hypertension" value={recordModal.diagnosis} onChange={e => setRecordModal({ ...recordModal, diagnosis: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <input placeholder="e.g. Amlodipine 5mg" value={recordModal.prescription} onChange={e => setRecordModal({ ...recordModal, prescription: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setRecordModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateRecord} disabled={saving || !recordModal.diagnosis}>
                  {saving ? 'Saving...' : 'Create Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>
        </div>
      )}
    </DoctorLayout>
  );
}