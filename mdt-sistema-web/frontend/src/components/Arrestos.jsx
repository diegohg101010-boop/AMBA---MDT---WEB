import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CommonStyles.css';
import './Arrestos.css';

export default function Arrestos() {
  const [arrestos, setArrestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArresto, setSelectedArresto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [codigoPenal, setCodigoPenal] = useState([]);
  const [selectedArticulos, setSelectedArticulos] = useState([]);
  const { canCreate } = useAuth();
  
  const [formData, setFormData] = useState({
    dni_detenido: '',
    articulos: '',
    oficial_1_dni: '',
    oficial_2_dni: '',
    oficial_3_dni: '',
    oficial_4_dni: '',
    oficial_5_dni: '',
    oficial_6_dni: '',
    evidencias: ''
  });

  useEffect(() => {
    loadArrestos();
    loadCodigoPenal();
  }, []);

  const loadCodigoPenal = async () => {
    try {
      const response = await api.get('/api/codigo-penal');
      console.log('Respuesta código penal:', response);
      if (response.success) {
        // El código penal viene como objeto con claves I, II, III, etc.
        const todosArticulos = [];
        Object.values(response.data).forEach(capitulo => {
          if (capitulo.articulos && Array.isArray(capitulo.articulos)) {
            capitulo.articulos.forEach(articulo => {
              todosArticulos.push({
                codigo: articulo.codigo,
                infraccion: articulo.infraccion,
                categoria: capitulo.nombre
              });
            });
          }
        });
        console.log('Artículos procesados:', todosArticulos.length);
        setCodigoPenal(todosArticulos);
      }
    } catch (error) {
      console.error('Error al cargar código penal:', error);
    }
  };

  const loadArrestos = async () => {
    try {
      const response = await api.get('/api/arrestos');
      if (response.success) setArrestos(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await api.get(`/api/arrestos/${id}`);
      if (response.success) {
        setSelectedArresto(response.data);
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
        setFormData({...formData, evidencias: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.evidencias) {
      alert('Debes subir una imagen de evidencia');
      return;
    }
    if (selectedArticulos.length === 0) {
      alert('Debes seleccionar al menos un artículo del código penal');
      return;
    }
    
    // Construir string de artículos en el formato esperado
    const articulosString = selectedArticulos.map(a => a.codigo).join(' - ');
    
    try {
      const response = await api.post('/api/arrestos', {
        ...formData,
        articulos: articulosString
      });
      if (response.success) {
        alert('Arresto registrado exitosamente');
        setShowCreateForm(false);
        setImagePreview(null);
        setSelectedArticulos([]);
        setFormData({
          dni_detenido: '',
          articulos: '',
          oficial_1_dni: '',
          oficial_2_dni: '',
          oficial_3_dni: '',
          oficial_4_dni: '',
          oficial_5_dni: '',
          oficial_6_dni: '',
          evidencias: ''
        });
        loadArrestos();
      }
    } catch (error) {
      alert(error.message || 'Error al registrar arresto');
    }
  };

  const handleAddArticulo = (codigo) => {
    const articulo = codigoPenal.find(a => a.codigo === codigo);
    if (articulo && !selectedArticulos.find(a => a.codigo === codigo)) {
      setSelectedArticulos([...selectedArticulos, articulo]);
    }
  };

  const handleRemoveArticulo = (codigo) => {
    setSelectedArticulos(selectedArticulos.filter(a => a.codigo !== codigo));
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>⛓️ Gestión de Arrestos</h1>
          <p>Consulta y gestiona arrestos realizados</p>
        </div>
        {canCreate('arrestos') && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + Nuevo Arresto
          </button>
        )}
      </div>

      {arrestos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <h3>No hay arrestos registrados</h3>
          <p>Los arrestos aparecerán aquí</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>DNI Detenido</th>
                <th>Oficial</th>
                <th>Motivo</th>
                <th>Meses de Prisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {arrestos.map((arresto) => {
                // Extraer el primer oficial del string de oficiales_a_cargo
                const primerOficial = arresto.oficiales_a_cargo ? arresto.oficiales_a_cargo.split(',')[0].trim() : 'N/A';
                // Extraer solo los códigos de artículos para mostrar en la tabla
                const articulosResumen = arresto.articulos ? 
                  arresto.articulos.split('\n').map(a => a.split(':')[0]).join(', ').substring(0, 50) + '...' 
                  : 'N/A';
                // Mostrar directamente los minutos como meses
                const mesesPrision = arresto.tiempo_total_minutos || arresto.tiempo_prision || 0;
                
                return (
                  <tr key={arresto.id}>
                    <td><strong>#{arresto.id}</strong></td>
                    <td>{new Date(arresto.fecha_arresto).toLocaleDateString()}</td>
                    <td>{arresto.dni_detenido}</td>
                    <td>{primerOficial}</td>
                    <td className="motivo-cell">{articulosResumen}</td>
                    <td>{mesesPrision} {mesesPrision === 1 ? 'mes' : 'meses'}</td>
                    <td>
                      <button 
                        className="btn-icon" 
                        title="Ver detalles"
                        onClick={() => viewDetails(arresto.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario crear arresto */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Arresto</h2>
              <button className="btn-close" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label>DNI del Detenido *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="8 dígitos"
                    value={formData.dni_detenido}
                    onChange={(e) => setFormData({...formData, dni_detenido: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Artículos del Código Penal *</label>
                  <select
                    className="input"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddArticulo(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Selecciona un artículo...</option>
                    {codigoPenal.map((articulo) => (
                      <option key={articulo.codigo} value={articulo.codigo}>
                        {articulo.codigo} - {articulo.infraccion}
                      </option>
                    ))}
                  </select>
                  
                  {selectedArticulos.length > 0 && (
                    <div className="articulos-seleccionados-container">
                      <strong className="articulos-seleccionados-title">Artículos seleccionados:</strong>
                      <div className="articulos-seleccionados-list">
                        {selectedArticulos.map((articulo) => (
                          <div key={articulo.codigo} className="articulo-tag">
                            <span className="articulo-tag-codigo">{articulo.codigo}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveArticulo(articulo.codigo)}
                              className="articulo-tag-remove"
                              title="Eliminar"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <small>Selecciona los artículos aplicables al arresto</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI Oficial 1 *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_1_dni}
                      onChange={(e) => setFormData({...formData, oficial_1_dni: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI Oficial 2</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_2_dni}
                      onChange={(e) => setFormData({...formData, oficial_2_dni: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI Oficial 3</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_3_dni}
                      onChange={(e) => setFormData({...formData, oficial_3_dni: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI Oficial 4</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_4_dni}
                      onChange={(e) => setFormData({...formData, oficial_4_dni: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI Oficial 5</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_5_dni}
                      onChange={(e) => setFormData({...formData, oficial_5_dni: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI Oficial 6</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8 dígitos"
                      value={formData.oficial_6_dni}
                      onChange={(e) => setFormData({...formData, oficial_6_dni: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Imagen de Evidencia *</label>
                  <input
                    type="file"
                    className="input"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
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
                    Registrar Arresto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedArresto && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Arresto #{selectedArresto.arresto?.id}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="arresto-details">
                <div className="info-section">
                  <h3>⛓️ Información del Arresto</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>ID Arresto:</label>
                      <span>#{selectedArresto.arresto?.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Fecha y Hora:</label>
                      <span>{new Date(selectedArresto.arresto?.fecha_arresto).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Oficial Principal:</label>
                      <span>{selectedArresto.arresto?.oficiales_a_cargo ? selectedArresto.arresto.oficiales_a_cargo.split(',')[0].trim() : 'N/A'}</span>
                    </div>
                    {selectedArresto.arresto?.oficiales_a_cargo && selectedArresto.arresto.oficiales_a_cargo.includes(',') && (
                      <div className="info-item" style={{gridColumn: '1 / -1'}}>
                        <label>Oficiales Adicionales:</label>
                        <span>{selectedArresto.arresto.oficiales_a_cargo.split(',').slice(1).join(', ')}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Tiempo de Prisión:</label>
                      <span>{selectedArresto.arresto?.tiempo_total_minutos || selectedArresto.arresto?.tiempo_prision} meses</span>
                    </div>
                    <div className="info-item">
                      <label>Multa Total:</label>
                      <span>${selectedArresto.arresto?.multa_total || 0}</span>
                    </div>
                    {selectedArresto.arresto?.es_ck === 1 && (
                      <div className="info-item">
                        <label>Tipo:</label>
                        <span className="badge" style={{backgroundColor: '#e74c3c'}}>CK (Character Kill)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Detenido</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>DNI:</label>
                      <span>{selectedArresto.arresto?.dni_detenido}</span>
                    </div>
                    {selectedArresto.ciudadano && (
                      <>
                        <div className="info-item">
                          <label>Nombre:</label>
                          <span>{selectedArresto.ciudadano.nombres} {selectedArresto.ciudadano.apellidos}</span>
                        </div>
                        <div className="info-item">
                          <label>Nacionalidad:</label>
                          <span>{selectedArresto.ciudadano.nacionalidad || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <label>Sexo:</label>
                          <span>{selectedArresto.ciudadano.sexo || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h3>📝 Artículos Aplicados</h3>
                  <pre className="description-text" style={{whiteSpace: 'pre-wrap'}}>{selectedArresto.arresto?.articulos || 'N/A'}</pre>
                </div>
                
                {selectedArresto.arresto?.sanciones_especiales && (
                  <div className="info-section">
                    <h3>⚠️ Sanciones Especiales</h3>
                    <p className="description-text">{selectedArresto.arresto.sanciones_especiales}</p>
                  </div>
                )}

                {selectedArresto.arresto?.ubicacion && (
                  <div className="info-section">
                    <h3>📍 Ubicación</h3>
                    <p className="description-text">{selectedArresto.arresto.ubicacion}</p>
                  </div>
                )}

                {selectedArresto.arresto?.notas && (
                  <div className="info-section">
                    <h3>📌 Notas Adicionales</h3>
                    <pre className="notes-text">{selectedArresto.arresto.notas}</pre>
                  </div>
                )}

                {(selectedArresto.arresto?.imagen_url || selectedArresto.arresto?.evidencias) && (
                  <div className="info-section">
                    <h3>📸 Evidencia</h3>
                    <div className="evidence-image">
                      <img src={selectedArresto.arresto.imagen_url || selectedArresto.arresto.evidencias} alt="Evidencia" />
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
