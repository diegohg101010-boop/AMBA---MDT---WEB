/**
 * Sistema de Roles y Permisos - MDT Houston Spanish Roleplay
 * 
 * Jerarquía de roles (de mayor a menor privilegio):
 * 1. Admin - Acceso total al sistema
 * 2. Jefatura - Gestión completa de operaciones
 * 3. Supervisor - Crear y actualizar registros
 * 4. Oficial - Crear registros básicos
 * 5. Cadete - Solo lectura
 */

export const ROLES = {
    ADMIN: 'Admin',
    JEFATURA: 'Jefatura',
    SUPERVISOR: 'Supervisor',
    OFICIAL: 'Oficial',
    CADETE: 'Cadete'
};

export const PERMISOS = {
    // Módulo: Ciudadanos
    CIUDADANOS_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    CIUDADANOS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    CIUDADANOS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    CIUDADANOS_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],
    CIUDADANOS_ESTADO: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL], // Búsqueda y captura

    // Módulo: Vehículos
    VEHICULOS_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    VEHICULOS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    VEHICULOS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    VEHICULOS_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],

    // Módulo: Arrestos
    ARRESTOS_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    ARRESTOS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    ARRESTOS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    ARRESTOS_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],
    ARRESTOS_LIBERAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],

    // Módulo: Multas
    MULTAS_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    MULTAS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    MULTAS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    MULTAS_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],
    MULTAS_PAGAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],

    // Módulo: Denuncias
    DENUNCIAS_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    DENUNCIAS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    DENUNCIAS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    DENUNCIAS_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],
    DENUNCIAS_ESTADO: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],

    // Módulo: Oficiales
    OFICIALES_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    OFICIALES_CREAR: [ROLES.ADMIN, ROLES.JEFATURA],
    OFICIALES_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA],
    OFICIALES_ELIMINAR: [ROLES.ADMIN],
    OFICIALES_SANCIONES: [ROLES.ADMIN, ROLES.JEFATURA],

    // Módulo: Reportes
    REPORTES_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    REPORTES_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL],
    REPORTES_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    REPORTES_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],
    REPORTES_APROBAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],

    // Módulo: Búsqueda y Captura
    BUSQUEDA_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    BUSQUEDA_CREAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    BUSQUEDA_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR],
    BUSQUEDA_ELIMINAR: [ROLES.ADMIN, ROLES.JEFATURA],

    // Módulo: Dashboard
    DASHBOARD_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    DASHBOARD_STATS_AVANZADAS: [ROLES.ADMIN, ROLES.JEFATURA],

    // Módulo: Administración
    ADMIN_USUARIOS_LEER: [ROLES.ADMIN, ROLES.JEFATURA],
    ADMIN_USUARIOS_CREAR: [ROLES.ADMIN, ROLES.JEFATURA],
    ADMIN_USUARIOS_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA],
    ADMIN_USUARIOS_ELIMINAR: [ROLES.ADMIN],
    ADMIN_AUDITORIA: [ROLES.ADMIN, ROLES.JEFATURA],
    ADMIN_CONFIG: [ROLES.ADMIN],

    // Código Penal
    CODIGO_PENAL_LEER: [ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE],
    CODIGO_PENAL_ACTUALIZAR: [ROLES.ADMIN, ROLES.JEFATURA]
};

/**
 * Verificar si un rol tiene un permiso específico
 */
export function tienePermiso(rol, permiso) {
    const rolesPermitidos = PERMISOS[permiso];
    if (!rolesPermitidos) {
        console.warn(`Permiso no definido: ${permiso}`);
        return false;
    }
    return rolesPermitidos.includes(rol);
}

/**
 * Obtener todos los permisos de un rol
 */
export function getPermisos(rol) {
    const permisos = {};
    for (const [permiso, roles] of Object.entries(PERMISOS)) {
        permisos[permiso] = roles.includes(rol);
    }
    return permisos;
}

/**
 * Validar si un rol es válido
 */
export function esRolValido(rol) {
    return Object.values(ROLES).includes(rol);
}

/**
 * Obtener descripción del rol
 */
export function getDescripcionRol(rol) {
    const descripciones = {
        [ROLES.ADMIN]: 'Acceso total al sistema',
        [ROLES.JEFATURA]: 'Gestión completa de operaciones',
        [ROLES.SUPERVISOR]: 'Crear y actualizar registros',
        [ROLES.OFICIAL]: 'Crear registros básicos',
        [ROLES.CADETE]: 'Solo lectura'
    };
    return descripciones[rol] || 'Rol desconocido';
}

/**
 * Obtener nivel jerárquico del rol (menor número = mayor privilegio)
 */
export function getNivelRol(rol) {
    const niveles = {
        [ROLES.ADMIN]: 1,
        [ROLES.JEFATURA]: 2,
        [ROLES.SUPERVISOR]: 3,
        [ROLES.OFICIAL]: 4,
        [ROLES.CADETE]: 5
    };
    return niveles[rol] || 999;
}

/**
 * Verificar si un rol tiene mayor o igual jerarquía que otro
 */
export function tieneMayorJerarquia(rol1, rol2) {
    return getNivelRol(rol1) <= getNivelRol(rol2);
}

export default {
    ROLES,
    PERMISOS,
    tienePermiso,
    getPermisos,
    esRolValido,
    getDescripcionRol,
    getNivelRol,
    tieneMayorJerarquia
};
