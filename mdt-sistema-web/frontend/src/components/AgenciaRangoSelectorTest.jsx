// AgenciaRangoSelectorTest.jsx - Versión de prueba con datos hardcodeados
import { useState, useEffect } from 'react';
import './AgenciaRangoSelector.css';

const AGENCIAS_TEST = [
    { codigo: 'PFA', nombre: 'Policía Federal Argentina' },
    { codigo: 'GNA', nombre: 'Gendarmería Nacional Argentina' },
    { codigo: 'TJ', nombre: 'Tribunal de Justicia' }
];

const RANGOS_TEST = {
    'PFA': ['Oficial', 'Suboficial', 'Cabo', 'Sargento', 'Oficial Mayor', 'Comisario', 'Comisario General'],
    'GNA': ['Gendarme', 'Cabo', 'Sargento', 'Oficial', 'Teniente', 'Capitán', 'Mayor'],
    'TJ': ['Juez', 'Secretario', 'Escribano', 'Fiscal', 'Defensor', 'Abogado']
};

export default function AgenciaRangoSelectorTest({ 
    agenciaValue, 
    rangoValue, 
    onAgenciaChange, 
    onRangoChange,
    disabled = false 
}) {
    const [rangos, setRangos] = useState([]);

    useEffect(() => {
        console.log('[TEST] Componente montado');
        console.log('[TEST] agenciaValue:', agenciaValue);
        console.log('[TEST] rangoValue:', rangoValue);
    }, []);

    useEffect(() => {
        console.log('[TEST] agenciaValue cambió a:', agenciaValue);
        if (agenciaValue && RANGOS_TEST[agenciaValue]) {
            setRangos(RANGOS_TEST[agenciaValue]);
        } else {
            setRangos([]);
        }
    }, [agenciaValue]);

    const handleAgenciaChange = (e) => {
        const newAgencia = e.target.value;
        console.log('[TEST] Agencia seleccionada:', newAgencia);
        onAgenciaChange(newAgencia);
        onRangoChange('');
    };

    return (
        <div className="agencia-rango-selector" style={{border: '2px solid red', padding: '10px'}}>
            <p style={{color: 'red', fontWeight: 'bold'}}>COMPONENTE TEST RENDERIZADO</p>
            
            <div className="selector-field">
                <label>Agencia / Departamento *</label>
                <select 
                    value={agenciaValue} 
                    onChange={handleAgenciaChange}
                    disabled={disabled}
                    required
                >
                    <option value="">Seleccione una agencia</option>
                    {AGENCIAS_TEST.map(agencia => (
                        <option key={agencia.codigo} value={agencia.codigo}>
                            {agencia.nombre} ({agencia.codigo})
                        </option>
                    ))}
                </select>
                <small>{AGENCIAS_TEST.length} agencias disponibles</small>
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
                <small>{rangos.length} rangos disponibles</small>
            </div>
        </div>
    );
}
