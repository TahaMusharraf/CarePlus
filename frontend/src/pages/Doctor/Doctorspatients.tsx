import React, { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { apiCall } from '../../api/axios';
import { SearchIcon, ViewIcon } from '@/api/icons';

export default function DoctorPatients() {
  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const [patients, setPatients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiCall<any>('GET', `/doctor/get/${user.id}`)
      .then(async (docRes) => {
        const profileData = docRes?.doctor || docRes?.data ;
        const doctorId = profileData?.id;
        apiCall<any>('GET', `/appointments/doctor/${doctorId}`)
          .then(async res => {
            const appts = Array.isArray(res) ? res : res?.appointments || res?.data || [];
            console.log(appts);
            // Get unique patient IDs
            const uniqueIds = [...new Set(appts.map((a: any) => a.patientId))] as number[];
            console.log(uniqueIds);
            // Fetch each patient
            const patientData = await Promise.all(
              uniqueIds.map(id =>
                apiCall<any>('GET', `/patients/getByPatientId/${id}`)
                  .then(r => r?.patient || r?.data || r)
                  .catch(() => null)
              )
            );
    
            const valid = patientData.filter(Boolean);
            setPatients(valid);
            setFiltered(valid);
          })
      })

      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.bloodGroup?.toLowerCase().includes(q)
    ));
  }, [search, patients]);

  const bloodBadge: Record<string, string> = {
    'A+': 'badge-blue', 'A-': 'badge-blue',
    'B+': 'badge-teal', 'B-': 'badge-teal',
    'O+': 'badge-emerald', 'O-': 'badge-emerald',
    'AB+': 'badge-amber', 'AB-': 'badge-amber',
  };

  return (
    <DoctorLayout title="My Patients" subtitle={`${patients.length} unique patients`}>

      <div className="section-header">
        <div><h2>My Patients</h2><p>Patients who have appointments with you</p></div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead>
            <tr>
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
              <tr className="loading-row"><td colSpan={6}>Loading patients...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">🧑‍🤝‍🧑</div>
                  <h3>No patients found</h3>
                  <p>Patients will appear after appointments are created</p>
                </div>
              </td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p.patientId || i}>
                <td>
                  <div className="td-name">
                    <div className="td-avatar">{p.name?.charAt(0).toUpperCase() || '?'}</div>
                    <div>
                      <div className="td-primary">{p.name}</div>
                      <div className="td-secondary">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>{p.gender || '—'}</span></td>
                <td><span className={`badge ${bloodBadge[p.bloodGroup] || 'badge-slate'}`}>{p.bloodGroup || '—'}</span></td>
                <td>{p.phone || '—'}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address || '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)}><ViewIcon/> View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {patients.length} patients</span>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Patient Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ color: 'var(--white)', fontWeight: 600 }}>{selected.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{selected.email}</p>
                </div>
              </div>
              {[
                ['Gender',      selected.gender],
                ['Blood Group', selected.bloodGroup],
                ['Phone',       selected.phone],
                ['Date of Birth', selected.dob ? new Date(selected.dob).toLocaleDateString('en-PK') : '—'],
                ['Address',     selected.address],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)', textTransform: 'capitalize' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}