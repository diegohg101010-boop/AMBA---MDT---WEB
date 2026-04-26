import { useState } from 'react';
import './CommonStyles.css';
import './Reportes.css';

export default function Reportes() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [reporteGenerado, setReporteGenerado] = useState(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    // Información General
    titulo: '',
    numeroReporte: '',
    fechaIncidente: '',
    horaIncidente: '',
    ubicacion: '',
    
    // Oficial que reporta
    oficialNombre: '',
    oficialPlaca: '',
    oficialDepartamento: '',
    oficialRango: '',
    
    // Tipo de incidente
    tipoIncidente: '',
    prioridad: 'media',
    
    // Personas involucradas
    personasInvolucradas: '',
    testigos: '',
    
    // Descripción detallada
    descripcionHechos: '',
    accionesTomadas: '',
    resultadoOperativo: '',
    
    // Evidencias
    evidencias: '',
    vehiculosInvolucrados: '',
    
    // Seguimiento
    requiereSeguimiento: false,
    observaciones: '',
    
    // Clasificación
    codigosPenales: '',
    multasAplicadas: '',
    arrestosRealizados: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generarNumeroReporte = () => {
    const fecha = new Date();
    const numero = `RPT-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, numeroReporte: numero }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReporteGenerado({
        ...formData,
        fechaGeneracion: new Date().toISOString(),
        estado: 'completado'
      });
      
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const nuevoReporte = () => {
    setFormData({
      titulo: '',
      numeroReporte: '',
      fechaIncidente: '',
      horaIncidente: '',
      ubicacion: '',
      oficialNombre: '',
      oficialPlaca: '',
      oficialDepartamento: '',
      oficialRango: '',
      tipoIncidente: '',
      prioridad: 'media',
      personasInvolucradas: '',
      testigos: '',
      descripcionHechos: '',
      accionesTomadas: '',
      resultadoOperativo: '',
      evidencias: '',
      vehiculosInvolucrados: '',
      requiereSeguimiento: false,
      observaciones: '',
      codigosPenales: '',
      multasAplicadas: '',
      arrestosRealizados: ''
    });
    setReporteGenerado(null);
    setMostrarFormulario(true);
  };

  const exportarPDF = () => {
    alert('Función de exportación a PDF en desarrollo');
  };

  const imprimirReporte = () => {
    window.print();
  };

  // Vista principal - Botón para crear reporte
  if (!mostrarFormulario && !reporteGenerado) {
    return (
      <div className="page-container">
        <div className="reportes-inicio">
          <div className="reportes-hero">
            <div className="hero-icon">📋</div>
            <h1>Sistema de Generación de Reportes</h1>
            <p>Crea reportes policiales detallados y profesionales</p>
            <button className="btn-crear-reporte" onClick={nuevoReporte}>
              ✏️ Crear Nuevo Reporte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista del formulario
  if (mostrarFormulario) {
    return (
      <div className="page-container">
        <div className="formulario-reporte">
          <div className="formulario-header">
            <h2>📋 Nuevo Reporte Policial</h2>
            <button 
              className="btn-cancelar" 
              onClick={() => setMostrarFormulario(false)}
            >
              ✕ Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="reporte-form">
            {/* Sección 1: Información General */}
            <div className="form-seccion">
              <h3>📌 Información General del Reporte</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Título del Reporte *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Arresto por robo a mano armada"
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Número de Reporte</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="numeroReporte"
                      value={formData.numeroReporte}
                      onChange={handleChange}
                      placeholder="RPT-YYYYMMDD-XXXX"
                      className="input"
                      readOnly
                    />
                    <button 
                      type="button" 
                      onClick={generarNumeroReporte}
                      className="btn-generar-numero"
                    >
                      🔄 Generar
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha del Incidente *</label>
                  <input
                    type="date"
                    name="fechaIncidente"
                    value={formData.fechaIncidente}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Hora del Incidente *</label>
                  <input
                    type="time"
                    name="horaIncidente"
                    value={formData.horaIncidente}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Ubicación del Incidente *</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Dirección exacta o punto de referencia"
                    required
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Oficial que Reporta */}
            <div className="form-seccion">
              <h3>👮 Oficial que Reporta</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="oficialNombre"
                    value={formData.oficialNombre}
                    onChange={handleChange}
                    placeholder="Nombre y apellido"
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Placa *</label>
                  <input
                    type="text"
                    name="oficialPlaca"
                    value={formData.oficialPlaca}
                    onChange={handleChange}
                    placeholder="Ej: LSPD-001"
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Departamento *</label>
                  <select
                    name="oficialDepartamento"
                    value={formData.oficialDepartamento}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="PFA">PFA - Policía Federal Argentina</option>
                    <option value="GNA">GNA - Gendarmería Nacional Argentina</option>
                    <option value="PJ">TJ - Tribunal de Justicia</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rango *</label>
                  <input
                    type="text"
                    name="oficialRango"
                    value={formData.oficialRango}
                    onChange={handleChange}
                    placeholder="Ej: Officer, Sergeant, Lieutenant"
                    required
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Clasificación del Incidente */}
            <div className="form-seccion">
              <h3>🚨 Clasificación del Incidente</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo de Incidente *</label>
                  <select
                    name="tipoIncidente"
                    value={formData.tipoIncidente}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Robo">Robo</option>
                    <option value="Asalto">Asalto</option>
                    <option value="Homicidio">Homicidio</option>
                    <option value="Tráfico">Infracción de Tráfico</option>
                    <option value="Drogas">Posesión/Tráfico de Drogas</option>
                    <option value="Armas">Posesión Ilegal de Armas</option>
                    <option value="Vandalismo">Vandalismo</option>
                    <option value="Disturbios">Disturbios Públicos</option>
                    <option value="Secuestro">Secuestro</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prioridad *</label>
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="baja">🟢 Baja</option>
                    <option value="media">🟡 Media</option>
                    <option value="alta">🟠 Alta</option>
                    <option value="critica">🔴 Crítica</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Códigos Penales Aplicados</label>
                  <input
                    type="text"
                    name="codigosPenales"
                    value={formData.codigosPenales}
                    onChange={handleChange}
                    placeholder=""
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Personas Involucradas */}
            <div className="form-seccion">
              <h3>👥 Personas Involucradas</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Sospechosos/Detenidos</label>
                  <textarea
                    name="personasInvolucradas"
                    value={formData.personasInvolucradas}
                    onChange={handleChange}
                    placeholder="Nombre, DNI, descripción física, cargos..."
                    rows="4"
                    className="input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Testigos</label>
                  <textarea
                    name="testigos"
                    value={formData.testigos}
                    onChange={handleChange}
                    placeholder="Nombre, DNI, información de contacto..."
                    rows="3"
                    className="input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Vehículos Involucrados</label>
                  <textarea
                    name="vehiculosInvolucrados"
                    value={formData.vehiculosInvolucrados}
                    onChange={handleChange}
                    placeholder="Matrícula, marca, modelo, color, estado..."
                    rows="3"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Descripción Detallada */}
            <div className="form-seccion">
              <h3>📝 Descripción Detallada de los Hechos</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Narrativa de los Hechos *</label>
                  <textarea
                    name="descripcionHechos"
                    value={formData.descripcionHechos}
                    onChange={handleChange}
                    placeholder="Describe cronológicamente lo sucedido, incluyendo todos los detalles relevantes..."
                    rows="8"
                    required
                    className="input"
                  />
                  <small>Incluye: qué sucedió, cómo, cuándo, dónde, quiénes estuvieron involucrados</small>
                </div>

                <div className="form-group full-width">
                  <label>Acciones Tomadas *</label>
                  <textarea
                    name="accionesTomadas"
                    value={formData.accionesTomadas}
                    onChange={handleChange}
                    placeholder="Describe las acciones realizadas por los oficiales..."
                    rows="5"
                    required
                    className="input"
                  />
                  <small>Incluye: procedimientos seguidos, arrestos, búsquedas, etc.</small>
                </div>

                <div className="form-group full-width">
                  <label>Resultado del Operativo *</label>
                  <textarea
                    name="resultadoOperativo"
                    value={formData.resultadoOperativo}
                    onChange={handleChange}
                    placeholder="Describe el resultado final de la intervención..."
                    rows="4"
                    required
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 6: Evidencias y Multas */}
            <div className="form-seccion">
              <h3>📸 Evidencias y Sanciones</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Evidencias Recolectadas</label>
                  <textarea
                    name="evidencias"
                    value={formData.evidencias}
                    onChange={handleChange}
                    placeholder="URLs de imágenes, videos, documentos, objetos incautados..."
                    rows="4"
                    className="input"
                  />
                  <small>Incluye enlaces a imágenes, descripciones de objetos incautados, etc.</small>
                </div>

                <div className="form-group">
                  <label>Multas Aplicadas</label>
                  <input
                    type="text"
                    name="multasAplicadas"
                    value={formData.multasAplicadas}
                    onChange={handleChange}
                    placeholder="Ej: $5,000 por exceso de velocidad"
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Arrestos Realizados</label>
                  <input
                    type="text"
                    name="arrestosRealizados"
                    value={formData.arrestosRealizados}
                    onChange={handleChange}
                    placeholder="Número de arrestos"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Sección 7: Seguimiento y Observaciones */}
            <div className="form-seccion">
              <h3>🔍 Seguimiento y Observaciones</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="requiereSeguimiento"
                      checked={formData.requiereSeguimiento}
                      onChange={handleChange}
                    />
                    <span>Este caso requiere seguimiento adicional</span>
                  </label>
                </div>

                <div className="form-group full-width">
                  <label>Observaciones Adicionales</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Cualquier información adicional relevante..."
                    rows="4"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secundario"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primario"
                disabled={cargando}
              >
                {cargando ? '⏳ Generando...' : '✅ Generar Reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Vista del reporte generado
  return (
    <div className="page-container">
      <div className="reporte-generado">
        <div className="reporte-acciones">
          <button className="btn-secundario" onClick={nuevoReporte}>
            📝 Nuevo Reporte
          </button>
          <div className="acciones-derecha">
            <button className="btn-secundario" onClick={imprimirReporte}>
              🖨️ Imprimir
            </button>
            <button className="btn-primario" onClick={exportarPDF}>
              📥 Exportar PDF
            </button>
          </div>
        </div>

        <div className="reporte-documento">
          {/* Encabezado oficial */}
          <div className="reporte-encabezado">
            <div className="logo-departamento">🛡️</div>
            <div className="encabezado-texto">
              <h1>REPORTE POLICIAL OFICIAL</h1>
              <p>{reporteGenerado.oficialDepartamento}</p>
              <p className="numero-reporte">{reporteGenerado.numeroReporte}</p>
            </div>
          </div>

          {/* Información General */}
          <div className="reporte-seccion-doc">
            <h2>📌 INFORMACIÓN GENERAL</h2>
            <div className="reporte-tabla">
              <div className="reporte-fila">
                <span className="reporte-label">Título:</span>
                <span className="reporte-valor">{reporteGenerado.titulo}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Fecha del Incidente:</span>
                <span className="reporte-valor">
                  {new Date(reporteGenerado.fechaIncidente).toLocaleDateString('es-ES')} a las {reporteGenerado.horaIncidente}
                </span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Ubicación:</span>
                <span className="reporte-valor">{reporteGenerado.ubicacion}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Tipo de Incidente:</span>
                <span className="reporte-valor">{reporteGenerado.tipoIncidente}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Prioridad:</span>
                <span className={`reporte-badge prioridad-${reporteGenerado.prioridad}`}>
                  {reporteGenerado.prioridad?.toUpperCase() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Oficial que Reporta */}
          <div className="reporte-seccion-doc">
            <h2>👮 OFICIAL QUE REPORTA</h2>
            <div className="reporte-tabla">
              <div className="reporte-fila">
                <span className="reporte-label">Nombre:</span>
                <span className="reporte-valor">{reporteGenerado.oficialNombre}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Placa:</span>
                <span className="reporte-valor">{reporteGenerado.oficialPlaca}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Departamento:</span>
                <span className="reporte-valor">{reporteGenerado.oficialDepartamento}</span>
              </div>
              <div className="reporte-fila">
                <span className="reporte-label">Rango:</span>
                <span className="reporte-valor">{reporteGenerado.oficialRango}</span>
              </div>
            </div>
          </div>

          {/* Códigos Penales */}
          {reporteGenerado.codigosPenales && (
            <div className="reporte-seccion-doc">
              <h2>⚖️ CÓDIGOS PENALES APLICADOS</h2>
              <p className="reporte-texto">{reporteGenerado.codigosPenales}</p>
            </div>
          )}

          {/* Personas Involucradas */}
          {reporteGenerado.personasInvolucradas && (
            <div className="reporte-seccion-doc">
              <h2>👥 SOSPECHOSOS/DETENIDOS</h2>
              <p className="reporte-texto">{reporteGenerado.personasInvolucradas}</p>
            </div>
          )}

          {/* Testigos */}
          {reporteGenerado.testigos && (
            <div className="reporte-seccion-doc">
              <h2>👁️ TESTIGOS</h2>
              <p className="reporte-texto">{reporteGenerado.testigos}</p>
            </div>
          )}

          {/* Vehículos */}
          {reporteGenerado.vehiculosInvolucrados && (
            <div className="reporte-seccion-doc">
              <h2>🚗 VEHÍCULOS INVOLUCRADOS</h2>
              <p className="reporte-texto">{reporteGenerado.vehiculosInvolucrados}</p>
            </div>
          )}

          {/* Narrativa de los Hechos */}
          <div className="reporte-seccion-doc">
            <h2>📝 NARRATIVA DE LOS HECHOS</h2>
            <p className="reporte-texto-largo">{reporteGenerado.descripcionHechos}</p>
          </div>

          {/* Acciones Tomadas */}
          <div className="reporte-seccion-doc">
            <h2>🚨 ACCIONES TOMADAS</h2>
            <p className="reporte-texto-largo">{reporteGenerado.accionesTomadas}</p>
          </div>

          {/* Resultado */}
          <div className="reporte-seccion-doc">
            <h2>✅ RESULTADO DEL OPERATIVO</h2>
            <p className="reporte-texto-largo">{reporteGenerado.resultadoOperativo}</p>
          </div>

          {/* Evidencias */}
          {reporteGenerado.evidencias && (
            <div className="reporte-seccion-doc">
              <h2>📸 EVIDENCIAS RECOLECTADAS</h2>
              <p className="reporte-texto">{reporteGenerado.evidencias}</p>
            </div>
          )}

          {/* Sanciones */}
          {(reporteGenerado.multasAplicadas || reporteGenerado.arrestosRealizados) && (
            <div className="reporte-seccion-doc">
              <h2>💰 SANCIONES APLICADAS</h2>
              <div className="reporte-tabla">
                {reporteGenerado.multasAplicadas && (
                  <div className="reporte-fila">
                    <span className="reporte-label">Multas:</span>
                    <span className="reporte-valor">{reporteGenerado.multasAplicadas}</span>
                  </div>
                )}
                {reporteGenerado.arrestosRealizados && (
                  <div className="reporte-fila">
                    <span className="reporte-label">Arrestos:</span>
                    <span className="reporte-valor">{reporteGenerado.arrestosRealizados}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {reporteGenerado.observaciones && (
            <div className="reporte-seccion-doc">
              <h2>🔍 OBSERVACIONES ADICIONALES</h2>
              <p className="reporte-texto">{reporteGenerado.observaciones}</p>
            </div>
          )}

          {/* Seguimiento */}
          {reporteGenerado.requiereSeguimiento && (
            <div className="reporte-alerta">
              ⚠️ Este caso requiere seguimiento adicional
            </div>
          )}

          {/* Pie de página */}
          <div className="reporte-pie">
            <div className="firma-seccion">
              <div className="firma-linea"></div>
              <p className="firma-texto">
                <strong>{reporteGenerado.oficialNombre}</strong><br />
                {reporteGenerado.oficialRango} - Placa {reporteGenerado.oficialPlaca}<br />
                {reporteGenerado.oficialDepartamento}
              </p>
            </div>
            <div className="reporte-metadata">
              <p>Reporte generado el: {new Date(reporteGenerado.fechaGeneracion).toLocaleString('es-ES')}</p>
              <p className="reporte-confidencial">
                DOCUMENTO CONFIDENCIAL - USO EXCLUSIVO POLICIAL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
