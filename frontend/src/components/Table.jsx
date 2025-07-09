import React from 'react';
import './Table.css';

export default function Table({ columns, data, emptyMessage = 'Nenhum registro encontrado.' }) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 