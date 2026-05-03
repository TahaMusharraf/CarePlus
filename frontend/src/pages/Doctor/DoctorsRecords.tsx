import React, { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { Toast, ConfirmModal } from '../Admin/AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, EditIcon, SearchIcon } from '@/api/icons';

export default function DoctorRecords() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [records, setRecords]     = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [patients, setPatients]   = useState<Record<number, any>>({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]     = useState<number[] | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editForm, setEditForm]   = useState({ diagnosis: '', prescription: '' });
  const [saving, setSaving]       = useState(false);

  const fetchRecords = () => {
    if (!user?.id) return;
    setLoading(true);
    apiCall<any>('GET', `/doctor/get/${Number(user.id)}`)
      .then(async (docRes) => {
        const profileData = docRes?.doctor || docRes?.data;
        const doctorId = profileData?.id;

        const res = await apiCall<any>('GET', `/medical-records/doctor/${doctorId}`);
        const data = Array.isArray(res) ? res : res?.medicalRecords || res?.medicalRecord || res?.data || [];

        // Fetch unique patients and store as map { patientId -> patient }
        const uniqueIds = [...new Set(data.map((d: any) => d.patientId))] as number[];
        const patientList = await Promise.all(
          uniqueIds.map(id =>
            apiCall<any>('GET', `/patients/getByPatientId/${id}`)
              .then(r => r?.patient || r?.data || r)
              .catch(() => null)
          )
        );
        const patientMap: Record<number, any> = {};
        patientList.filter(Boolean).forEach(p => {
          patientMap[p.id] = p;
        });

        setPatients(patientMap);
        setRecords(data);
        setFiltered(data);
      })
      .catch(() => setToast({ msg: 'Failed to load records', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(records.filter(r => {
      const p = patients[r.patientId];
      return (
        p?.name?.toLowerCase().includes(q) ||
        r.diagnosis?.toLowerCase().includes(q) ||
        r.prescription?.toLowerCase().includes(q)
      );
    }));
  }, [search, records, patients]);

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/medical-records/delete', confirm);
      setToast({ msg: 'Record deleted', type: 'success' });
      fetchRecords();
    } catch {
      setToast({ msg: 'Delete failed', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const openEdit = (r: any) => {
    setEditModal(r);
    setEditForm({ diagnosis: r.diagnosis || '', prescription: r.prescription || '' });
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/medical-records/update/${editModal.recordId}`, editForm);
      setToast({ msg: 'Record updated', type: 'success' });
      setEditModal(null);
      fetchRecords();
    } catch {
      setToast({ msg: 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout title="Medical Records" subtitle={`${records.length} records`}>

      <div className="section-header">
        <div><h2>My Medical Records</h2><p>Records you have created</p></div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input
              placeholder="Search by patient or diagnosis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Appointment ID</th>
              <th>Diagnosis</th>
              <th>Prescription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={5}>Loading records...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No records found</h3>
                  <p>Create your first medical record</p>
                </div>
              </td></tr>
            ) : filtered.map((r, i) => {
              const p = patients[r.patientId];
              return (
                <tr key={r.recordId || i}>
                  <td>
                    <div className="td-name"> 
                      <div className="td-avatar">
                        {p?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="td-primary">{p?.name || `Patient #${r.patientId}`}</div>
                        {p?.email && <div className="td-secondary">{p.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-teal">{r.appointmentId || '—'}</span></td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {r.diagnosis || '—'}
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {r.prescription || '—'}
                  </td>
                  <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>
                        <EditIcon size={15}/>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm([r.recordId])}>
                        <DeleteIcon size={15}/>
                      </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {records.length} records</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Medical Record</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Diagnosis</label>
                <input value={editForm.diagnosis} onChange={e => setEditForm({ ...editForm, diagnosis: e.target.value })} placeholder="Diagnosis" />
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <input value={editForm.prescription} onChange={e => setEditForm({ ...editForm, prescription: e.target.value })} placeholder="Prescription" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Record"
          message="Are you sure you want to delete this medical record?"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

    </DoctorLayout>
  );
}