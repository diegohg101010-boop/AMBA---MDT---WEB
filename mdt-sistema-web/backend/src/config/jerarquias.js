// config/jerarquias.js - SISTEMA DE JERARQUÍAS CENTRALIZADO Y GLOBAL
// ÚNICA FUENTE DE VERDAD PARA TODO EL SISTEMA (BOT, BACKEND, MDT)

const JERARQUIAS = {
    HCSO: {
        nombre: 'Harris County Sheriff\'s Office',
        codigo: 'HCSO',
        rangos: {
            // Command Staff
            'Sheriff': { 
                nivel: 100, 
                categoria: 'Command Staff',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Undersheriff': { 
                nivel: 95, 
                categoria: 'Command Staff',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Deputy Chief': { 
                nivel: 90, 
                categoria: 'Command Staff',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            
            // Supervising Officers
            'Assistant Chief Deputy': { 
                nivel: 85, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'override', 'cad_full'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Major': { 
                nivel: 80, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'override', 'cad_full'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Captain': { 
                nivel: 75, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'cad_full'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'I Lieutenant': { 
                nivel: 70, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'cad_full'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: false
            },
            'Lieutenant': { 
                nivel: 65, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: false
            },
            'Assistant Lieutenant': { 
                nivel: 60, 
                categoria: 'Supervising Officers',
                permisos: ['supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            
            // Field Officers
            'Sergeant': { 
                nivel: 55, 
                categoria: 'Field Officers',
                permisos: ['field_supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'Field Sergeant': { 
                nivel: 50, 
                categoria: 'Field Officers',
                permisos: ['field_supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'Corporal': { 
                nivel: 45, 
                categoria: 'Field Officers',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'Senior Deputy': { 
                nivel: 40, 
                categoria: 'Field Officers',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'Deputy': { 
                nivel: 35, 
                categoria: 'Field Officers',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            }
        }
    },
    
    HPD: {
        nombre: 'Houston Police Department',
        codigo: 'HPD',
        rangos: {
            // Chief
            'COP': { 
                nivel: 100, 
                categoria: 'Chief',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            
            // Oficiales de Conducción
            'EAC': { 
                nivel: 90, 
                categoria: 'Oficiales de Conducción',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'AC': { 
                nivel: 85, 
                categoria: 'Oficiales de Conducción',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            
            // Oficiales Jefes
            'DC': { 
                nivel: 80, 
                categoria: 'Oficiales Jefes',
                permisos: ['supervisor', 'override', 'cad_full'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'COM': { 
                nivel: 75, 
                categoria: 'Oficiales Jefes',
                permisos: ['supervisor', 'cad_full'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'INS': { 
                nivel: 70, 
                categoria: 'Oficiales Jefes',
                permisos: ['supervisor', 'cad_full'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: false
            },
            
            // Oficiales Superiores
            'CAP': { 
                nivel: 65, 
                categoria: 'Oficiales Superiores',
                permisos: ['supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: false
            },
            'LIE': { 
                nivel: 60, 
                categoria: 'Oficiales Superiores',
                permisos: ['supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'SER': { 
                nivel: 55, 
                categoria: 'Oficiales Superiores',
                permisos: ['field_supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            
            // Oficiales Operativos
            'SPO': { 
                nivel: 45, 
                categoria: 'Oficiales Operativos',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            },
            'PO': { 
                nivel: 40, 
                categoria: 'Oficiales Operativos',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            }
        }
    },
    
    FBI: {
        nombre: 'Federal Bureau of Investigation',
        codigo: 'FBI',
        rangos: {
            // Dirección Nacional
            'Director': { 
                nivel: 100, 
                categoria: 'Dirección Nacional',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Deputy Director': { 
                nivel: 95, 
                categoria: 'Dirección Nacional',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'Associate Deputy Director': { 
                nivel: 90, 
                categoria: 'Dirección Nacional',
                permisos: ['*'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            
            // Mando Ejecutivo
            'EAD': { 
                nivel: 85, 
                categoria: 'Mando Ejecutivo',
                permisos: ['supervisor', 'override', 'cad_full'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'AD': { 
                nivel: 80, 
                categoria: 'Mando Ejecutivo',
                permisos: ['supervisor', 'override', 'cad_full'],
                puede_override: true,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            'DAD': { 
                nivel: 75, 
                categoria: 'Mando Ejecutivo',
                permisos: ['supervisor', 'cad_full'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: true
            },
            
            // Supervisión Operativa
            'SSA': { 
                nivel: 70, 
                categoria: 'Supervisión Operativa',
                permisos: ['supervisor', 'cad_dispatch'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: true,
                puede_asignar_unidades: true,
                puede_emitir_bolos: true,
                puede_aprobar_arrestos: false
            },
            
            // Agentes Operativos
            'SA': { 
                nivel: 60, 
                categoria: 'Agentes Operativos',
                permisos: ['field_officer', 'cad_view'],
                puede_override: false,
                puede_firmar_reportes: true,
                puede_cerrar_llamadas: false,
                puede_asignar_unidades: false,
                puede_emitir_bolos: false,
                puede_aprobar_arrestos: false
            }
        }
    }
};

// ============================================
// FUNCIONES DE VALIDACIÓN JERÁRQUICA
// ============================================

// Validar si un usuario tiene un permiso específico
function tienePermiso(agencia, rango, permiso) {
    const jerarquia = JERARQUIAS[agencia];
    if (!jerarquia) return false;
    
    const rangoData = jerarquia.rangos[rango];
    if (!rangoData) return false;
    
    // Permiso total
    if (rangoData.permisos.includes('*')) return true;
    
    // Permiso específico
    return rangoData.permisos.includes(permiso);
}

// Validar acción específica por nombre
function puedeRealizarAccion(agencia, rango, accion) {
    const jerarquia = JERARQUIAS[agencia];
    if (!jerarquia) return false;
    
    const rangoData = jerarquia.rangos[rango];
    if (!rangoData) return false;
    
    // Mapeo de acciones a propiedades
    const mapaAcciones = {
        'override': 'puede_override',
        'firmar_reportes': 'puede_firmar_reportes',
        'cerrar_llamadas': 'puede_cerrar_llamadas',
        'asignar_unidades': 'puede_asignar_unidades',
        'emitir_bolos': 'puede_emitir_bolos',
        'aprobar_arrestos': 'puede_aprobar_arrestos'
    };
    
    const propiedad = mapaAcciones[accion];
    if (!propiedad) return false;
    
    return rangoData[propiedad] === true;
}

// Validar si un rango puede realizar override sobre otro
function puedeOverride(agenciaA, rangoA, agenciaB, rangoB) {
    const jerarquiaA = JERARQUIAS[agenciaA];
    const jerarquiaB = JERARQUIAS[agenciaB];
    
    if (!jerarquiaA || !jerarquiaB) return false;
    
    const rangoDataA = jerarquiaA.rangos[rangoA];
    const rangoDataB = jerarquiaB.rangos[rangoB];
    
    if (!rangoDataA || !rangoDataB) return false;
    
    // Debe tener permiso de override Y nivel superior
    return rangoDataA.puede_override && rangoDataA.nivel > rangoDataB.nivel;
}

// Obtener nivel de un rango
function getNivel(agencia, rango) {
    const jerarquia = JERARQUIAS[agencia];
    if (!jerarquia) return 0;
    
    return jerarquia.rangos[rango]?.nivel || 0;
}

// Obtener información completa de un rango
function getInfoRango(agencia, rango) {
    const jerarquia = JERARQUIAS[agencia];
    if (!jerarquia) return null;
    
    const rangoData = jerarquia.rangos[rango];
    if (!rangoData) return null;
    
    return {
        agencia: jerarquia.nombre,
        codigo_agencia: jerarquia.codigo,
        rango,
        ...rangoData
    };
}

// Obtener todos los rangos de una agencia
function getRangos(agencia) {
    const jerarquia = JERARQUIAS[agencia];
    if (!jerarquia) return [];
    
    return Object.keys(jerarquia.rangos);
}

// Obtener todas las agencias disponibles
function getAgencias() {
    return Object.keys(JERARQUIAS).map(codigo => ({
        codigo,
        nombre: JERARQUIAS[codigo].nombre
    }));
}

// Validar si un usuario puede aprobar una acción de otro
function puedeAprobar(agenciaAprobador, rangoAprobador, agenciaSolicitante, rangoSolicitante) {
    const nivelAprobador = getNivel(agenciaAprobador, rangoAprobador);
    const nivelSolicitante = getNivel(agenciaSolicitante, rangoSolicitante);
    
    // El aprobador debe tener nivel superior
    return nivelAprobador > nivelSolicitante;
}

// ============================================
// MIDDLEWARE DE VALIDACIÓN PARA EXPRESS
// ============================================

function validarJerarquia(accionRequerida) {
    return (req, res, next) => {
        const { agencia, rango } = req.user || {};
        
        if (!agencia || !rango) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado o sin rango asignado'
            });
        }
        
        if (!puedeRealizarAccion(agencia, rango, accionRequerida)) {
            return res.status(403).json({
                success: false,
                message: `Tu rango (${rango}) no tiene permisos para: ${accionRequerida}`,
                rango_requerido: 'Nivel superior'
            });
        }
        
        next();
    };
}

// ============================================
// EXPORTACIONES
// ============================================

export {
    JERARQUIAS,
    tienePermiso,
    puedeRealizarAccion,
    puedeOverride,
    puedeAprobar,
    getNivel,
    getInfoRango,
    getRangos,
    getAgencias,
    validarJerarquia
};
