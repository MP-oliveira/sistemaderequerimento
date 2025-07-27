import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { getExecutedItems, markItemAsReturned } from '../services/requestItemsService';
import './ReturnMaterials.css';

const ReturnMaterials = () => {
  const [executedItems, setExecutedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarInstrumentosExecutados();
  }, []);

  const carregarInstrumentosExecutados = async () => {
    try {
      setLoading(true);
      const response = await getExecutedItems();
      setExecutedItems(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar instrumentos executados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReturned = async (itemId) => {
    try {
      await markItemAsReturned(itemId);
      // Recarregar a lista após marcar como retornado
      await carregarInstrumentosExecutados();
    } catch (error) {
      console.error('Erro ao marcar item como retornado:', error);
    }
  };

  if (loading) {
    return (
      <div className="return-materials">
        <h3>Retorno de Instrumentos</h3>
        <p>Carregando...</p>
      </div>
    );
  }

  if (executedItems.length === 0) {
    return (
      <div className="return-materials">
        <h3>Retorno de Instrumentos</h3>
        <p>Nenhum instrumento executado para retorno hoje.</p>
      </div>
    );
  }

  // Por enquanto, vamos mostrar todos os itens como pendentes
  // até implementarmos o sistema completo de separação/retorno
  const pendingItems = executedItems;
  const returnedItems = [];

  return (
    <div className="return-materials">
      <h3>Retorno de Instrumentos</h3>
      
      {pendingItems.length > 0 && (
        <div className="materials-section">
          <h4>Pendentes de Retorno ({pendingItems.length})</h4>
          <div className="materials-list">
            {pendingItems.map((item) => (
              <div key={item.id} className="material-item">
                <div className="material-info">
                  <span className="material-name">{item.item_name || item.inventory_item_name}</span>
                  <span className="material-details">
                    Requisição: {item.request_title || item.request_event_name} • Quantidade: {item.quantity_requested}
                  </span>
                </div>
                <button
                  className="return-button"
                  onClick={() => handleToggleReturned(item.id)}
                  title="Marcar como retornado"
                >
                  <FiCheck />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {returnedItems.length > 0 && (
        <div className="materials-section">
          <h4>Retornados ({returnedItems.length})</h4>
          <div className="materials-list">
            {returnedItems.map((item) => (
              <div key={item.id} className="material-item returned">
                <div className="material-info">
                  <span className="material-name">{item.item_name || item.inventory_item_name}</span>
                  <span className="material-details">
                    Requisição: {item.request_title || item.request_event_name} • Quantidade: {item.quantity_requested}
                  </span>
                </div>
                <div className="returned-icon">
                  <FiX />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnMaterials; 