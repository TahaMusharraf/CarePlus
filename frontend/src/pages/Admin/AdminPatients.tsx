import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, SearchIcon } from '@/api/icons';

export default function AdminPatients() {
  const [patients, setPatients]   = useState<Patient[]>([]);
  const [filtered, setFiltered]   = useState<Patient[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<number[]>([]);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]     = useState<number[] | null>(null);
  const [deleting, setDeleting]   = useState(false);

  const fetchPatients = () => {
    setLoading(true);
    apiCall<any>('GET', '/patients/all')
      .then(res => {
        const data = res?.patient || res?.data || res || [];
        console.log(data)
        setPatients(data);
        setFiltered(data);
      })
      .catch(() => showToast('Failed to load patients', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.bloodGroup?.toLowerCase().includes(q) ||
      p.gender?.toLowerCase().includes(q)
    ));
  }, [search, patients]);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/patients/delete', confirm);
      showToast(`${confirm.length} patient(s) deleted`, 'success');
      setSelected([]);
      fetchPatients();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const bloodBadge = (bg: string) => {
    const map: Record<string, string> = {
      'A+': 'badge-blue', 'A-': 'badge-blue',
      'B+': 'badge-teal', 'B-': 'badge-teal',
      'O+': 'badge-emerald', 'O-': 'badge-emerald',
      'AB+': 'badge-amber', 'AB-': 'badge-amber',
    };
    return map[bg] || 'badge-slate';
  };

  return (
    <AdminLayout title="Patients" subtitle={`${patients.length} registered patients`}>

      <div className="section-header">
        <div><h2>All Patients</h2><p>View and manage patient records</p></div>
        <div className="section-actions">
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
            <input
              placeholder="Search patients..."
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
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={7}>Loading patients...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-icon">🧑‍🤝‍🧑</div>
                  <h3>No patients found</h3>
                  <p>Try a different search term</p>
                </div>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className={selected.includes(p.id) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(p.name)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>{p.name}</div>
                      <div className="td-secondary">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>{p.gender || '—'}</span></td>
                <td><span className={`badge ${bloodBadge(p.bloodGroup)}`}>{p.bloodGroup || '—'}</span></td>
                <td>{p.phone || '—'}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm([p.id])}><DeleteIcon size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {patients.length} patients</span>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title="Delete Patient(s)"
          message={`Delete ${confirm.length} patient(s)? This cannot be undone.`}
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