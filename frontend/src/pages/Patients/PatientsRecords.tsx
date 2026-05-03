import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientsLayout';
import { apiCall } from '../../api/axios';
import { SearchIcon, ViewIcon } from '@/api/icons';

export default function PatientRecords() {
  const [records, setRecords]   = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [doctor, setDoctor] = useState<Record<number, any>>({});

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const user    = userRaw ? JSON.parse(userRaw) : null;
    if (!user?.id) return;

    apiCall<any>('GET', `/patients/get/${Number(user.id)}`)
      .then(async res => {
        const pat = res?.patient || res?.data || res;
        const patientId = pat?.patientId || pat?.id;
        try {
          const recs = await apiCall<any>('GET', `/medical-records/patient/${patientId}`);
          const data = Array.isArray(recs) ? recs : recs?.medicalRecord || recs?.data || [];

          const uniqueIds = [...new Set(data.map((d: any) => d.doctorId))] as number[];
          const doctorList = await Promise.all(
            uniqueIds.map(id =>
              apiCall<any>('GET', `/doctor/getByDoctorId/${id}`)
                .then(r => r?.doctor || r?.data || r)
                .catch(() => null)
            )
          );
          const doctorMap: Record<number, any> = {};
            doctorList.filter(Boolean).forEach(p => {
              doctorMap[p.id] = p;
          });
          console.log("MAP",doctorMap)
          setDoctor(doctorMap)
          console.log("DOCTOR LIST",doctor)
          setRecords(data);
          setFiltered(data);
        } catch {
          setRecords([]);
          setFiltered([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(records.filter(r =>
      r.doctorName?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.prescription?.toLowerCase().includes(q)
    ));
  }, [search, records]);

  return (
    <PatientLayout title="Medical Records" subtitle={`${records.length} records`}>

      <div className="section-header">
        <div><h2>My Medical Records</h2><p>Your complete medical history</p></div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><SearchIcon/></span>
            <input placeholder="Search by doctor or diagnosis..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Doctor</th>
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
                  <h3>No medical records found</h3>
                  <p>Your doctor will add records after your visit</p>
                </div>
              </td></tr>
            ) : filtered.map((r, i) => {
              const d = doctor[r.doctorId];
              console.log(d)
              return (
              <tr key={r.recordId || i}>
                  <td>
                    <div className="td-name"> 
                      <div className="td-avatar">
                        {d?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="td-primary">{d?.name}</div>
                        {d?.email && <div className="td-secondary">{d.email}</div>}
                      </div>
                    </div>
                  </td>
                <td><span className="badge badge-blue">{r.diagnosis || '—'}</span></td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.prescription || '—'}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}><ViewIcon size={15}/> View</button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {records.length} records</span>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Medical Record</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Doctor',       doctor[selected.doctorId]?.name],
                ['Diagnosis',    selected.diagnosis],
                ['Prescription', selected.prescription],
                ['Date',         selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-PK') : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)', maxWidth: 240, textAlign: 'right' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}