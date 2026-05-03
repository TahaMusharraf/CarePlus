import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, SearchIcon, ViewIcon } from '@/api/icons';

export default function AdminRecords() {
  const [records, setRecords]     = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<number[]>([]);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]     = useState<number[] | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [doctor, setDoctor]       = useState<Record<number, any>>({});
  const [patient, setPatient]     = useState<Record<number, any>>({});
  const [view, setView]           = useState<any>(null);

  const fetchRecords = () => {
    setLoading(true);
    apiCall<any>('GET', '/medical-records/all')
      .then(async (res) => {
        const data = res?.medicalRecord || res?.data || res || [];

        setRecords(data);
        setFiltered(data);

        // ── Patients ──
        const uniquePatIds = [...new Set(data.map((d: any) => d.patientId))] as number[];
        const patientList = await Promise.all(
          uniquePatIds.map(id =>
            apiCall<any>('GET', `/patients/getByPatientId/${id}`)
              .then(r => r?.patient || r?.data || r)
              .catch(() => null)
          )
        );
        const patientMap: Record<number, any> = {};
        patientList.filter(Boolean).forEach((p, idx) => {
          patientMap[uniquePatIds[idx]] = p;
        });

        // ── Doctors ──
        const uniqueDocIds = [...new Set(data.map((d: any) => d.doctorId))] as number[];
        const doctorList = await Promise.all(
          uniqueDocIds.map(id =>
            apiCall<any>('GET', `/doctor/getByDoctorId/${id}`)
              .then(r => r?.doctor || r?.data || r)
              .catch(() => null)
          )
        );
        const doctorMap: Record<number, any> = {};
        doctorList.filter(Boolean).forEach((d, idx) => {
          doctorMap[uniqueDocIds[idx]] = d;
        });

        setPatient(patientMap);
        setDoctor(doctorMap);
      })
      .catch(() => showToast('Failed to load records', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(records.filter(r =>
      r.diagnosis?.toLowerCase().includes(q) ||
      r.prescription?.toLowerCase().includes(q)
    ));
  }, [search, records]);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(r => r.recordId));

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/medical-records/delete', confirm);
      showToast(`${confirm.length} record(s) deleted`, 'success');
      setSelected([]);
      fetchRecords();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const initials = (name: string) =>
    name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <AdminLayout title="Medical Records" subtitle={`${records.length} total records`}>

      <div className="section-header">
        <div><h2>All Medical Records</h2><p>View patient medical history</p></div>
        <div className="section-actions">
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={() => setConfirm(selected)}>
              <DeleteIcon size={15}/> Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input
              placeholder="Search by diagnosis or prescription..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {selected.length > 0 && <span className="selected-info">{selected.length} selected</span>}
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="cb" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Prescription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={7}>Loading records...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No records found</h3>
                  <p>No medical records available</p>
                </div>
              </td></tr>
            ) : filtered.map((r, i) => {
              const p = patient[r.patientId];
              const d = doctor[r.doctorId];
              return (
                <tr key={r.recordId || i} className={selected.includes(r.recordId) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="cb"
                      checked={selected.includes(r.recordId)}
                      onChange={() => toggleSelect(r.recordId)}
                    />
                  </td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{initials(p?.name || '?')}</div>
                      <div>
                        <div className="td-primary">{p?.name || `Patient #${r.patientId}`}</div>
                        {p?.email && <div className="td-secondary">{p.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{initials(d?.name || '?')}</div>
                      <div>
                        <div className="td-primary">{d?.name || `Doctor #${r.doctorId}`}</div>
                        {d?.email && <div className="td-secondary">{d.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {r.diagnosis || '—'}
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {r.prescription || '—'}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirm([r.recordId])}>
                      <DeleteIcon size={15}/>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setView(r)}><ViewIcon/> View</button>
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

      {view && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Record Details</h3>
                <button className="modal-close" onClick={() => setView(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Appointment ID',      view.appointmentId],
                  ['Patient Id',          view.patientId],
                  ['Doctor Id',           view.doctorId],
                  ['Diagnosis',           view.diagnosis],
                  ['Prescription',        view.prescription],
                  ['Created At',          new Date(view.createdAt).toLocaleDateString('en-PK')]
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', textTransform: 'capitalize' }}>{value || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="modal-footer" style={{ marginTop: 16 }}>
                <button className="btn btn-ghost" onClick={() => setView(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      {confirm && (
        <ConfirmModal
          title="Delete Record(s)"
          message={`Delete ${confirm.length} record(s)? This cannot be undone.`}
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