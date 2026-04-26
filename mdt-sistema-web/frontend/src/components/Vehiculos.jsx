import { useState, useEffect } from 'react';
import { api } from '../config/api';
import './CommonStyles.css';
import './Vehiculos.css';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      const response = await api.get('/api/vehiculos');
      if (response.success) setVehiculos(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (matricula) => {
    try {
      const response = await api.get(`/api/vehiculos/${matricula}`);
      if (response.success) {
        setSelectedVehiculo(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredVehiculos = vehiculos.filter(v =>
    v.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🚗 Gestión de Vehículos</h1>
          <p>Consulta y gestiona vehículos registrados</p>
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
          placeholder="Buscar por matrícula, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVehiculos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
          </svg>
          <h3>No hay vehículos registrados</h3>
          <p>Los vehículos aparecerán aquí</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Marca/Modelo</th>
                <th>Color</th>
                <th>Propietario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehiculos.map((vehiculo) => (
                <tr key={vehiculo.matricula}>
                  <td><strong>{vehiculo.matricula}</strong></td>
                  <td>{vehiculo.marca} {vehiculo.modelo}</td>
                  <td>{vehiculo.color}</td>
                  <td>{vehiculo.nombres} {vehiculo.apellidos}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Ver detalles"
                      onClick={() => viewDetails(vehiculo.matricula)}
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
      {showModal && selectedVehiculo && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Vehículo</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="vehiculo-details">
                <div className="info-section">
                  <h3>🚗 Información del Vehículo</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Matrícula:</label>
                      <span>{selectedVehiculo.vehiculo?.matricula}</span>
                    </div>
                    <div className="info-item">
                      <label>Marca:</label>
                      <span>{selectedVehiculo.vehiculo?.marca}</span>
                    </div>
                    <div className="info-item">
                      <label>Modelo:</label>
                      <span>{selectedVehiculo.vehiculo?.modelo}</span>
                    </div>
                    <div className="info-item">
                      <label>Color:</label>
                      <span>{selectedVehiculo.vehiculo?.color}</span>
                    </div>
                    <div className="info-item">
                      <label>Año:</label>
                      <span>{selectedVehiculo.vehiculo?.anio || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Tipo:</label>
                      <span>{selectedVehiculo.vehiculo?.tipo_vehiculo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Propietario</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>DNI:</label>
                      <span>{selectedVehiculo.vehiculo?.dni}</span>
                    </div>
                    <div className="info-item">
                      <label>Nombre:</label>
                      <span>{selectedVehiculo.vehiculo?.nombres} {selectedVehiculo.vehiculo?.apellidos}</span>
                    </div>
                  </div>
                </div>

                {selectedVehiculo.robado && (
                  <div className="info-section alert-danger">
                    <h3>🚨 VEHÍCULO REPORTADO COMO ROBADO</h3>
                    <p><strong>Fecha:</strong> {new Date(selectedVehiculo.robado.fecha_reporte).toLocaleDateString()}</p>
                    <p><strong>Detalles:</strong> {selectedVehiculo.robado.detalles}</p>
                  </div>
                )}

                {selectedVehiculo.antecedentes && selectedVehiculo.antecedentes.length > 0 && (
                  <div className="info-section">
                    <h3>📋 Antecedentes ({selectedVehiculo.antecedentes.length})</h3>
                    <div className="list-items">
                      {selectedVehiculo.antecedentes.map((ant, index) => (
                        <div key={index} className="list-item">
                          <strong>{ant.tipo}</strong>
                          <span>{new Date(ant.fecha).toLocaleDateString()}</span>
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
