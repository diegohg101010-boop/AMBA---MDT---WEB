import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CommonStyles.css';
import './Oficiales.css';

export default function Oficiales() {
  const { user } = useAuth();
  const [oficiales, setOficiales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOficial, setSelectedOficial] = useState(null);
  const [formData, setFormData] = useState({
    dni: '',
    placa: '',
    agencia: '',
    rango: '',
    division: '',
    certificaciones: '',
    notas: ''
  });
  const [sancionForm, setSancionForm] = useState({
    tipo_sancion: '',
    motivo: '',
    oficial_sancionador: '',
    dias_suspension: 0,
    notas: ''
  });

  // Verificar permisos
  const canEdit = user?.rol === 'Admin' || user?.rol === 'Jefatura';

  useEffect(() => {
    cargarOficiales();
  }, []);

  const cargarOficiales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/oficiales');
      setOficiales(response.data || []);
    } catch (error) {
      console.error('Error al cargar oficiales:', error);
      alert('Error al cargar oficiales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      console.log('Enviando datos:', formData);
      await api.post('/api/oficiales', formData);
      alert('Oficial registrado exitosamente');
      setShowAddModal(false);
      setFormData({
        dni: '',
        placa: '',
        agencia: '',
        rango: '',
        division: '',
        certificaciones: '',
        notas: ''
      });
      cargarOficiales();
    } catch (error) {
      console.error('Error al crear oficial:', error);
      alert(error.message || 'Error al crear oficial');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/oficiales/${selectedOficial.id}`, formData);
      alert('Oficial actualizado exitosamente');
      setShowEditModal(false);
      cargarOficiales();
    } catch (error) {
      console.error('Error al actualizar oficial:', error);
      alert(error.message || 'Error al actualizar oficial');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este oficial? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await api.delete(`/api/oficiales/${id}`);
      alert('Oficial eliminado exitosamente');
      cargarOficiales();
    } catch (error) {
      console.error('Error al eliminar oficial:', error);
      alert('Error al eliminar oficial');
    }
  };

  const handleViewOficial = async (oficial) => {
    try {
      const response = await api.get(`/api/oficiales/${oficial.id}`);
      setSelectedOficial(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error al cargar oficial:', error);
      alert('Error al cargar información del oficial');
    }
  };

  const handleEditOficial = (oficial) => {
    setSelectedOficial(oficial);
    setFormData({
      dni: oficial.dni,
      placa: oficial.placa,
      agencia: oficial.agencia || '',
      rango: oficial.rango,
      division: oficial.division || '',
      certificaciones: oficial.certificaciones || '',
      notas: oficial.notas || ''
    });
    setShowEditModal(true);
  };

  const handleAddSancion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/oficiales/${selectedOficial.oficial.id}/sanciones`, sancionForm);
      alert('Sanción registrada exitosamente');
      setSancionForm({
        tipo_sancion: '',
        motivo: '',
        oficial_sancionador: '',
        dias_suspension: 0,
        notas: ''
      });
      handleViewOficial({ id: selectedOficial.oficial.id });
    } catch (error) {
      console.error('Error al agregar sanción:', error);
      alert('Error al agregar sanción');
    }
  };

  const handleDeleteSancion = async (sancionId) => {
    if (!confirm('¿Está seguro de eliminar esta sanción?')) {
      return;
    }
    try {
      await api.delete(`/api/oficiales/${selectedOficial.oficial.id}/sanciones/${sancionId}`);
      alert('Sanción eliminada exitosamente');
      handleViewOficial({ id: selectedOficial.oficial.id });
    } catch (error) {
      console.error('Error al eliminar sanción:', error);
      alert('Error al eliminar sanción');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">Cargando oficiales...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>👮 Gestión de Oficiales</h1>
          <p>Administración del personal policial</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Añadir Oficial
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Rango</th>
              <th>Departamento</th>
              <th>División</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {oficiales.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay oficiales registrados
                </td>
              </tr>
            ) : (
              oficiales.map((oficial) => (
                <tr key={oficial.id}>
                  <td><strong>{oficial.placa}</strong></td>
                  <td>{oficial.dni}</td>
                  <td>{oficial.nombres} {oficial.apellidos}</td>
                  <td>{oficial.rango}</td>
                  <td>{oficial.departamento}</td>
                  <td>{oficial.division || '-'}</td>
                  <td>
                    <span className={`badge ${oficial.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                      {oficial.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleViewOficial(oficial)} title="Ver detalles">
                      👁️
                    </button>
                    {canEdit && (
                      <>
                        <button className="btn-icon" onClick={() => handleEditOficial(oficial)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(oficial.id)} title="Eliminar">
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Añadir Oficial */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-oficial" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-oficial">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                </div>
                <div>
                  <h2>Registrar Nuevo Oficial</h2>
                  <p>Complete la información del oficial para agregarlo al sistema</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmitAdd} className="form-oficial">
              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Información Personal
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      placeholder="Ej: 12345678"
                      required
                    />
                    <span className="input-hint">Debe existir en el sistema de ciudadanos</span>
                  </div>
                  <div className="form-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Placa *
                    </label>
                    <input
                      type="text"
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                      placeholder="Ej: 1234"
                      required
                    />
                    <span className="input-hint">Número de placa único</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Información Policial
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Agencia/Departamento *</label>
                    <input
                      type="text"
                      value={formData.agencia}
                      onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                      placeholder="Ej: HCSO, HPD, FBI..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rango *</label>
                    <input
                      type="text"
                      value={formData.rango}
                      onChange={(e) => setFormData({ ...formData, rango: e.target.value })}
                      placeholder="Ej: Oficial, Sargento, Teniente..."
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    División
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="Ej: Patrulla, Investigaciones, SWAT, K9..."
                  />
                  <span className="input-hint">Opcional - Unidad o división específica</span>
                </div>
                <div className="form-group">
                  <label>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Certificaciones
                  </label>
                  <input
                    type="text"
                    value={formData.certificaciones}
                    onChange={(e) => setFormData({ ...formData, certificaciones: e.target.value })}
                    placeholder="Ej: Tiro Avanzado, Manejo Táctico, Primeros Auxilios..."
                  />
                  <span className="input-hint">Opcional - Separar con comas</span>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Notas Adicionales
                </h3>
                <div className="form-group">
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows="4"
                    placeholder="Información adicional, observaciones..."
                  />
                </div>
              </div>

              <div className="modal-actions-oficial">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Registrar Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Oficial */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Oficial</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>DNI</label>
                <input type="text" value={formData.dni} disabled />
              </div>
              <div className="form-group">
                <label>Placa *</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Agencia/Departamento *</label>
                <input
                  type="text"
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rango *</label>
                <input
                  type="text"
                  value={formData.rango}
                  onChange={(e) => setFormData({ ...formData, rango: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>División</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Oficial */}
      {showViewModal && selectedOficial && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Expediente del Oficial</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            
            <div className="expediente-section">
              <h3>Información Personal</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">DNI:</span>
                  <span className="info-value">{selectedOficial.oficial.dni}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{selectedOficial.oficial.nombres} {selectedOficial.oficial.apellidos}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Placa:</span>
                  <span className="info-value">{selectedOficial.oficial.placa}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rango:</span>
                  <span className="info-value">{selectedOficial.oficial.rango}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Departamento:</span>
                  <span className="info-value">{selectedOficial.oficial.departamento}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">División:</span>
                  <span className="info-value">{selectedOficial.oficial.division || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className={`badge ${selectedOficial.oficial.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedOficial.oficial.estado}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha Ingreso:</span>
                  <span className="info-value">{new Date(selectedOficial.oficial.fecha_ingreso).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              {selectedOficial.oficial.notas && (
                <div className="info-item" style={{ marginTop: '1rem' }}>
                  <span className="info-label">Notas:</span>
                  <p className="info-value">{selectedOficial.oficial.notas}</p>
                </div>
              )}
            </div>

            <div className="expediente-section sanciones-section">
              <div className="section-header-sanciones">
                <div className="section-title-sanciones">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <h3>Historial Disciplinario</h3>
                    <p className="section-subtitle">
                      {selectedOficial.sanciones?.length || 0} {selectedOficial.sanciones?.length === 1 ? 'sanción registrada' : 'sanciones registradas'}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <button 
                    type="button" 
                    className="btn-add-sancion"
                    onClick={() => document.getElementById('sancion-form').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nueva Sanción
                  </button>
                )}
              </div>

              {/* Lista de sanciones */}
              {selectedOficial.sanciones && selectedOficial.sanciones.length > 0 ? (
                <div className="sanciones-list">
                  {selectedOficial.sanciones.map((sancion) => (
                    <div key={sancion.id} className="sancion-card">
                      <div className="sancion-header">
                        <div className="sancion-tipo">
                          <span className={`badge-sancion badge-${sancion.tipo_sancion.toLowerCase().replace(/ó/g, 'o').replace(/ñ/g, 'n')}`}>
                            {sancion.tipo_sancion}
                          </span>
                          {sancion.dias_suspension > 0 && (
                            <span className="sancion-dias">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {sancion.dias_suspension} {sancion.dias_suspension === 1 ? 'día' : 'días'}
                            </span>
                          )}
                        </div>
                        <div className="sancion-fecha">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {new Date(sancion.fecha_sancion).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      
                      <div className="sancion-body">
                        <div className="sancion-field">
                          <label>Motivo</label>
                          <p>{sancion.motivo}</p>
                        </div>
                        
                        {sancion.oficial_sancionador && (
                          <div className="sancion-field">
                            <label>Sancionado por</label>
                            <p className="sancion-oficial">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                              </svg>
                              {sancion.oficial_sancionador}
                            </p>
                          </div>
                        )}
                        
                        {sancion.notas && (
                          <div className="sancion-field">
                            <label>Observaciones</label>
                            <p className="sancion-notas">{sancion.notas}</p>
                          </div>
                        )}
                      </div>

                      <button 
                        className="btn-delete-sancion" 
                        onClick={() => handleDeleteSancion(sancion.id)}
                        title="Eliminar sanción"
                        style={{ display: canEdit ? 'flex' : 'none' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-sanciones">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p>Sin sanciones disciplinarias</p>
                  <span>Este oficial mantiene un historial limpio</span>
                </div>
              )}

              {/* Formulario para agregar sanción */}
              {canEdit && (
                <form id="sancion-form" onSubmit={handleAddSancion} className="form-add-sancion">
                <div className="form-sancion-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <h4>Registrar Nueva Sanción</h4>
                </div>

                <div className="form-sancion-grid">
                  <div className="form-group">
                    <label>Tipo de Sanción *</label>
                    <select
                      value={sancionForm.tipo_sancion}
                      onChange={(e) => setSancionForm({ ...sancionForm, tipo_sancion: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="Amonestación">⚠️ Amonestación</option>
                      <option value="Suspensión">🚫 Suspensión</option>
                      <option value="Degradación">⬇️ Degradación</option>
                      <option value="Expulsión">❌ Expulsión</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Días de Suspensión</label>
                    <input
                      type="number"
                      value={sancionForm.dias_suspension}
                      onChange={(e) => setSancionForm({ ...sancionForm, dias_suspension: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Motivo de la Sanción *</label>
                  <textarea
                    value={sancionForm.motivo}
                    onChange={(e) => setSancionForm({ ...sancionForm, motivo: e.target.value })}
                    required
                    rows="3"
                    placeholder="Describa detalladamente el motivo de la sanción..."
                  />
                </div>

                <div className="form-group">
                  <label>Oficial que Sanciona</label>
                  <input
                    type="text"
                    value={sancionForm.oficial_sancionador}
                    onChange={(e) => setSancionForm({ ...sancionForm, oficial_sancionador: e.target.value })}
                    placeholder="Nombre y placa del oficial sancionador"
                  />
                </div>

                <div className="form-group">
                  <label>Observaciones Adicionales</label>
                  <textarea
                    value={sancionForm.notas}
                    onChange={(e) => setSancionForm({ ...sancionForm, notas: e.target.value })}
                    rows="2"
                    placeholder="Información adicional relevante..."
                  />
                </div>

                <button type="submit" className="btn-submit-sancion">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Registrar Sanción
                </button>
              </form>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
