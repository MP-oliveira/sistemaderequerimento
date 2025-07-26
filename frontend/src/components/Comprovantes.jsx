import { useState, useEffect } from 'react';
import Button from './Button';
import { listarComprovantes, uploadComprovante, removerComprovante, downloadComprovante } from '../services/requestsService';
import './Comprovantes.css';

export default function Comprovantes({ requisicao, onClose }) {
  const [comprovantes, setComprovantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });

  useEffect(() => {
    if (requisicao) {
      buscarComprovantes();
    }
  }, [requisicao]);

  // Auto-hide das notificações
  useEffect(() => {
    if (notificacao.mostrar) {
      const timer = setTimeout(() => setNotificacao({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacao.mostrar]);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo, mostrar: true });
  }

  const buscarComprovantes = async () => {
    setLoading(true);
    try {
      const data = await listarComprovantes(requisicao.id);
      setComprovantes(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarNotificacao('Erro ao buscar comprovantes', 'erro');
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      mostrarNotificacao('Selecione um arquivo e adicione uma descrição', 'erro');
      return;
    }

    setUploading(true);
    try {
      await uploadComprovante(requisicao.id, selectedFile, description);
      mostrarNotificacao('Comprovante enviado com sucesso!', 'sucesso');
      setSelectedFile(null);
      setDescription('');
      buscarComprovantes();
    } catch (err) {
      mostrarNotificacao('Erro ao enviar comprovante', 'erro');
    }
    setUploading(false);
  };

  const handleDownload = async (comprovanteId, fileName) => {
    try {
      await downloadComprovante(comprovanteId);
      mostrarNotificacao('Download iniciado!', 'sucesso');
    } catch (err) {
      mostrarNotificacao('Erro ao fazer download', 'erro');
    }
  };

  const handleDelete = async (comprovanteId) => {
    try {
      await removerComprovante(comprovanteId);
      mostrarNotificacao('Comprovante removido com sucesso!', 'sucesso');
      buscarComprovantes();
    } catch (err) {
      mostrarNotificacao('Erro ao remover comprovante', 'erro');
    }
  };

  return (
    <div className="comprovantes-container">
      {/* Notificação */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="comprovantes-header">
        <h3>Comprovantes da Requisição</h3>
        <p>Requisição: {requisicao?.description || 'N/A'}</p>
      </div>

      <div className="upload-section">
        <h4>Adicionar Comprovante</h4>
        <div className="upload-form">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="file-input"
          />
          <input
            type="text"
            placeholder="Descrição do comprovante"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="description-input"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !description.trim() || uploading}
            loading={uploading}
            variant="primary"
            size="sm"
          >
            Enviar
          </Button>
        </div>
      </div>

      <div className="comprovantes-list">
        <h4>Comprovantes Enviados</h4>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : comprovantes.length === 0 ? (
          <div className="empty">Nenhum comprovante encontrado.</div>
        ) : (
          <div className="comprovantes-grid">
            {comprovantes.map((comprovante) => (
              <div key={comprovante.id} className="comprovante-item">
                <div className="comprovante-info">
                  <h5>{comprovante.description}</h5>
                  <p>Enviado em: {new Date(comprovante.created_at).toLocaleString()}</p>
                </div>
                <div className="comprovante-actions">
                  <Button
                    onClick={() => handleDownload(comprovante.id, comprovante.file_name)}
                    variant="secondary"
                    size="sm"
                  >
                    Download
                  </Button>
                  <Button
                    onClick={() => handleDelete(comprovante.id)}
                    variant="danger"
                    size="sm"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 