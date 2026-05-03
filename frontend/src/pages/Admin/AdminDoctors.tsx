import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, SearchIcon } from '@/api/icons';

export default function AdminDoctors() {
  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [filtered, setFiltered]     = useState<Doctor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<number[]>([]);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]       = useState<number[] | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchDoctors = () => {
    setLoading(true);
    apiCall<any>('GET', '/doctor/all')
      .then(res => {
        console.log('DOCTOR:',res);
        const data = res?.doctors || res?.data || res || [];
        setDoctors(data);
        setFiltered(data);
      })
      .catch(() => showToast('Failed to load doctors', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.deptName?.toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map(d => d.id));
  };

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      console.log(confirm)
      await apiCall('DELETE', '/doctor/delete', confirm);
      showToast(`${confirm.length} doctor(s) deleted`, 'success');
      setSelected([]);
      fetchDoctors();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <AdminLayout title="Doctors" subtitle={`${doctors.length} registered doctors`}>

      <div className="section-header">
        <div><h2>All Doctors</h2><p>Manage doctor accounts and details</p></div>
        <div className="section-actions">
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={() => setConfirm(selected)}>
              <DeleteIcon size={15}/>
              Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon">
              <SearchIcon/>
            </span>
            <input
              placeholder="Search doctors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {selected.length > 0 && (
            <span className="selected-info">{selected.length} selected</span>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="cb" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={6}>Loading doctors...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">👨‍⚕️</div>
                  <h3>No doctors found</h3>
                  <p>Try a different search term</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className={selected.includes(d.id) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} /></td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(d.name)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>{d.name}</div>
                      <div className="td-secondary">{d.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-blue">{d.specialization}</span></td>
                <td><span className="badge badge-teal">{d.deptName || '—'}</span></td>
                <td>{d.phone || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm([d.id])}><DeleteIcon size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {doctors.length} doctors</span>
        </div>
      </div>

      {/* Confirm Delete */}
      {confirm && (
        <ConfirmModal
          title="Delete Doctor(s)"
          message={`Are you sure you want to delete ${confirm.length} doctor(s)? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}

      {/* Toast */}
      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

    </AdminLayout>
  );
}