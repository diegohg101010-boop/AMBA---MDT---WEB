import { useState, useEffect } from 'react';
import { api } from '../config/api';
import './CommonStyles.css';
import './CodigoPenal.css';

export default function CodigoPenal() {
  const [codigoPenal, setCodigoPenal] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Solo cargar una vez al montar el componente
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadCodigoPenal();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Array vacío para que solo se ejecute una vez

  const loadCodigoPenal = async () => {
    // Evitar múltiples llamadas simultáneas
    if (isRetrying) return;
    
    setIsRetrying(true);
    setLoading(true);
    
    try {
      console.log('Cargando código penal...');
      
      // Esperar un poco antes de hacer la petición para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await api.get('/api/codigo-penal');
      console.log('Respuesta código penal:', response);
      
      if (response.success) {
        console.log('Datos recibidos:', response.data);
        setCodigoPenal(response.data);
        setError(null);
      } else {
        console.error('Respuesta no exitosa:', response);
        setError('No se pudo cargar el código penal');
      }
    } catch (error) {
      console.error('Error al cargar código penal:', error);
      
      if (error.message && error.message.includes('429')) {
        setError('Demasiadas solicitudes. Por favor espera un momento y vuelve a intentar.');
      } else {
        setError(error.message || 'Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const filteredCapitulos = Object.entries(codigoPenal).filter(([numero, cap]) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    // Verificar que cap y cap.articulos existan
    if (!cap || !cap.articulos || !Array.isArray(cap.articulos)) return false;
    
    return (
      cap.nombre.toLowerCase().includes(term) ||
      cap.articulos.some(art => 
        art.codigo.toLowerCase().includes(term) ||
        art.infraccion.toLowerCase().includes(term)
      )
    );
  });

  const filteredArticulos = (articulos) => {
    // Verificar que articulos sea un array
    if (!articulos || !Array.isArray(articulos)) return [];
    if (!searchTerm) return articulos;
    const term = searchTerm.toLowerCase();
    return articulos.filter(art =>
      art.codigo.toLowerCase().includes(term) ||
      art.infraccion.toLowerCase().includes(term)
    );
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando código penal...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>📖 Código Penal</h1>
            <p>Todos los artículos del código penal vigente</p>
          </div>
        </div>
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>Error al cargar el código penal</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={loadCodigoPenal}
            disabled={isRetrying}
          >
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }

  if (!codigoPenal || Object.keys(codigoPenal).length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>📖 Código Penal</h1>
            <p>Todos los artículos del código penal vigente</p>
          </div>
        </div>
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay datos del código penal</h3>
          <p>No se pudo cargar la información del código penal.</p>
          <button 
            className="btn btn-primary" 
            onClick={loadCodigoPenal}
            disabled={isRetrying}
          >
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📖 Código Penal</h1>
          <p>Todos los artículos del código penal vigente</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="input"
          placeholder="Buscar por capítulo, artículo o infracción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="codigo-penal-completo">
        {filteredCapitulos.map(([numero, capitulo]) => {
          const articulosFiltrados = filteredArticulos(capitulo.articulos);
          if (articulosFiltrados.length === 0) return null;

          return (
            <div key={numero} className="capitulo-section">
              <div className="capitulo-header-full">
                <div className="capitulo-numero-badge">CAPÍTULO {numero}</div>
                <h2>{capitulo.nombre}</h2>
                <span className="articulos-count">{articulosFiltrados.length} artículos</span>
              </div>

              <div className="articulos-list">
                {articulosFiltrados.map((articulo) => (
                  <div key={articulo.codigo} className="articulo-item">
                    <div className="articulo-item-header">
                      <div className="articulo-codigo-badge">{articulo.codigo}</div>
                      <h3 className="articulo-infraccion">{articulo.infraccion}</h3>
                    </div>
                    
                    <div className="articulo-item-body">
                      <div className="articulo-info-row">
                        <div className="info-badge multa-badge">
                          <span className="badge-label">💰 Multa:</span>
                          <span className="badge-value">${articulo.multa.toLocaleString()}</span>
                        </div>
                        <div className="info-badge condena-badge">
                          <span className="badge-label">⏱️ Condena:</span>
                          <span className="badge-value">{articulo.condena}</span>
                        </div>
                      </div>
                      
                      <div className="articulo-sancion">
                        <span className="sancion-label">⚖️ Sanción:</span>
                        <span className="sancion-value">{articulo.sancion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
