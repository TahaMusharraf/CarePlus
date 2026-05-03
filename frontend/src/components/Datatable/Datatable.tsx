import React from 'react';
import "../Layout/AppLayout.css";

interface Column {
  key:      string;
  label:    string;
  render?:  (row: any) => React.ReactNode;
  align?:   'left' | 'right';
}

interface DataTableProps {
  columns:     Column[];
  data:        any[];
  loading?:    boolean;
  emptyText?:  string;
  searchValue?:    string;
  onSearchChange?: (v: string) => void;
  headerRight?:    React.ReactNode;
  title:           string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns, data, loading, emptyText = 'No records found',
  searchValue, onSearchChange, headerRight, title,
}) => (
  <div className="data-card">
    <div className="data-card-header">
      <h3>{title}</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        {onSearchChange && (
          <input
            className="search-input"
            placeholder="Search..."
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
          />
        )}
        {headerRight}
      </div>
    </div>

    {loading ? (
      <div className="loading-state">Loading...</div>
    ) : (
      <table className="app-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">{emptyText}</div>
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr key={row.id ?? row.userId ?? row.patientId ?? row.doctorId ?? row.appointmentId ?? row.recordId ?? i}>
              {columns.map(c => (
                <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default DataTable;