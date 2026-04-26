import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CommonStyles.css';
import './Multas.css';

export default function Multas() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMulta, setSelectedMulta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [codigoPenal, setCodigoPenal] = useState([]);
  const [selectedArticulos, setSelectedArticulos] = useState([]);
  const { canCreate } = useAuth();
  
  const [formData, setFormData] = useState({
    dni_dueno: '',
    dni_oficial: '',
    notas: '',
    evidencias: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadMultas();
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
                multa: articulo.multa,
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

  const loadMultas = async () => {
    try {
      const response = await api.get('/api/multas');
      if (response.success) setMultas(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (multa) => {
    setSelectedMulta(multa);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = [];
    const base64Images = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        base64Images.push(reader.result);
        
        if (previews.length === files.length) {
          setImagePreviews(previews);
          setFormData({...formData, evidencias: base64Images});
        }
      };
      reader.readAsDataURL(file);
    });
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

  const calcularMontoTotal = () => {
    return selectedArticulos.reduce((total, articulo) => total + (articulo.multa || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedArticulos.length === 0) {
      alert('Debes seleccionar al menos un artículo del código penal');
      return;
    }
    
    if (!formData.dni_oficial || formData.dni_oficial.trim() === '') {
      alert('Debes ingresar el DNI del oficial');
      return;
    }
    
    const articulosArray = selectedArticulos.map(a => a.codigo.replace('Art.', '').trim());
    
    console.log('[MULTAS] Artículos seleccionados:', selectedArticulos);
    console.log('[MULTAS] Array de artículos:', articulosArray);
    
    try {
      const payload = {
        dni_dueno: formData.dni_dueno,
        oficial: formData.dni_oficial,
        articulos: articulosArray,
        notas: formData.notas,
        evidencias: formData.evidencias.length > 0 ? formData.evidencias[0] : null
      };
      
      console.log('[MULTAS] Payload a enviar:', payload);
      
      const response = await api.post('/api/multas', payload);
      
      console.log('[MULTAS] Respuesta del servidor:', response);
      
      if (response.success) {
        const montoTotal = calcularMontoTotal();
        alert(`✅ Multa registrada exitosamente\n\nMonto total: $${montoTotal.toLocaleString()}\nArtículos aplicados: ${selectedArticulos.length}`);
        setShowCreateForm(false);
        setImagePreviews([]);
        setSelectedArticulos([]);
        setFormData({
          dni_dueno: '',
          dni_oficial: '',
          notas: '',
          evidencias: []
        });
        loadMultas();
      }
    } catch (error) {
      console.error('[MULTAS] Error al registrar multa:', error);
      alert(error.message || 'Error al registrar multa');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta multa?')) return;
    
    try {
      const response = await api.delete(`/api/multas/${id}`);
      if (response.success) {
        alert('Multa eliminada exitosamente');
        setShowModal(false);
        loadMultas();
      }
    } catch (error) {
      alert(error.message || 'Error al eliminar multa');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>💰 Gestión de Multas</h1>
          <p>Consulta y gestiona multas emitidas</p>
        </div>
        {canCreate('multas') && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + Nueva Multa
          </button>
        )}
      </div>

      {multas.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <h3>No hay multas registradas</h3>
          <p>Las multas aparecerán aquí</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>DNI</th>
                <th>Oficial</th>
                <th>Artículos</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa) => (
                <tr key={multa.id}>
                  <td><strong>#{multa.id}</strong></td>
                  <td>{new Date(multa.fecha).toLocaleDateString()}</td>
                  <td>{multa.dni_dueno}</td>
                  <td>{multa.oficial_multa}</td>
                  <td className="motivo-cell">
                    {multa.articulos ? 
                      multa.articulos.split('\n').map(a => a.split(':')[0]).join(', ') : 
                      (multa.motivo || 'N/A')
                    }
                  </td>
                  <td className="monto-cell">${multa.monto?.toLocaleString()}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Ver detalles"
                      onClick={() => viewDetails(multa)}
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

      {/* Formulario crear multa */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Multa</h2>
              <button className="btn-close" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label>DNI del Infractor *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="8 dígitos"
                    value={formData.dni_dueno}
                    onChange={(e) => setFormData({...formData, dni_dueno: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>DNI del Oficial *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="8 dígitos"
                    value={formData.dni_oficial}
                    onChange={(e) => setFormData({...formData, dni_oficial: e.target.value})}
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
                        {articulo.codigo} - {articulo.infraccion} (${articulo.multa?.toLocaleString()})
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
                            <span className="articulo-tag-monto">${articulo.multa?.toLocaleString()}</span>
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
                      <div className="monto-total-container">
                        <strong>Monto Total:</strong>
                        <span className="monto-total">${calcularMontoTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <small>Selecciona los artículos aplicables a la multa. El monto se calculará automáticamente.</small>
                </div>

                <div className="form-group">
                  <label>Notas / Ubicación</label>
                  <textarea
                    className="input"
                    rows="2"
                    placeholder="Ubicación del incidente, notas adicionales, etc."
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Evidencias (Adjuntar imágenes)</label>
                  <input
                    type="file"
                    className="input"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar Multa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedMulta && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Multa #{selectedMulta.id}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="multa-details">
                <div className="info-section">
                  <h3>💰 Información de la Multa</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>ID Multa:</label>
                      <span>#{selectedMulta.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Fecha y Hora:</label>
                      <span>{new Date(selectedMulta.fecha).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Oficial:</label>
                      <span>{selectedMulta.oficial_multa}</span>
                    </div>
                    <div className="info-item">
                      <label>Monto:</label>
                      <span className="monto-highlight">${selectedMulta.monto?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Infractor</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>DNI:</label>
                      <span>{selectedMulta.dni_dueno}</span>
                    </div>
                  </div>
                </div>

                {selectedMulta.articulos && (
                  <div className="info-section">
                    <h3>⚖️ Artículos Aplicados</h3>
                    <div className="articulos-list">
                      {selectedMulta.articulos.split('\n').map((articulo, index) => (
                        <div key={index} className="articulo-item">
                          {articulo}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMulta.motivo && (
                  <div className="info-section">
                    <h3>📝 Detalles</h3>
                    <p className="description-text">{selectedMulta.motivo}</p>
                  </div>
                )}

                {selectedMulta.notas && (
                  <div className="info-section">
                    <h3>📌 Notas Adicionales</h3>
                    <pre className="notes-text">{selectedMulta.notas}</pre>
                  </div>
                )}

                {selectedMulta.url_foto && (
                  <div className="info-section">
                    <h3>📸 Evidencias</h3>
                    <img src={selectedMulta.url_foto} alt="Evidencia" style={{maxWidth: '100%', borderRadius: '8px'}} />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn btn-danger" onClick={() => handleDelete(selectedMulta.id)}>
                  🗑️ Eliminar Multa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
