import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, SearchIcon, ViewIcon } from '@/api/icons';

export default function AdminUsers() {
  const [users, setUsers]       = useState<User[]>([]);
  const [filtered, setFiltered]     = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<number[]>([]);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]       = useState<number[] | null>(null);
  const [view, setView]             = useState<any>(null);

  const fetchDoctors = () => {
    setLoading(true);
    apiCall<any>('GET', '/users/all')
      .then(res => {
        console.log('users',res);
        const data = res?.users || res?.data || res || [];
        setUsers(data);
        setFiltered(data);
      })
      .catch(() => showToast('Failed to load doctors', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map(d => d.id));
  };

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <AdminLayout title="Users" subtitle={`${users.length} registered users`}>

      <div className="section-header">
        <div><h2>All Users</h2><p>Manage users accounts and details</p></div>
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
              placeholder="Search users..."
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
              <th>User</th>
              <th>Date Of Birth</th>
              <th>Role</th>
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
                  <h3>No users found</h3>
                  <p>Try a different search term</p>
                </div>
              </td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className={selected.includes(u.id) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{initials(u.name)}</div>
                    <div>
                      <div className="td-primary" style={{ textTransform: 'capitalize' }}>{u.name}</div>
                      <div className="td-secondary">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>{u.dob ? new Date(u.dob).toLocaleDateString('en-PK') : '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setView(u)}><ViewIcon/> View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {users.length} users</span>
        </div>
      </div>

      {view && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setView(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                  {view.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ color: '#646464', fontWeight: 600 }}>{view.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{view.email}</p>
                </div>
              </div>
              {[
                ['User ID',     view.id],
                ['Phone',       view.phone],
                ['Date of Birth', view.dob ? new Date(view.dob).toLocaleDateString('en-PK') : '—'],
                ['Role',        view.role]
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


      {/* Toast */}
      <div className="toast-container">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

    </AdminLayout>
  );
}