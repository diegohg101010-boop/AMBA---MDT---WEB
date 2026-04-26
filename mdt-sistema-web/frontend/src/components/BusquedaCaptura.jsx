import { useState, useEffect } from 'react';
import { api } from '../config/api';
import './CommonStyles.css';
import './BusquedaCaptura.css';

export default function BusquedaCaptura() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const resolveMotivo = (orden) => {
    if (!orden) return 'Sin motivo';
    
    // Priorizar el campo 'motivo' que es el estándar
    if (orden.motivo && orden.motivo.trim()) {
      return orden.motivo;
    }
    
    // Intentar otros campos alternativos
    if (orden.motivo_busqueda && orden.motivo_busqueda.trim()) {
      return orden.motivo_busqueda;
    }
    
    if (orden.motivoBusqueda && orden.motivoBusqueda.trim()) {
      return orden.motivoBusqueda;
    }
    
    if (orden.notas && orden.notas.trim()) {
      return orden.notas;
    }
    
    // Si es una orden sin número formal
    if (orden.numero_orden?.startsWith('SIN-ORDEN-')) {
      return 'Ciudadano marcado en búsqueda';
    }
    
    return 'Sin motivo especificado';
  };

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      const response = await api.get('/api/busqueda-captura');
      if (response.success) setOrdenes(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (numero) => {
    try {
      // Si es una orden sin número formal (ciudadano marcado), mostrar info básica
      if (numero.startsWith('SIN-ORDEN-')) {
        const dni = numero.replace('SIN-ORDEN-', '');
        const response = await api.get(`/api/ciudadanos/${dni}`);
        if (response.success) {
          const motivoCiudadano =
            response.data.ciudadano?.motivo_busqueda ||
            response.data.ciudadano?.motivoBusqueda ||
            response.data.ciudadano?.notas;
          const motivo = motivoCiudadano?.trim()
            ? motivoCiudadano
            : 'Ciudadano marcado en búsqueda';
          // Crear un objeto de orden simulado para el modal
          setSelectedOrden({
            orden: {
              numero_orden: numero,
              dni_buscado: dni,
              nombres: response.data.ciudadano.nombres,
              apellidos: response.data.ciudadano.apellidos,
              nacionalidad: response.data.ciudadano.nacionalidad,
              sexo: response.data.ciudadano.sexo,
              es_peligroso: response.data.ciudadano.es_peligroso,
              motivo,
              delitos: 'N/A',
              nivel_peligrosidad: 'medio',
              estado: 'activa',
              fecha_emision: new Date().toISOString(),
              oficial_emite: 'Sistema',
              descripcion_fisica: null,
              ultima_ubicacion: null,
              notas: 'Este ciudadano fue marcado manualmente en el sistema sin una orden formal.'
            },
            avistamientos: [],
            intentos: []
          });
          setShowModal(true);
        }
      } else {
        // Orden formal normal
        const response = await api.get(`/api/busqueda-captura/${numero}`);
        if (response.success) {
          setSelectedOrden(response.data);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🚨 Búsqueda y Captura</h1>
          <p>Órdenes de búsqueda activas</p>
        </div>
      </div>

      {ordenes.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <h3>No hay órdenes de búsqueda</h3>
          <p>Las órdenes activas aparecerán aquí</p>
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenes.map((orden) => (
            <div key={orden.numero_orden} className="orden-card">
              <div className="orden-header">
                <span className="orden-numero">
                  {orden.numero_orden.startsWith('SIN-ORDEN-') ? '⚠️ MARCADO' : `#${orden.numero_orden}`}
                </span>
                <div className="orden-badges">
                  <span className={`badge ${orden.estado === 'activa' ? 'badge-danger' : 'badge-secondary'}`}>
                    {orden.estado}
                  </span>
                  {orden.es_peligroso === 1 && (
                    <span className="badge badge-warning">⚠️ PELIGROSO</span>
                  )}
                </div>
              </div>
              
              <div className="orden-body">
                <h3>{orden.nombres} {orden.apellidos}</h3>
                <p className="orden-dni">DNI: {orden.dni_buscado}</p>
                <p className="orden-motivo">{resolveMotivo(orden)}</p>
                {!orden.numero_orden.startsWith('SIN-ORDEN-') && (
                  <p className="orden-fecha">
                    Emitida: {new Date(orden.fecha_emision).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="orden-footer">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => viewDetails(orden.numero_orden)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedOrden && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚨 Orden de Búsqueda</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="orden-details">
                {selectedOrden.orden?.estado === 'activa' && (
                  <div className="alert-danger">
                    <h3>⚠️ ORDEN ACTIVA - PROCEDER CON PRECAUCIÓN</h3>
                    {selectedOrden.orden?.es_peligroso === 1 && (
                      <p style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                        🚨 INDIVIDUO CONSIDERADO PELIGROSO 🚨
                      </p>
                    )}
                  </div>
                )}

                <div className="info-section">
                  <h3>📋 Información de la Orden</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Estado:</label>
                      <span className={`badge ${selectedOrden.orden?.estado === 'activa' ? 'badge-danger' : 'badge-secondary'}`}>
                        {selectedOrden.orden?.estado}
                      </span>
                    </div>
                    {!selectedOrden.orden?.numero_orden.startsWith('SIN-ORDEN-') && (
                      <div className="info-item">
                        <label>Fecha Emisión:</label>
                        <span>{new Date(selectedOrden.orden?.fecha_emision).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Persona Buscada</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>DNI:</label>
                      <span>{selectedOrden.orden?.dni_buscado}</span>
                    </div>
                    <div className="info-item">
                      <label>Nombre:</label>
                      <span>{selectedOrden.orden?.nombres} {selectedOrden.orden?.apellidos}</span>
                    </div>
                    <div className="info-item">
                      <label>Nacionalidad:</label>
                      <span>{selectedOrden.orden?.nacionalidad || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Sexo:</label>
                      <span>{selectedOrden.orden?.sexo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>📝 Motivo de Búsqueda</h3>
                  <p className="description-text">{resolveMotivo(selectedOrden.orden)}</p>
                </div>

                {selectedOrden.orden?.descripcion_fisica && (
                  <div className="info-section">
                    <h3>👁️ Descripción Física</h3>
                    <p className="description-text">{selectedOrden.orden.descripcion_fisica}</p>
                  </div>
                )}

                {selectedOrden.orden?.ultima_ubicacion && (
                  <div className="info-section">
                    <h3>📍 Última Ubicación Conocida</h3>
                    <p className="description-text">{selectedOrden.orden.ultima_ubicacion}</p>
                  </div>
                )}

                {selectedOrden.avistamientos && selectedOrden.avistamientos.length > 0 && (
                  <div className="info-section">
                    <h3>👁️ Avistamientos ({selectedOrden.avistamientos.length})</h3>
                    <div className="list-items">
                      {selectedOrden.avistamientos.map((avist, index) => (
                        <div key={index} className="list-item">
                          <div>
                            <strong>{avist.ubicacion}</strong>
                            <p className="item-detail">{avist.descripcion}</p>
                            <small>Reportado por: {avist.oficial_reporta}</small>
                          </div>
                          <span>{new Date(avist.fecha_avistamiento).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrden.intentos && selectedOrden.intentos.length > 0 && (
                  <div className="info-section">
                    <h3>🎯 Intentos de Captura ({selectedOrden.intentos.length})</h3>
                    <div className="list-items">
                      {selectedOrden.intentos.map((intento, index) => (
                        <div key={index} className="list-item">
                          <div>
                            <strong>{intento.ubicacion}</strong>
                            <p className="item-detail">Resultado: {intento.resultado}</p>
                            <p className="item-detail">{intento.detalles}</p>
                            <small>Oficial: {intento.oficial}</small>
                          </div>
                          <span>{new Date(intento.fecha_intento).toLocaleString()}</span>
                        </div>
                      ))}
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
