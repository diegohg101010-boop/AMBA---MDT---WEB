import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Icon } from './Icons';
import './CommonStyles.css';
import './Ciudadanos.css';
import './Icons.css';

export default function Ciudadanos() {
  const [ciudadanos, setCiudadanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCiudadano, setSelectedCiudadano] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [enBusqueda, setEnBusqueda] = useState(false);
  const [esPeligroso, setEsPeligroso] = useState(false);
  const [motivoBusqueda, setMotivoBusqueda] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCiudadanos();
  }, []);

  const loadCiudadanos = async () => {
    try {
      const response = await api.get('/api/ciudadanos');
      if (response.success) {
        setCiudadanos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar ciudadanos:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (dni) => {
    try {
      const response = await api.get(`/api/ciudadanos/${dni}`);
      if (response.success) {
        setSelectedCiudadano(response.data);
        setEnBusqueda(response.data.ciudadano?.en_busqueda_captura === 1);
        setEsPeligroso(response.data.ciudadano?.es_peligroso === 1);
        setMotivoBusqueda(
          response.data.ciudadano?.motivo_busqueda ||
          response.data.ciudadano?.motivoBusqueda ||
          response.data.ciudadano?.notas ||
          ''
        );
        
        // Verificar si es oficial
        try {
          const oficialResponse = await api.get(`/api/oficiales/${dni}`);
          if (oficialResponse.success) {
            setSelectedCiudadano(prev => ({
              ...prev,
              oficial: oficialResponse.data.oficial
            }));
          }
        } catch (error) {
          // No es oficial, continuar normalmente
        }
        
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  const handleSaveEstado = async () => {
    if (!selectedCiudadano) return;
    
    // Validar que si está en búsqueda, tenga un motivo
    if (enBusqueda && !motivoBusqueda.trim()) {
      alert('⚠️ Debes especificar un motivo para la búsqueda y captura');
      return;
    }
    
    // Validar permisos: Solo Oficial para arriba puede marcar búsqueda/peligroso
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.rol === 'Cadete' && (enBusqueda || esPeligroso)) {
      alert('❌ No tienes permisos para marcar ciudadanos en búsqueda o como peligrosos.\n\nSolo Oficial, Supervisor, Jefatura y Admin pueden realizar esta acción.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await api.put(`/api/ciudadanos/${selectedCiudadano.ciudadano.dni}/estado`, {
        en_busqueda_captura: enBusqueda ? 1 : 0,
        es_peligroso: esPeligroso ? 1 : 0,
        motivo_busqueda: enBusqueda ? motivoBusqueda : null,
        notas: enBusqueda ? motivoBusqueda : null
      });

      if (response.success) {
        // Actualizar el ciudadano en la lista local
        setCiudadanos(prev => prev.map(c => 
          c.dni === selectedCiudadano.ciudadano.dni 
            ? {
                ...c,
                en_busqueda_captura: enBusqueda ? 1 : 0,
                es_peligroso: esPeligroso ? 1 : 0,
                motivo_busqueda: enBusqueda ? motivoBusqueda : null,
                notas: enBusqueda ? motivoBusqueda : null
              }
            : c
        ));
        
        // Actualizar el ciudadano seleccionado
        setSelectedCiudadano(prev => ({
          ...prev,
          ciudadano: {
            ...prev.ciudadano,
            en_busqueda_captura: enBusqueda ? 1 : 0,
            es_peligroso: esPeligroso ? 1 : 0,
            motivo_busqueda: enBusqueda ? motivoBusqueda : null,
            notas: enBusqueda ? motivoBusqueda : null
          }
        }));

        alert('✅ Estado actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('❌ Error al actualizar el estado del ciudadano');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArresto = async (arrestoId) => {
    if (!window.confirm('⚠️ ¿Estás seguro de que deseas eliminar este arresto DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/arrestos/${arrestoId}`);
      if (response.success) {
        alert('✅ Arresto eliminado definitivamente');
        // Recargar detalles del ciudadano
        viewDetails(selectedCiudadano.ciudadano.dni);
      }
    } catch (error) {
      alert(error.message || 'Error al eliminar arresto');
    }
  };

  const handleDeleteMulta = async (multaId) => {
    if (!window.confirm('⚠️ ¿Estás seguro de que deseas eliminar esta multa DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/multas/${multaId}`);
      if (response.success) {
        alert('✅ Multa eliminada definitivamente');
        // Recargar detalles del ciudadano
        viewDetails(selectedCiudadano.ciudadano.dni);
      }
    } catch (error) {
      alert(error.message || 'Error al eliminar multa');
    }
  };

  const filteredCiudadanos = ciudadanos.filter(c =>
    c.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando ciudadanos...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><Icon name="Citizen" className="icon-lg" /> Gestión de Ciudadanos</h1>
          <p>Consulta y gestiona la información de ciudadanos registrados</p>
        </div>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className="input"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCiudadanos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>No hay ciudadanos registrados</h3>
          <p>Los ciudadanos registrados aparecerán aquí</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre Completo</th>
                <th>Trabajo/Ocupación</th>
                <th>Nacionalidad</th>
                <th>Sexo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCiudadanos.map((ciudadano) => (
                <tr key={ciudadano.dni}>
                  <td><strong>{ciudadano.dni}</strong></td>
                  <td>{ciudadano.nombres} {ciudadano.apellidos}</td>
                  <td>
                    {ciudadano.trabajo ? (
                      <span className="badge badge-primary">
                        👮 {ciudadano.trabajo}
                      </span>
                    ) : (
                      <span className="text-muted">Civil</span>
                    )}
                  </td>
                  <td>{ciudadano.nacionalidad || 'N/A'}</td>
                  <td>{ciudadano.sexo || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Ver detalles"
                      onClick={() => viewDetails(ciudadano.dni)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedCiudadano && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="expediente-header-content">
                <div className="expediente-title">
                  <h2>Expediente Ciudadano</h2>
                  <span className="expediente-subtitle">Sistema de Gestión Policial - HSRP</span>
                </div>
                <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="ciudadano-details">
                {/* INDICADORES DE ANTECEDENTES - REDISEÑADO */}
                <div className="info-section" style={{
                  background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
                  border: '1px solid #1e3a5f',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <h3><Icon name="Stats" className="icon-md" /> Resumen de Antecedentes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* Arrestos */}
                    <div style={{ 
                      padding: '20px', 
                      borderRadius: '4px', 
                      background: selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)',
                      border: `2px solid ${selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 ? '#f59e0b' : '#22c55e'}`,
                      borderLeft: `4px solid ${selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 ? '#f59e0b' : '#22c55e'}`
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Icon name="Arrest" className="icon-xl" style={{ color: selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 ? '#f59e0b' : '#22c55e' }} />
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginBottom: '4px' }}>
                        {selectedCiudadano.arrestos ? selectedCiudadano.arrestos.length : 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                        {selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 ? 'Arrestos Registrados' : 'Sin Arrestos'}
                      </div>
                    </div>

                    {/* Multas */}
                    <div style={{ 
                      padding: '20px', 
                      borderRadius: '4px', 
                      background: selectedCiudadano.multas && selectedCiudadano.multas.length > 0 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)',
                      border: `2px solid ${selectedCiudadano.multas && selectedCiudadano.multas.length > 0 ? '#f59e0b' : '#22c55e'}`,
                      borderLeft: `4px solid ${selectedCiudadano.multas && selectedCiudadano.multas.length > 0 ? '#f59e0b' : '#22c55e'}`
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Icon name="Fine" className="icon-xl" style={{ color: selectedCiudadano.multas && selectedCiudadano.multas.length > 0 ? '#f59e0b' : '#22c55e' }} />
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginBottom: '4px' }}>
                        {selectedCiudadano.multas ? selectedCiudadano.multas.length : 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                        {selectedCiudadano.multas && selectedCiudadano.multas.length > 0 ? 'Multas Registradas' : 'Sin Multas'}
                      </div>
                    </div>

                    {/* Denuncias */}
                    <div style={{ 
                      padding: '20px', 
                      borderRadius: '4px', 
                      background: selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)',
                      border: `2px solid ${selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 ? '#f59e0b' : '#22c55e'}`,
                      borderLeft: `4px solid ${selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 ? '#f59e0b' : '#22c55e'}`
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Icon name="Report" className="icon-xl" style={{ color: selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 ? '#f59e0b' : '#22c55e' }} />
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginBottom: '4px' }}>
                        {selectedCiudadano.denuncias ? selectedCiudadano.denuncias.length : 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                        {selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 ? 'Denuncias Involucradas' : 'Sin Denuncias'}
                      </div>
                    </div>

                    {/* Estado General */}
                    <div style={{ 
                      padding: '20px', 
                      borderRadius: '4px', 
                      background: (selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                  (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                  (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)'
                                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%)',
                      border: `2px solid ${(selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                          (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                          (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                                          ? '#ef4444' : '#22c55e'}`,
                      borderLeft: `4px solid ${(selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                               (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                               (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                                               ? '#ef4444' : '#22c55e'}`,
                      boxShadow: (selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                 (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                 (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0)
                                 ? '0 0 20px rgba(239, 68, 68, 0.3)'
                                 : '0 0 20px rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Icon 
                          name={(selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                                ? 'Criminal' : 'Clean'} 
                          className="icon-xl" 
                          style={{ color: (selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                                          (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                                          (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                                          ? '#ef4444' : '#22c55e' }} 
                        />
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        {(selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                         (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                         (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                         ? 'CON ANTECEDENTES' : 'SIN ANTECEDENTES'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {(selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0) || 
                         (selectedCiudadano.multas && selectedCiudadano.multas.length > 0) || 
                         (selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0) 
                         ? 'Registro Policial Activo' : 'Expediente Limpio'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Policial (si es oficial) */}
                {selectedCiudadano.oficial && (
                  <div className="info-section alert-info">
                    <h3><Icon name="Officer" className="icon-md" /> INFORMACIÓN POLICIAL</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Placa:</label>
                        <span><strong>{selectedCiudadano.oficial.placa}</strong></span>
                      </div>
                      <div className="info-item">
                        <label>Rango:</label>
                        <span><strong>{selectedCiudadano.oficial.rango}</strong></span>
                      </div>
                      <div className="info-item">
                        <label>Departamento:</label>
                        <span>{selectedCiudadano.oficial.departamento}</span>
                      </div>
                      {selectedCiudadano.oficial.division && (
                        <div className="info-item">
                          <label>División:</label>
                          <span>{selectedCiudadano.oficial.division}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Estado:</label>
                        <span className={`badge ${selectedCiudadano.oficial.estado === 'activo' ? 'badge-success' : 'badge-secondary'}`}>
                          {selectedCiudadano.oficial.estado}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Fecha Ingreso:</label>
                        <span>{new Date(selectedCiudadano.oficial.fecha_ingreso).toLocaleDateString()}</span>
                      </div>
                      {selectedCiudadano.oficial.telefono_servicio && (
                        <div className="info-item">
                          <label>Teléfono Servicio:</label>
                          <span>{selectedCiudadano.oficial.telefono_servicio}</span>
                        </div>
                      )}
                    </div>
                    {selectedCiudadano.oficial.especialidades && (
                      <div style={{ marginTop: '15px' }}>
                        <label><strong>Especialidades:</strong></label>
                        <p>{selectedCiudadano.oficial.especialidades}</p>
                      </div>
                    )}
                    {selectedCiudadano.oficial.certificaciones && (
                      <div style={{ marginTop: '10px' }}>
                        <label><strong>Certificaciones:</strong></label>
                        <p>{selectedCiudadano.oficial.certificaciones}</p>
                      </div>
                    )}
                    {selectedCiudadano.oficial.notas && (
                      <div style={{ marginTop: '10px' }}>
                        <label><strong>Notas:</strong></label>
                        <p>{selectedCiudadano.oficial.notas}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Estado de Búsqueda y Captura */}
                <div className="info-section" style={{
                  background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
                  border: '1px solid #1e3a5f',
                  borderLeft: '4px solid #dc2626'
                }}>
                  <h3><Icon name="Wanted" className="icon-md icon-alert" /> Estado Policial</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Toggle: En Búsqueda y Captura */}
                    <div style={{
                      padding: '20px',
                      background: enBusqueda 
                        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(127, 29, 29, 0.1) 100%)'
                        : 'rgba(30, 58, 95, 0.1)',
                      border: `2px solid ${enBusqueda ? '#dc2626' : 'rgba(30, 58, 95, 0.3)'}`,
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enBusqueda ? '16px' : '0' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <Icon name="Wanted" className="icon-md" style={{ color: enBusqueda ? '#dc2626' : '#64748b' }} />
                            <span style={{ 
                              fontSize: '15px', 
                              fontWeight: '700', 
                              color: enBusqueda ? '#fca5a5' : '#e2e8f0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              En Búsqueda y Captura
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '44px' }}>
                            {enBusqueda ? 'Ciudadano actualmente buscado por las autoridades' : 'Ciudadano no está siendo buscado'}
                          </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <label style={{ 
                          position: 'relative', 
                          display: 'inline-block', 
                          width: '60px', 
                          height: '32px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}>
                          <input
                            type="checkbox"
                            checked={enBusqueda}
                            onChange={(e) => setEnBusqueda(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            inset: 0,
                            background: enBusqueda ? '#dc2626' : '#334155',
                            borderRadius: '32px',
                            transition: 'all 0.3s',
                            border: `2px solid ${enBusqueda ? '#ef4444' : '#475569'}`,
                            boxShadow: enBusqueda ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '',
                              height: '24px',
                              width: '24px',
                              left: enBusqueda ? '32px' : '4px',
                              bottom: '2px',
                              background: '#ffffff',
                              borderRadius: '50%',
                              transition: 'all 0.3s',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }} />
                          </span>
                        </label>
                      </div>
                      
                      {/* Motivo de búsqueda */}
                      {enBusqueda && (
                        <div style={{
                          marginTop: '16px',
                          padding: '16px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '4px',
                          border: '1px solid rgba(220, 38, 38, 0.3)',
                          animation: 'slideDown 0.3s ease-out'
                        }}>
                          <label style={{ 
                            display: 'block',
                            fontSize: '11px', 
                            color: '#fca5a5', 
                            marginBottom: '8px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            ⚠️ Motivo de la Búsqueda (Obligatorio)
                          </label>
                          <textarea
                            className="input motivo-textarea"
                            placeholder="Especifica el motivo de la búsqueda y captura..."
                            value={motivoBusqueda}
                            onChange={(e) => setMotivoBusqueda(e.target.value)}
                            rows="3"
                            style={{
                              width: '100%',
                              background: 'rgba(15, 20, 25, 0.9)',
                              border: '1px solid rgba(220, 38, 38, 0.5)',
                              color: '#e2e8f0',
                              padding: '12px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Toggle: Peligroso */}
                    <div style={{
                      padding: '20px',
                      background: esPeligroso 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.1) 100%)'
                        : 'rgba(30, 58, 95, 0.1)',
                      border: `2px solid ${esPeligroso ? '#f59e0b' : 'rgba(30, 58, 95, 0.3)'}`,
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <Icon name="Dangerous" className="icon-md" style={{ color: esPeligroso ? '#f59e0b' : '#64748b' }} />
                            <span style={{ 
                              fontSize: '15px', 
                              fontWeight: '700', 
                              color: esPeligroso ? '#fbbf24' : '#e2e8f0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Individuo Peligroso
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '44px' }}>
                            {esPeligroso ? 'Precaución: Individuo considerado peligroso' : 'Individuo no clasificado como peligroso'}
                          </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <label style={{ 
                          position: 'relative', 
                          display: 'inline-block', 
                          width: '60px', 
                          height: '32px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}>
                          <input
                            type="checkbox"
                            checked={esPeligroso}
                            onChange={(e) => setEsPeligroso(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            inset: 0,
                            background: esPeligroso ? '#f59e0b' : '#334155',
                            borderRadius: '32px',
                            transition: 'all 0.3s',
                            border: `2px solid ${esPeligroso ? '#fbbf24' : '#475569'}`,
                            boxShadow: esPeligroso ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '',
                              height: '24px',
                              width: '24px',
                              left: esPeligroso ? '32px' : '4px',
                              bottom: '2px',
                              background: '#ffffff',
                              borderRadius: '50%',
                              transition: 'all 0.3s',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }} />
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <button 
                      onClick={handleSaveEstado}
                      disabled={saving}
                      style={{
                        padding: '14px 24px',
                        background: saving ? '#475569' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        border: '2px solid #3b82f6',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: saving ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (!saving) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = saving ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)';
                      }}
                    >
                      {saving ? (
                        <>
                          <span style={{ 
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '2px solid #ffffff',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Icon name="System" className="icon-sm" />
                          Guardar Estado Policial
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Información Personal */}
                <div className="info-section">
                  <h3><Icon name="Citizen" className="icon-md" /> Información Personal</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>DNI:</label>
                      <span>{selectedCiudadano.ciudadano?.dni}</span>
                    </div>
                    <div className="info-item">
                      <label>Nombres:</label>
                      <span>{selectedCiudadano.ciudadano?.nombres}</span>
                    </div>
                    <div className="info-item">
                      <label>Apellidos:</label>
                      <span>{selectedCiudadano.ciudadano?.apellidos}</span>
                    </div>
                    <div className="info-item">
                      <label>Fecha Nacimiento:</label>
                      <span>{selectedCiudadano.ciudadano?.fecha_nacimiento || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Nacionalidad:</label>
                      <span>{selectedCiudadano.ciudadano?.nacionalidad || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Sexo:</label>
                      <span>{selectedCiudadano.ciudadano?.sexo || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Dirección:</label>
                      <span>{selectedCiudadano.ciudadano?.direccion || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Teléfono:</label>
                      <span>{selectedCiudadano.ciudadano?.telefono || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Licencias */}
                <div className="info-section">
                  <h3><Icon name="License" className="icon-md" /> Licencias</h3>
                  <div className="badges-container">
                    {selectedCiudadano.ciudadano?.licencia_conducir ? (
                      <span className="badge badge-success">Licencia de Conducir</span>
                    ) : (
                      <span className="badge badge-danger">Sin Licencia de Conducir</span>
                    )}
                    {selectedCiudadano.ciudadano?.licencia_armas ? (
                      <span className="badge badge-success">Licencia de Armas</span>
                    ) : (
                      <span className="badge badge-danger">Sin Licencia de Armas</span>
                    )}
                  </div>
                </div>

                {/* Arrestos */}
                {selectedCiudadano.arrestos && selectedCiudadano.arrestos.length > 0 && (
                  <div className="info-section">
                    <h3><Icon name="Arrest" className="icon-md" /> Arrestos ({selectedCiudadano.arrestos.length})</h3>
                    <div className="list-items">
                      {selectedCiudadano.arrestos.map((arresto, index) => (
                        <div key={index} className="list-item">
                          <div>
                            <strong>{arresto.articulos || 'Sin artículos'}</strong>
                            <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
                              Multa: ${arresto.multa_total} | Tiempo: {arresto.tiempo_total_minutos} meses
                            </p>
                            <span style={{ fontSize: '0.85em', color: '#999' }}>
                              {new Date(arresto.fecha_arresto).toLocaleString()}
                            </span>
                          </div>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteArresto(arresto.id)}
                            title="Eliminar arresto"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multas */}
                {selectedCiudadano.multas && selectedCiudadano.multas.length > 0 && (
                  <div className="info-section">
                    <h3><Icon name="Fine" className="icon-md" /> Multas ({selectedCiudadano.multas.length})</h3>
                    <div className="list-items">
                      {selectedCiudadano.multas.map((multa, index) => (
                        <div key={index} className="list-item">
                          <div>
                            <strong>{multa.motivo}</strong>
                            <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
                              Monto: ${multa.monto}
                            </p>
                            <span style={{ fontSize: '0.85em', color: '#999' }}>
                              {new Date(multa.fecha).toLocaleString()}
                            </span>
                          </div>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteMulta(multa.id)}
                            title="Eliminar multa"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehículos Registrados - Sección Destacada */}
                <div className="info-section" style={{ 
                  background: selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)' 
                    : 'linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(15, 20, 25, 0.8) 100%)',
                  borderLeftColor: selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 ? '#22c55e' : '#64748b'
                }}>
                  <h3><Icon name="Vehicle" className="icon-md" /> Vehículos Registrados</h3>
                  
                  {/* Contador de Vehículos */}
                  <div style={{ 
                    padding: '16px', 
                    background: 'rgba(30, 58, 95, 0.2)', 
                    borderRadius: '4px',
                    border: '1px solid rgba(30, 58, 95, 0.4)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `2px solid ${selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 ? '#22c55e' : '#64748b'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 ? '#22c55e' : '#64748b',
                      fontFamily: 'monospace'
                    }}>
                      {selectedCiudadano.vehiculos ? selectedCiudadano.vehiculos.length : 0}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                        Total de Vehículos
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 
                          ? `${selectedCiudadano.vehiculos.length} vehículo${selectedCiudadano.vehiculos.length > 1 ? 's' : ''} registrado${selectedCiudadano.vehiculos.length > 1 ? 's' : ''} a nombre del ciudadano`
                          : 'No hay vehículos registrados a nombre de este ciudadano'}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Vehículos */}
                  {selectedCiudadano.vehiculos && selectedCiudadano.vehiculos.length > 0 ? (
                    <div className="list-items">
                      {selectedCiudadano.vehiculos.map((vehiculo, index) => (
                        <div key={index} className="list-item" style={{ borderLeftColor: '#22c55e' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ 
                                padding: '4px 12px', 
                                background: 'rgba(34, 197, 94, 0.2)', 
                                border: '1px solid #22c55e',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#22c55e',
                                fontFamily: 'monospace',
                                letterSpacing: '1px'
                              }}>
                                {vehiculo.patente || vehiculo.matricula}
                              </span>
                              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                                REGISTRADO
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '8px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marca</div>
                                <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{vehiculo.marca || 'N/A'}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modelo</div>
                                <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{vehiculo.modelo || 'N/A'}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</div>
                                <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{vehiculo.color || 'N/A'}</div>
                              </div>
                              {vehiculo.fecha_registro && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha Registro</div>
                                  <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                                    {new Date(vehiculo.fecha_registro).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '32px', 
                      textAlign: 'center', 
                      background: 'rgba(100, 116, 139, 0.05)',
                      borderRadius: '4px',
                      border: '1px dashed rgba(100, 116, 139, 0.3)'
                    }}>
                      <Icon name="Vehicle" className="icon-xl" style={{ color: '#64748b', opacity: 0.5, marginBottom: '12px' }} />
                      <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                        Sin Vehículos Registrados
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        No hay vehículos asociados a este ciudadano
                      </div>
                    </div>
                  )}
                </div>

                {/* Denuncias */}
                {selectedCiudadano.denuncias && selectedCiudadano.denuncias.length > 0 && (
                  <div className="info-section">
                    <h3><Icon name="Report" className="icon-md" /> Denuncias Involucradas ({selectedCiudadano.denuncias.length})</h3>
                    <div className="list-items">
                      {selectedCiudadano.denuncias.map((denuncia, index) => (
                        <div key={index} className="list-item">
                          <div>
                            <strong>{denuncia.motivo || 'Sin motivo especificado'}</strong>
                            <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
                              {denuncia.dni_denunciante === selectedCiudadano.ciudadano.dni ? (
                                <span className="badge badge-info">Denunciante</span>
                              ) : (
                                <span className="badge badge-warning">Acusado</span>
                              )}
                              {' '}Estado: <span className="badge">{denuncia.estado || 'pendiente'}</span>
                            </p>
                            <span style={{ fontSize: '0.85em', color: '#999' }}>
                              {new Date(denuncia.fecha_denuncia || denuncia.fecha).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orden de Búsqueda */}
                {selectedCiudadano.ordenBusqueda && (
                  <div className="info-section alert-danger">
                    <h3><Icon name="Wanted" className="icon-md icon-wanted" /> ORDEN DE BÚSQUEDA Y CAPTURA</h3>
                    <p><strong>Motivo:</strong> {selectedCiudadano.ordenBusqueda.motivo}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedCiudadano.ordenBusqueda.fecha_emision).toLocaleDateString()}</p>
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
