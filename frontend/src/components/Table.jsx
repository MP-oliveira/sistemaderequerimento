import React from 'react';
import './Table.css';

export default function Table({ columns, data, emptyMessage = 'Nenhum registro encontrado.' }) {
  // Verificar se data é um array válido
  const safeData = Array.isArray(data) ? data : [];
  
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
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">{emptyMessage}</td>
            </tr>
          ) : (
            safeData.map((row, i) => (
              <tr key={i}>
                {columns.map(col => {
                  // Verificar se row existe e é um objeto
                  if (!row || typeof row !== 'object') {
                    return <td key={col.key}>-</td>;
                  }
                  
                  const value = row[col.key];
                  
                  // Se tem função render, usar ela
                  if (col.render) {
                    try {
                      return <td key={col.key}>{col.render(value, row)}</td>;
                    } catch (error) {
                      console.error('Erro na renderização da coluna:', col.key, error);
                      return <td key={col.key}>-</td>;
                    }
                  }
                  
                  // Se não tem render, tratar o valor
                  if (value === null || value === undefined) {
                    return <td key={col.key}>-</td>;
                  }
                  
                  if (React.isValidElement(value)) {
                    return <td key={col.key}>{value}</td>;
                  }
                  
                  if (typeof value === 'object') {
                    return <td key={col.key}>{JSON.stringify(value)}</td>;
                  }
                  
                  return <td key={col.key}>{String(value)}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 