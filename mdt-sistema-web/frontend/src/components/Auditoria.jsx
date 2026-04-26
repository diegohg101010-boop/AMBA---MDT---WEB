import { useState, useEffect } from 'react';
import { api } from '../config/api';
import './CommonStyles.css';
import './Auditoria.css';

export default function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState('registros'); // 'registros' o 'estadisticas'
  const [accesoRestringido, setAccesoRestringido] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    usuario: '',
    accion: '',
    fecha_inicio: '',
    fecha_fin: '',
    severidad: '',
    limite: 100
  });

  useEffect(() => {
    // Verificar permisos de acceso
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('[AUDITORIA] Usuario actual:', user);
        console.log('[AUDITORIA] Rol del usuario:', user.rol);
        
        const rolesRestringidos = ['Cadete', 'Oficial', 'Supervisor'];
        
        // Verificar si el rol está en la lista de restringidos (case-insensitive)
        const rolUsuario = user.rol ? user.rol.trim() : '';
        const tieneAccesoRestringido = rolesRestringidos.some(
          rol => rol.toLowerCase() === rolUsuario.toLowerCase()
        );
        
        console.log('[AUDITORIA] Acceso restringido:', tieneAccesoRestringido);
        
        if (tieneAccesoRestringido) {
          setAccesoRestringido(true);
          setCargando(false);
          return;
        }
      } catch (error) {
        console.error('[AUDITORIA] Error al verificar permisos:', error);
      }
    }
    
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      await Promise.all([
        cargarRegistros(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarRegistros = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });

      const data = await api.get(`/api/auditoria?${params}`);
      if (data.success) {
        setRegistros(data.data);
      }
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const data = await api.get(`/api/auditoria/estadisticas?${params}`);
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    cargarRegistros();
  };

  const limpiarFiltros = () => {
    setFiltros({
      usuario: '',
      accion: '',
      fecha_inicio: '',
      fecha_fin: '',
      severidad: '',
      limite: 100
    });
    setTimeout(() => cargarRegistros(), 100);
  };

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeveridadIcon = (severidad) => {
    switch (severidad) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📝';
    }
  };

  if (cargando) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando auditoría...</p>
        </div>
      </div>
    );
  }

  // Mensaje de acceso denegado
  if (accesoRestringido) {
    return (
      <div className="page-container">
        <div className="acceso-denegado-container">
          <div className="acceso-denegado-card">
            <div className="acceso-denegado-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h1>ACCESO DENEGADO</h1>
            <div className="acceso-denegado-badge">CLASIFICADO</div>
            <p className="acceso-denegado-mensaje">
              No tienes autorización para acceder al Sistema de Auditoría
            </p>
            <div className="acceso-denegado-detalles">
              <div className="detalle-item">
                <span className="detalle-label">NIVEL DE SEGURIDAD:</span>
                <span className="detalle-valor">ALTO</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">PERMISOS REQUERIDOS:</span>
                <span className="detalle-valor">ADMINISTRADOR / JEFE</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">TU ROL ACTUAL:</span>
                <span className="detalle-valor">{JSON.parse(localStorage.getItem('user') || '{}').rol || 'DESCONOCIDO'}</span>
              </div>
            </div>
            <div className="acceso-denegado-footer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p>Este módulo está restringido a personal autorizado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="auditoria-header">
        <div>
          <h1>🔍 Sistema de Auditoría</h1>
          <p>Registro completo de todas las acciones realizadas en el sistema</p>
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${vistaActual === 'registros' ? 'active' : ''}`}
            onClick={() => setVistaActual('registros')}
          >
            📋 Registros
          </button>
          <button 
            className={`tab-btn ${vistaActual === 'estadisticas' ? 'active' : ''}`}
            onClick={() => setVistaActual('estadisticas')}
          >
            📊 Estadísticas
          </button>
        </div>
      </div>

      {vistaActual === 'registros' ? (
        <>
          {/* Filtros */}
          <div className="filtros-auditoria">
            <h3>🔎 Filtros de Búsqueda</h3>
            <div className="filtros-grid">
              <div className="filtro-item">
                <label>Usuario</label>
                <input
                  type="text"
                  name="usuario"
                  value={filtros.usuario}
                  onChange={handleFiltroChange}
                  placeholder="Buscar por usuario..."
                  className="input"
                />
              </div>

              <div className="filtro-item">
                <label>Acción</label>
                <input
                  type="text"
                  name="accion"
                  value={filtros.accion}
                  onChange={handleFiltroChange}
                  placeholder="Tipo de acción..."
                  className="input"
                />
              </div>

              <div className="filtro-item">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={filtros.fecha_inicio}
                  onChange={handleFiltroChange}
                  className="input"
                />
              </div>

              <div className="filtro-item">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={filtros.fecha_fin}
                  onChange={handleFiltroChange}
                  className="input"
                />
              </div>

              <div className="filtro-item">
                <label>Severidad</label>
                <select
                  name="severidad"
                  value={filtros.severidad}
                  onChange={handleFiltroChange}
                  className="input"
                >
                  <option value="">Todas</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="filtro-item">
                <label>Límite</label>
                <select
                  name="limite"
                  value={filtros.limite}
                  onChange={handleFiltroChange}
                  className="input"
                >
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                </select>
              </div>
            </div>

            <div className="filtros-acciones">
              <button className="btn-aplicar" onClick={aplicarFiltros}>
                🔍 Aplicar Filtros
              </button>
              <button className="btn-limpiar" onClick={limpiarFiltros}>
                🗑️ Limpiar
              </button>
              <button className="btn-refrescar" onClick={cargarDatos}>
                🔄 Refrescar
              </button>
            </div>
          </div>

          {/* Tabla de Registros */}
          <div className="registros-container">
            <h3>📋 Registros de Auditoría ({registros.length})</h3>
            {registros.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron registros con los filtros aplicados</p>
              </div>
            ) : (
              <div className="registros-lista">
                {registros.map((registro) => (
                  <div key={registro.id} className="registro-card">
                    <div className="registro-header">
                      <div className="registro-severidad" style={{ color: getSeveridadColor(registro.severidad) }}>
                        {getSeveridadIcon(registro.severidad)} {registro.severidad?.toUpperCase() || 'N/A'}
                      </div>
                      <div className="registro-fecha">
                        {new Date(registro.fecha).toLocaleString('es-ES')}
                      </div>
                    </div>
                    <div className="registro-body">
                      <div className="registro-info">
                        <span className="registro-label">Usuario:</span>
                        <span className="registro-valor">{registro.usuario}</span>
                      </div>
                      <div className="registro-info">
                        <span className="registro-label">Acción:</span>
                        <span className="registro-valor">{registro.accion}</span>
                      </div>
                      <div className="registro-descripcion">
                        {registro.descripcion}
                      </div>
                      {registro.ip && (
                        <div className="registro-ip">
                          🌐 IP: {registro.ip}
                        </div>
                      )}
                      {registro.datos && (
                        <details className="registro-datos">
                          <summary>Ver datos adicionales</summary>
                          <pre>{JSON.stringify(registro.datos, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Vista de Estadísticas */
        <div className="estadisticas-container">
          {estadisticas && (
            <>
              <div className="stats-resumen">
                <div className="stat-box">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-numero">{estadisticas.total_acciones}</div>
                    <div className="stat-label">Total de Acciones</div>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-seccion">
                  <h3>👥 Top Usuarios Más Activos</h3>
                  <div className="stat-lista">
                    {estadisticas.acciones_por_usuario.map((item, idx) => (
                      <div key={idx} className="stat-item">
                        <span className="stat-nombre">{item.usuario}</span>
                        <span className="stat-badge">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-seccion">
                  <h3>⚡ Acciones Más Frecuentes</h3>
                  <div className="stat-lista">
                    {estadisticas.acciones_por_tipo.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="stat-item">
                        <span className="stat-nombre">{item.accion}</span>
                        <span className="stat-badge">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-seccion">
                  <h3>🚨 Por Severidad</h3>
                  <div className="stat-lista">
                    {estadisticas.acciones_por_severidad.map((item, idx) => (
                      <div key={idx} className="stat-item">
                        <span className="stat-nombre" style={{ color: getSeveridadColor(item.severidad) }}>
                          {getSeveridadIcon(item.severidad)} {item.severidad?.toUpperCase() || 'N/A'}
                        </span>
                        <span className="stat-badge">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-seccion">
                  <h3>🌐 IPs Más Activas</h3>
                  <div className="stat-lista">
                    {estadisticas.ips_activas.map((item, idx) => (
                      <div key={idx} className="stat-item">
                        <span className="stat-nombre">{item.ip}</span>
                        <span className="stat-badge">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
