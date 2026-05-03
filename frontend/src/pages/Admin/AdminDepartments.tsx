import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Toast, ConfirmModal } from './AdminHelper';
import { apiCall } from '../../api/axios';
import { DeleteIcon, EditIcon, PlusIcon, SearchIcon } from '@/api/icons';

export default function AdminDepartments() {
  const [depts, setDepts]         = useState<Department[]>([]);
  const [filtered, setFiltered]   = useState<Department[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<number[]>([]);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm]     = useState<number[] | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [addModal, setAddModal]   = useState(false);
  const [editModal, setEditModal] = useState<Department | null>(null);
  const [formName, setFormName]   = useState('');
  const [saving, setSaving]       = useState(false);

  const fetchDepts = () => {
    setLoading(true);
    apiCall<any>('GET', '/departments/all')
      .then(res => {
        const data = res?.departments || res?.data || res || [];
        setDepts(data);
        setFiltered(data);
      })
      .catch(() => showToast('Failed to load departments', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(depts.filter(d => d.name?.toLowerCase().includes(q)));
  }, [search, depts]);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(d => d.id));

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      await apiCall('POST', '/departments/create', { name: formName });
      showToast('Department created', 'success');
      setAddModal(false);
      setFormName('');
      fetchDepts();
    } catch {
      showToast('Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editModal || !formName.trim()) return;
    setSaving(true);
    try {
      await apiCall('PATCH', `/departments/update/${editModal.id}`, { name: formName });
      showToast('Department updated', 'success');
      setEditModal(null);
      setFormName('');
      fetchDepts();
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiCall('DELETE', '/departments/delete', confirm);
      showToast(`${confirm.length} department(s) deleted`, 'success');
      setSelected([]);
      fetchDepts();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  const deptColors = ['badge-blue', 'badge-teal', 'badge-emerald', 'badge-amber', 'badge-rose'];

  return (
    <AdminLayout title="Departments" subtitle={`${depts.length} medical departments`}>

      <div className="section-header">
        <div><h2>All Departments</h2><p>Manage hospital departments</p></div>
        <div className="section-actions">
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={() => setConfirm(selected)}>
              <DeleteIcon size={15}/>Delete ({selected.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setAddModal(true); setFormName(''); }}>
            <PlusIcon size={20}/>Add Department
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {selected.length > 0 && <span className="selected-info">{selected.length} selected</span>}
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="cb" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>#</th>
              <th>Department Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={5}>Loading departments...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-icon">🏥</div>
                  <h3>No departments found</h3>
                  <p>Add your first department</p>
                </div>
              </td></tr>
            ) : filtered.map((d, i) => (
              <tr key={d.id} className={selected.includes(d.id) ? 'selected' : ''}>
                <td><input type="checkbox" className="cb" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} /></td>
                <td style={{ color: 'var(--text3)', fontFamily: 'monospace' }}>#{d.id}</td>
                <td>
                  <div className="td-name">
                    <div className="td-avatar" style={{ borderRadius: 8 }}>🏥</div>
                    <span className="td-primary">{d.name}</span>
                  </div>
                </td>
                <td><span className={`badge ${deptColors[i % deptColors.length]}`}>Active</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditModal(d); setFormName(d.name); }}><EditIcon size={15}/></button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm([d.id])}><DeleteIcon size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {depts.length} departments</span>
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Department</h3>
              <button className="modal-close" onClick={() => setAddModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Department Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Cardiology" autoFocus />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !formName.trim()}>
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Department</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Department Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Department name" autoFocus />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit} disabled={saving || !formName.trim()}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Department(s)"
          message={`Delete ${confirm.length} department(s)? This cannot be undone.`}
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