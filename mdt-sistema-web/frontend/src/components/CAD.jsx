// CAD.jsx - Sistema de Despacho CAD integrado con 911 del BOT
// Versión: 2.0 - Sin validación jerárquica
import { useState, useEffect } from 'react';
import api from '../config/api';
import './CAD.css';

const CAD = () => {
    const [llamadas, setLlamadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('received');
    const [selectedLlamadas, setSelectedLlamadas] = useState([]);

    useEffect(() => {
        cargarLlamadas();
        const interval = setInterval(cargarLlamadas, 5000);
        return () => clearInterval(interval);
    }, [filtroEstado]);

    const cargarLlamadas = async () => {
        try {
            const response = await api.get(`/api/cad/llamadas?estado=${filtroEstado}`);
            setLlamadas(response.data || []);
        } catch (error) {
            console.error('Error al cargar llamadas:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSeleccion = (callId) => {
        setSelectedLlamadas(prev => 
            prev.includes(callId) ? prev.filter(id => id !== callId) : [...prev, callId]
        );
    };

    const eliminarSeleccionadas = async () => {
        if (selectedLlamadas.length === 0) return alert('Selecciona al menos una llamada');
        if (!confirm(`¿Eliminar ${selectedLlamadas.length} llamada(s)?`)) return;
        
        try {
            for (const callId of selectedLlamadas) {
                await api.post(`/api/cad/llamadas/${callId}/cerrar`, { resolucion: 'Eliminada' });
            }
            alert('Llamadas eliminadas');
            setSelectedLlamadas([]);
            cargarLlamadas();
        } catch (error) {
            alert('Error al eliminar llamadas');
        }
    };

    const asignarUnidad = async (callId) => {
        const unidad = prompt('ID de unidad:');
        const oficial = prompt('DNI del oficial:');
        if (!unidad || !oficial) return;
        
        try {
            await api.post(`/api/cad/llamadas/${callId}/asignar`, { unidad_id: unidad, oficial_dni: oficial });
            alert('Unidad asignada');
            cargarLlamadas();
        } catch (error) {
            alert('Error al asignar');
        }
    };

    const cerrarLlamada = async (callId) => {
        const resolucion = prompt('Resolución:');
        if (!resolucion) return;
        
        try {
            await api.post(`/api/cad/llamadas/${callId}/cerrar`, { resolucion });
            alert('Llamada cerrada');
            cargarLlamadas();
        } catch (error) {
            alert('Error al cerrar');
        }
    };

    const getPrioridadColor = (serviceType) => {
        const colors = {
            'policia': '#dc3545',
            'ems_bomberos': '#fd7e14',
            'agencias_federales': '#6f42c1',
            'txdot': '#ffc107'
        };
        return colors[serviceType] || '#6c757d';
    };

    const getEstadoBadge = (status) => {
        const badges = {
            'received': { text: 'Recibida', class: 'badge-warning' },
            'assigned': { text: 'Asignada', class: 'badge-info' },
            'active': { text: 'Activa', class: 'badge-primary' },
            'completed': { text: 'Completada', class: 'badge-success' }
        };
        return badges[status] || { text: status, class: 'badge-secondary' };
    };

    if (loading) {
        return <div className="cad-loading">Cargando sistema CAD...</div>;
    }

    return (
        <div className="cad-container" style={{ background: '#0a0e27', minHeight: '100vh', padding: '20px' }}>
            <div className="cad-header">
                <div className="cad-header-content">
                    <h1>🚨 CAD - Centro de Despacho</h1>
                    <div className="cad-stats">
                        <div className="stat-item">
                            <span className="stat-value">{llamadas.length}</span>
                            <span className="stat-label">Llamadas</span>
                        </div>
                        {selectedLlamadas.length > 0 && (
                            <div className="stat-item selected">
                                <span className="stat-value">{selectedLlamadas.length}</span>
                                <span className="stat-label">Seleccionadas</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="cad-actions-bar">
                    <div className="cad-filters">
                        <button className={filtroEstado === 'received' ? 'active' : ''} onClick={() => setFiltroEstado('received')}>Pendientes</button>
                        <button className={filtroEstado === 'assigned' ? 'active' : ''} onClick={() => setFiltroEstado('assigned')}>Asignadas</button>
                        <button className={filtroEstado === 'active' ? 'active' : ''} onClick={() => setFiltroEstado('active')}>Activas</button>
                    </div>
                    {selectedLlamadas.length > 0 && (
                        <button className="btn-eliminar-multiple" onClick={eliminarSeleccionadas}>
                            🗑️ Eliminar ({selectedLlamadas.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="cad-grid">
                {llamadas.length === 0 ? (
                    <div className="cad-empty">
                        <p>No hay llamadas {filtroEstado === 'received' ? 'pendientes' : filtroEstado}</p>
                    </div>
                ) : (
                    llamadas.map(llamada => (
                        <div 
                            key={llamada.call_id} 
                            className={`cad-card ${selectedLlamadas.includes(llamada.call_id) ? 'selected' : ''}`}
                            style={{ borderLeft: `4px solid ${getPrioridadColor(llamada.service_type)}` }}
                        >
                            <div className="cad-card-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={selectedLlamadas.includes(llamada.call_id)}
                                    onChange={() => toggleSeleccion(llamada.call_id)}
                                />
                            </div>
                            <div className="cad-card-header">
                                <span className="cad-call-id">{llamada.call_id}</span>
                                <span className={`cad-badge ${getEstadoBadge(llamada.status).class}`}>
                                    {getEstadoBadge(llamada.status).text}
                                </span>
                            </div>
                            <div className="cad-card-body">
                                <div className="cad-info-row">
                                    <strong>Servicio:</strong>
                                    <span>{llamada.service_type.replace('_', ' ').toUpperCase()}</span>
                                </div>
                                <div className="cad-info-row">
                                    <strong>Ubicación:</strong>
                                    <span>{llamada.location}</span>
                                </div>
                                <div className="cad-info-row">
                                    <strong>Descripción:</strong>
                                    <p className="cad-description">{llamada.description}</p>
                                </div>
                                <div className="cad-info-row">
                                    <strong>Hora:</strong>
                                    <span>{new Date(llamada.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="cad-card-actions">
                                {llamada.status === 'received' && (
                                    <button className="btn-asignar" onClick={() => asignarUnidad(llamada.call_id)}>Asignar</button>
                                )}
                                {(llamada.status === 'assigned' || llamada.status === 'active') && (
                                    <button className="btn-cerrar" onClick={() => cerrarLlamada(llamada.call_id)}>Cerrar</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CAD;
