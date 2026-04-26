// AgenciaRangoSelector.jsx - Selector de Agencia y Rango con jerarquías
import { useState, useEffect } from 'react';
import api from '../config/api';
import './AgenciaRangoSelector.css';

export default function AgenciaRangoSelector({ 
    agenciaValue, 
    rangoValue, 
    onAgenciaChange, 
    onRangoChange,
    disabled = false 
}) {
    const [agencias, setAgencias] = useState([]);
    const [rangos, setRangos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('[AgenciaRangoSelector] Componente montado');
        cargarAgencias();
    }, []);

    useEffect(() => {
        console.log('[AgenciaRangoSelector] agenciaValue cambió:', agenciaValue);
        if (agenciaValue) {
            cargarRangos(agenciaValue);
        } else {
            setRangos([]);
        }
    }, [agenciaValue]);

    const cargarAgencias = async () => {
        try {
            console.log('[AgenciaRangoSelector] Cargando agencias...');
            const response = await api.get('/api/jerarquias/agencias');
            console.log('[AgenciaRangoSelector] Respuesta completa:', response);
            
            // Intentar diferentes estructuras de respuesta
            let agenciasData = [];
            if (response.data && Array.isArray(response.data)) {
                agenciasData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                agenciasData = response.data.data;
            } else if (Array.isArray(response)) {
                agenciasData = response;
            }
            
            console.log('[AgenciaRangoSelector] Agencias procesadas:', agenciasData);
            setAgencias(agenciasData);
            setError(null);
        } catch (error) {
            console.error('[AgenciaRangoSelector] Error al cargar agencias:', error);
            setError('Error al cargar agencias');
        } finally {
            setLoading(false);
        }
    };

    const cargarRangos = async (agencia) => {
        try {
            console.log('[AgenciaRangoSelector] Cargando rangos para:', agencia);
            const response = await api.get(`/api/jerarquias/${agencia}/rangos`);
            console.log('[AgenciaRangoSelector] Respuesta rangos:', response);
            
            // Intentar diferentes estructuras de respuesta
            let rangosData = [];
            if (response.data && Array.isArray(response.data)) {
                rangosData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                rangosData = response.data.data;
            } else if (Array.isArray(response)) {
                rangosData = response;
            }
            
            console.log('[AgenciaRangoSelector] Rangos procesados:', rangosData);
            setRangos(rangosData);
        } catch (error) {
            console.error('[AgenciaRangoSelector] Error al cargar rangos:', error);
            setRangos([]);
        }
    };

    const handleAgenciaChange = (e) => {
        const newAgencia = e.target.value;
        console.log('[AgenciaRangoSelector] Agencia seleccionada:', newAgencia);
        onAgenciaChange(newAgencia);
        onRangoChange(''); // Reset rango cuando cambia agencia
    };

    console.log('[AgenciaRangoSelector] Render - loading:', loading, 'agencias:', agencias.length, 'rangos:', rangos.length);

    if (loading) {
        return <div className="selector-loading">Cargando jerarquías...</div>;
    }

    if (error) {
        return <div className="selector-loading" style={{color: 'red'}}>{error}</div>;
    }

    return (
        <div className="agencia-rango-selector">
            <div className="selector-field">
                <label>Agencia / Departamento *</label>
                <select 
                    value={agenciaValue} 
                    onChange={handleAgenciaChange}
                    disabled={disabled}
                    required
                >
                    <option value="">Seleccione una agencia</option>
                    {agencias.map((agencia, index) => (
                        <option key={agencia.codigo || index} value={agencia.codigo}>
                            {agencia.nombre} ({agencia.codigo})
                        </option>
                    ))}
                </select>
                <small style={{color: '#6c757d', fontSize: '12px'}}>
                    {agencias.length} agencias disponibles
                </small>
            </div>

            <div className="selector-field">
                <label>Rango *</label>
                <select 
                    value={rangoValue} 
                    onChange={(e) => onRangoChange(e.target.value)}
                    disabled={disabled || !agenciaValue}
                    required
                >
                    <option value="">Seleccione un rango</option>
                    {rangos.map((rango, index) => (
                        <option key={index} value={rango}>
                            {rango}
                        </option>
                    ))}
                </select>
                <small style={{color: '#6c757d', fontSize: '12px'}}>
                    {rangos.length} rangos disponibles
                </small>
            </div>
        </div>
    );
}
