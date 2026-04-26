// Sistema de Iconos Personalizados - MDT Policial
// Estilo: Law Enforcement Estadounidense - Oscuro y Profesional

export const Icons = {
  // CIUDADANOS Y PERSONAS
  Citizen: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M12 2L10 4H14L12 2Z" fill="currentColor" opacity="0.3"/>
      <rect x="8" y="4" width="8" height="3" fill="currentColor"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 22V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <rect x="11" y="6" width="2" height="1" fill="currentColor"/>
    </svg>
  ),

  // OFICIAL DE POLICÍA
  Officer: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M12 2L8 4L12 6L16 4L12 2Z" fill="currentColor"/>
      <rect x="10" y="5" width="4" height="2" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 22V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <rect x="11" y="10" width="2" height="2" fill="currentColor"/>
      <path d="M9 4L10 5L11 4M13 4L14 5L15 4" stroke="currentColor" strokeWidth="0.5"/>
    </svg>
  ),

  // BADGE POLICIAL - CON SOL DE MAYO
  Badge: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
      {/* Sol de Mayo */}
      <g transform="translate(12,12)">
        <circle cx="0" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M0 -3 L0.5 -1 L3 -1 L1.5 0 L2 2 L0 1 L-2 2 L-1.5 0 L-3 -1 L-0.5 -1 Z" fill="currentColor"/>
      </g>
      <text x="12" y="6" fontSize="3" fill="currentColor" textAnchor="middle" fontWeight="bold">★</text>
    </svg>
  ),

  // ARRESTOS
  Arrest: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="4" y="10" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="14" y="10" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 10V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V10" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="4" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1"/>
      <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1"/>
      <rect x="10" y="18" width="4" height="2" fill="currentColor" opacity="0.5"/>
    </svg>
  ),

  // MULTAS
  Fine: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="6" y="4" width="12" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="9" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <text x="12" y="18" fontSize="5" fill="currentColor" textAnchor="middle" fontWeight="bold">$</text>
    </svg>
  ),

  // DENUNCIAS
  Report: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M7 3H17L20 6V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V6L7 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 3V6H4M17 3V6H20" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <rect x="7" y="9" width="2" height="2" fill="currentColor" opacity="0.5"/>
    </svg>
  ),

  // VEHÍCULOS
  Vehicle: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M5 13L7 8H17L19 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <rect x="3" y="13" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="7" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="18" r="1.5" fill="currentColor"/>
      <rect x="9" y="9" width="6" height="3" fill="currentColor" opacity="0.3"/>
      <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="0.5"/>
    </svg>
  ),

  // BÚSQUEDA Y CAPTURA - CON SOL DE MAYO
  Wanted: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" fill="none"/>
      {/* Sol de Mayo en el centro */}
      <g transform="translate(12,12)">
        <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M0 -2 L0.3 -0.5 L2 -0.5 L0.8 0 L1.2 1 L0 0.5 L-1.2 1 L-0.8 0 L-2 -0.5 L-0.3 -0.5 Z" fill="currentColor"/>
      </g>
      <line x1="12" y1="3" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="12" y1="19" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="19" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // PELIGROSO
  Dangerous: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M12 2L21 8V16L12 22L3 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
      <path d="M12 2L21 8M12 2L3 8M12 22L21 16M12 22L3 16" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),

  // DASHBOARD
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // BÚSQUEDA
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
      <line x1="19" y1="21" x2="21" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  ),

  // ANTECEDENTES LIMPIOS
  Clean: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),

  // ANTECEDENTES CRIMINALES
  Criminal: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),

  // LICENCIA
  License: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="4" y="6" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="9" cy="12" r="2.5" stroke="currentColor" strokeWidth="1" fill="none"/>
      <line x1="14" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="14" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="14" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <rect x="4" y="6" width="16" height="2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),

  // SISTEMA/CONFIGURACIÓN
  System: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 2L13 5M12 22L13 19M22 12L19 13M2 12L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <path d="M19 5L17 7M5 19L7 17M19 19L17 17M5 5L7 7" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // ALERTA/NOTIFICACIÓN
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M12 2L22 20H2L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
      <path d="M12 2L22 20M12 2L2 20" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),

  // CÓDIGO PENAL
  Law: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="6" y="2" width="12" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="9" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <rect x="6" y="2" width="12" height="3" fill="currentColor" opacity="0.3"/>
      <text x="12" y="4.5" fontSize="2" fill="currentColor" textAnchor="middle" fontWeight="bold">§</text>
    </svg>
  ),

  // EVIDENCIA
  Evidence: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="8" y="7" width="8" height="6" stroke="currentColor" strokeWidth="1" fill="none"/>
      <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <line x1="8" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
      <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // TIEMPO/HISTORIAL
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <line x1="12" y1="3" x2="12" y2="4" stroke="currentColor" strokeWidth="1"/>
      <line x1="12" y1="20" x2="12" y2="21" stroke="currentColor" strokeWidth="1"/>
      <line x1="3" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1"/>
      <line x1="20" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),

  // ESTADO ACTIVO
  Active: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="M12 3V5M12 19V21M21 12H19M5 12H3" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),

  // ESTADO INACTIVO
  Inactive: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),

  // DEPARTAMENTO
  Department: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M3 21V10L12 3L21 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <rect x="9" y="14" width="6" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <rect x="7" y="8" width="3" height="3" fill="currentColor" opacity="0.3"/>
      <rect x="14" y="8" width="3" height="3" fill="currentColor" opacity="0.3"/>
      <path d="M12 3L12 6" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),

  // RANGO
  Rank: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <path d="M4 20L12 4L20 20H4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="10" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1"/>
      <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // ESTADÍSTICAS
  Stats: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <rect x="4" y="14" width="4" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="10" y="10" width="4" height="11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="16" y="6" width="4" height="15" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      <circle cx="6" cy="16" r="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="18" cy="8" r="1" fill="currentColor"/>
    </svg>
  ),

  // EMERGENCIA 911
  Emergency: () => (
    <svg viewBox="0 0 24 24" fill="none" className="icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
      <path d="M12 3L12 4M12 20L12 21M21 12L20 12M4 12L3 12" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
};

// Componente wrapper para usar los iconos
export const Icon = ({ name, className = "", style = {} }) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <span className={`icon-wrapper ${className}`} style={style}>
      <IconComponent />
    </span>
  );
};

export default Icon;
