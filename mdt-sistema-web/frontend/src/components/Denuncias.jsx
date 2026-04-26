import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CommonStyles.css';
import './Denuncias.css';

export default function Denuncias() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [filterEstado, setFilterEstado] = useState('');
  const { canCreate, canUpdate, user } = useAuth();
  
  const [formData, setFormData] = useState({
    tipo_denuncia: '',
    dni_denunciante: '',
    dni_acusado: '',
    descripcion: '',
    ubicacion: '',
    fecha_hechos: '',
    evidencia: '',
    oficial_receptor: ''
  });

  const [updateData, setUpdateData] = useState({
    estado: '',
    notas: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Limpiar el formulario cuando se abre el modal de crear
  useEffect(() => {
    if (showCreateForm) {
      console.log('[FRONTEND] Modal de crear denuncia abierto, limpiando formulario');
      setFormData({
        tipo_denuncia: '',
        dni_denunciante: '',
        dni_acusado: '',
        descripcion: '',
        ubicacion: '',
        fecha_hechos: '',
        evidencia: '',
        oficial_receptor: ''
      });
      setImagePreview(null);
    }
  }, [showCreateForm]);

  const tiposDenuncia = [
    'Robo',
    'Asalto',
    'Agresión',
    'Fraude',
    'Vandalismo',
    'Amenazas',
    'Acoso',
    'Violencia Doméstica',
    'Tráfico de Drogas',
    'Conducción Temeraria',
    'Otro'
  ];

  const estados = [
    { value: 'pendiente', label: 'Pendiente', color: '#f39c12' },
    { value: 'en_investigacion', label: 'En Investigación', color: '#3498db' },
    { value: 'resuelta', label: 'Resuelta', color: '#2ecc71' },
    { value: 'archivada', label: 'Archivada', color: '#95a5a6' },
    { value: 'rechazada', label: 'Rechazada', color: '#e74c3c' }
  ];

  useEffect(() => {
    loadDenuncias();
  }, [filterEstado]);

  const loadDenuncias = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEstado) params.append('estado', filterEstado);
      
      const response = await api.get(`/api/denuncias?${params.toString()}`);
      if (response.success) {
        setDenuncias(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (numero) => {
    try {
      const response = await api.get(`/api/denuncias/${numero}`);
      if (response.success) {
        setSelectedDenuncia(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({...formData, evidencia: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[FRONTEND] Datos del formulario antes de enviar:', formData);
    try {
      const response = await api.post('/api/denuncias', formData);
      if (response.success) {
        alert(`Denuncia registrada exitosamente\nNúmero: ${response.data.numero_denuncia}`);
        setShowCreateForm(false);
        setImagePreview(null);
        setFormData({
          tipo_denuncia: '',
          dni_denunciante: '',
          dni_acusado: '',
          descripcion: '',
          ubicacion: '',
          fecha_hechos: '',
          evidencia: '',
          oficial_receptor: ''
        });
        loadDenuncias();
      }
    } catch (error) {
      alert(error.message || 'Error al registrar denuncia');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Filtrar campos vacíos antes de enviar
      const dataToSend = {};
      if (updateData.estado) dataToSend.estado = updateData.estado;
      if (updateData.notas) dataToSend.notas = updateData.notas;
      
      const response = await api.put(`/api/denuncias/${selectedDenuncia.denuncia.numero_denuncia}`, dataToSend);
      if (response.success) {
        alert('Denuncia actualizada exitosamente');
        setShowUpdateForm(false);
        setShowModal(false);
        setUpdateData({ estado: '', notas: '' });
        loadDenuncias();
      }
    } catch (error) {
      alert(error.message || 'Error al actualizar denuncia');
    }
  };

  const handleDelete = async (numero) => {
    if (!window.confirm('⚠️ ¿Estás seguro de que deseas eliminar esta denuncia DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/denuncias/${numero}`);
      if (response.success) {
        alert('✅ Denuncia eliminada definitivamente');
        setShowModal(false);
        loadDenuncias();
      }
    } catch (error) {
      alert(error.message || 'Error al eliminar denuncia');
    }
  };

  const getEstadoBadge = (estado) => {
    const estadoObj = estados.find(e => e.value === estado);
    return (
      <span className="badge" style={{ backgroundColor: estadoObj?.color || '#95a5a6' }}>
        {estadoObj?.label || estado}
      </span>
    );
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📋 Sistema de Denuncias</h1>
          <p>Gestión completa de denuncias policiales</p>
        </div>
        {canCreate('denuncias') && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + Nueva Denuncia
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Estado:</label>
          <select 
            className="input" 
            value={filterEstado} 
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos</option>
            {estados.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-secondary" onClick={() => setFilterEstado('')}>
          Limpiar Filtros
        </button>
      </div>

      {denuncias.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
          <h3>No hay denuncias registradas</h3>
          <p>Las denuncias aparecerán aquí</p>
        </div>
      ) : (
        <div className="denuncias-grid">
          {denuncias.map((denuncia) => (
            <div key={denuncia.numero_denuncia} className="denuncia-card">
              <div className="denuncia-card-header">
                <h3>{denuncia.numero_denuncia}</h3>
                <div className="badges">
                  {getEstadoBadge(denuncia.estado)}
                </div>
              </div>
              
              <div className="denuncia-card-body">
                <div className="info-row">
                  <span className="label">📂 Tipo:</span>
                  <span>{denuncia.tipo_denuncia}</span>
                </div>
                <div className="info-row">
                  <span className="label">👤 Denunciante:</span>
                  <span>DNI: {denuncia.dni_denunciante}</span>
                </div>
                {denuncia.dni_acusado && (
                  <div className="info-row">
                    <span className="label">⚠️ Acusado:</span>
                    <span>DNI: {denuncia.dni_acusado}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">📅 Fecha:</span>
                  <span>{new Date(denuncia.fecha_denuncia).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">👮 Oficial:</span>
                  <span>
                    {denuncia.oficial_dni && denuncia.oficial_nombre 
                      ? `${denuncia.oficial_dni} - ${denuncia.oficial_nombre}`
                      : denuncia.oficial_recibe || '–'}
                  </span>
                </div>
              </div>

              <div className="denuncia-card-footer">
                <button 
                  className="btn btn-sm btn-primary" 
                  onClick={() => viewDetails(denuncia.numero_denuncia)}
                >
                  Ver Detalles
                </button>
                {canUpdate('denuncias') && (
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSelectedDenuncia({ denuncia });
                      setShowUpdateForm(true);
                    }}
                  >
                    Actualizar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Denuncia */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Nueva Denuncia</h2>
              <button className="btn-close" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="form" autoComplete="off">
                <input type="text" style={{display: 'none'}} autoComplete="off" />
                <input type="password" style={{display: 'none'}} autoComplete="new-password" />
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Denuncia *</label>
                    <select
                      className="input"
                      value={formData.tipo_denuncia}
                      onChange={(e) => setFormData({...formData, tipo_denuncia: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {tiposDenuncia.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI Denunciante *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.dni_denunciante}
                      onChange={(e) => setFormData({...formData, dni_denunciante: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI Acusado (Opcional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.dni_acusado}
                      onChange={(e) => setFormData({...formData, dni_acusado: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>DNI Oficial que Recibe *</label>
                  <input
                    type="text"
                    className="input"
                    name="dni_oficial_receptor"
                    id="dni_oficial_receptor"
                    placeholder="Ingrese 8 dígitos del DNI del oficial"
                    value={formData.oficial_receptor}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('[FRONTEND] Campo oficial_receptor cambiado a:', value);
                      setFormData({...formData, oficial_receptor: value});
                    }}
                    onFocus={(e) => {
                      console.log('[FRONTEND] Campo oficial_receptor enfocado, valor actual:', e.target.value);
                    }}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                  />
                  <small style={{ color: '#95a5a6', fontSize: '0.85rem' }}>
                    ⚠️ IMPORTANTE: Ingrese el DNI (8 dígitos) del oficial que está recibiendo la denuncia
                  </small>
                </div>

                <div className="form-group">
                  <label>Descripción de los Hechos *</label>
                  <textarea
                    className="input"
                    rows="5"
                    placeholder="Describe detalladamente lo ocurrido..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Lugar donde ocurrieron los hechos"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Evidencia (Imagen)</label>
                  <input
                    type="file"
                    className="input"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar Denuncia
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actualizar Denuncia */}
      {showUpdateForm && selectedDenuncia && (
        <div className="modal-overlay" onClick={() => setShowUpdateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Actualizar Denuncia</h2>
              <button className="btn-close" onClick={() => setShowUpdateForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleUpdate} className="form">
                <div className="form-group">
                  <label>Número de Denuncia</label>
                  <input
                    type="text"
                    className="input"
                    value={selectedDenuncia.denuncia.numero_denuncia}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Nuevo Estado *</label>
                  <select
                    className="input"
                    value={updateData.estado}
                    onChange={(e) => setUpdateData({...updateData, estado: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {estados.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Notas Oficiales</label>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Agregar notas sobre la actualización..."
                    value={updateData.notas}
                    onChange={(e) => setUpdateData({...updateData, notas: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {showModal && selectedDenuncia && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {selectedDenuncia.denuncia.numero_denuncia}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {canUpdate('denuncias') && (
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDelete(selectedDenuncia.denuncia.numero_denuncia)}
                    title="Eliminar definitivamente"
                  >
                    🗑️ Eliminar
                  </button>
                )}
                <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="denuncia-details">
                <div className="detail-header">
                  <div className="badges-large">
                    {getEstadoBadge(selectedDenuncia.denuncia.estado)}
                  </div>
                </div>

                <div className="info-section">
                  <h3>📂 Información General</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Tipo de Denuncia:</label>
                      <span>{selectedDenuncia.denuncia.tipo_denuncia}</span>
                    </div>
                    <div className="info-item">
                      <label>Fecha de Denuncia:</label>
                      <span>{new Date(selectedDenuncia.denuncia.fecha_denuncia).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Oficial que Recibe:</label>
                      <span>
                        {selectedDenuncia.oficial?.dni && selectedDenuncia.oficial?.nombres 
                          ? `${selectedDenuncia.oficial.dni} - ${selectedDenuncia.oficial.nombres} ${selectedDenuncia.oficial.apellidos}`
                          : selectedDenuncia.denuncia.oficial_recibe || '–'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Denunciante</h3>
                  {selectedDenuncia.denunciante ? (
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nombre:</label>
                        <span>{selectedDenuncia.denunciante.nombres} {selectedDenuncia.denunciante.apellidos}</span>
                      </div>
                      <div className="info-item">
                        <label>DNI:</label>
                        <span>{selectedDenuncia.denunciante.dni}</span>
                      </div>
                    </div>
                  ) : (
                    <p>DNI: {selectedDenuncia.denuncia.dni_denunciante} (No registrado)</p>
                  )}
                </div>

                {selectedDenuncia.denuncia.dni_acusado && (
                  <div className="info-section">
                    <h3>⚠️ Acusado</h3>
                    {selectedDenuncia.acusado ? (
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Nombre:</label>
                          <span>{selectedDenuncia.acusado.nombres} {selectedDenuncia.acusado.apellidos}</span>
                        </div>
                        <div className="info-item">
                          <label>DNI:</label>
                          <span>{selectedDenuncia.acusado.dni}</span>
                        </div>
                      </div>
                    ) : (
                      <p>DNI: {selectedDenuncia.denuncia.dni_acusado} (No registrado)</p>
                    )}
                  </div>
                )}

                <div className="info-section">
                  <h3>📝 Descripción de los Hechos</h3>
                  <p className="description-text">{selectedDenuncia.denuncia.descripcion}</p>
                </div>

                {selectedDenuncia.denuncia.ubicacion && (
                  <div className="info-section">
                    <h3>📍 Ubicación</h3>
                    <p>{selectedDenuncia.denuncia.ubicacion}</p>
                  </div>
                )}

                {selectedDenuncia.denuncia.notas_oficiales && (
                  <div className="info-section">
                    <h3>📝 Notas Oficiales</h3>
                    <pre className="notes-text">{selectedDenuncia.denuncia.notas_oficiales}</pre>
                  </div>
                )}

                {selectedDenuncia.denuncia.evidencias && (
                  <div className="info-section">
                    <h3>📎 Evidencia</h3>
                    <div className="evidence-image">
                      <img src={selectedDenuncia.denuncia.evidencias} alt="Evidencia" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
