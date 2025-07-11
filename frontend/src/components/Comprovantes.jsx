import React, { useState, useEffect } from 'react';
import { uploadComprovante, listarComprovantes, downloadComprovante, removerComprovante } from '../services/requestsService';
import Button from './Button';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Comprovantes.css';

export default function Comprovantes({ requisicao, onClose }) {
  const { user } = useAuth();
  const [comprovantes, setComprovantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (requisicao && requisicao.id) {
      carregarComprovantes();
    }
  }, [requisicao]);

  const carregarComprovantes = async () => {
    if (!requisicao || !requisicao.id) return;
    
    setLoading(true);
    try {
      const data = await listarComprovantes(requisicao.id);
      setComprovantes(data || []);
    } catch (error) {
      console.error('Erro ao carregar comprovantes:', error);
      toast.error('Erro ao carregar comprovantes');
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use: jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    try {
      await uploadComprovante(requisicao.id, selectedFile, description);
      toast.success('Comprovante enviado com sucesso!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setDescription('');
      carregarComprovantes();
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      toast.error(error.message || 'Erro ao enviar comprovante');
    }
    setUploading(false);
  };

  const handleDownload = async (comprovante) => {
    try {
      await downloadComprovante(comprovante.id);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
      toast.error('Erro ao baixar comprovante');
    }
  };

  const handleRemove = async (comprovante) => {
    if (!window.confirm('Tem certeza que deseja remover este comprovante?')) {
      return;
    }

    try {
      await removerComprovante(comprovante.id);
      toast.success('Comprovante removido com sucesso!');
      carregarComprovantes();
    } catch (error) {
      console.error('Erro ao remover comprovante:', error);
      toast.error('Erro ao remover comprovante');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    return '📎';
  };

  return (
    <div className="comprovantes-container">
      <div className="comprovantes-header">
        <h3>📎 Comprovantes da Requisição</h3>
        <div className="comprovantes-actions">
          <Button 
            onClick={() => setShowUploadModal(true)} 
            variant="primary" 
            size="sm"
          >
            📤 Enviar Comprovante
          </Button>
          <Button 
            onClick={onClose} 
            variant="secondary" 
            size="sm"
          >
            ✕ Fechar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="comprovantes-loading">
          <div className="loading-spinner"></div>
          <p>Carregando comprovantes...</p>
        </div>
      ) : comprovantes.length === 0 ? (
        <div className="comprovantes-empty">
          <p>📭 Nenhum comprovante enviado ainda.</p>
          <p>Clique em "Enviar Comprovante" para adicionar documentos.</p>
        </div>
      ) : (
        <div className="comprovantes-list">
          {comprovantes.map((comprovante) => (
            <div key={comprovante.id} className="comprovante-item">
              <div className="comprovante-info">
                <div className="comprovante-icon">
                  {getFileIcon(comprovante.mime_type)}
                </div>
                <div className="comprovante-details">
                  <h4 className="comprovante-name">{comprovante.original_name}</h4>
                  <p className="comprovante-description">{comprovante.description}</p>
                  <div className="comprovante-meta">
                    <span className="comprovante-size">{formatFileSize(comprovante.file_size)}</span>
                    <span className="comprovante-date">{formatDate(comprovante.created_at)}</span>
                    <span className="comprovante-user">por {comprovante.uploaded_by_name}</span>
                  </div>
                </div>
              </div>
              <div className="comprovante-actions">
                <Button 
                  onClick={() => handleDownload(comprovante)} 
                  variant="secondary" 
                  size="sm"
                >
                  📥 Baixar
                </Button>
                {(user.role === 'ADM' || comprovante.uploaded_by === user.id) && (
                  <Button 
                    onClick={() => handleRemove(comprovante)} 
                    variant="danger" 
                    size="sm"
                  >
                    🗑️ Remover
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Upload */}
      <Modal 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        title="📤 Enviar Comprovante"
      >
        <div className="upload-form">
          <div className="form-group">
            <label className="input-label">
              Arquivo
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                className="file-input"
              />
            </label>
            {selectedFile && (
              <div className="selected-file">
                <span>✅ {selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="input-label">
              Descrição (opcional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o comprovante..."
                rows="3"
                className="input-field"
              />
            </label>
          </div>

          <div className="upload-info">
            <p>📋 Tipos aceitos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX</p>
            <p>📏 Tamanho máximo: 10MB</p>
          </div>

          <div className="form-actions">
            <Button 
              onClick={() => setShowUploadModal(false)} 
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              variant="primary"
              loading={uploading}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Comprovante'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 