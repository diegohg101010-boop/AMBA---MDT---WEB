import { Icon } from './Icons';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import './Icons.css';

export default function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }) {
  const { user } = useAuth();
  
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: 'Dashboard' },
    { id: 'cad', label: 'CAD - Despacho', icon: 'Emergency' },
    { id: 'ciudadanos', label: 'Ciudadanos', icon: 'Citizen' },
    { id: 'vehiculos', label: 'Vehículos', icon: 'Vehicle' },
    { id: 'denuncias', label: 'Denuncias', icon: 'Report' },
    { id: 'arrestos', label: 'Arrestos', icon: 'Arrest' },
    { id: 'multas', label: 'Multas', icon: 'Fine' },
    { id: 'busqueda', label: 'Búsqueda y Captura', icon: 'Wanted' },
    { id: 'codigo-penal', label: 'Código Penal', icon: 'Law' },
    { id: 'oficiales', label: 'Oficiales', icon: 'Officer' }
  ];

  // Reportes: Oficial para arriba
  if (['Admin', 'Jefatura', 'Supervisor', 'Oficial'].includes(user?.rol)) {
    menuItems.push({ id: 'reportes', label: 'Reportes', icon: 'Stats' });
  }

  // Auditoría: Supervisor para arriba
  if (['Admin', 'Jefatura', 'Supervisor'].includes(user?.rol)) {
    menuItems.push({ id: 'auditoria', label: 'Auditoría', icon: 'History' });
  }

  // Gestión de Usuarios: Solo Admin
  if (user?.rol === 'Admin') {
    menuItems.push({ id: 'usuarios', label: 'Gestión de Usuarios', icon: 'Officer' });
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <div className="logo-text">
              <h2>🇦🇷 [ARM] MDT</h2>
              <p>🇦🇷 Sistema Policial</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
            >
              <span className="nav-icon">
                <Icon name={item.icon} className="icon-md" />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <Icon name="Active" className="icon-sm icon-pulse" style={{ color: '#2ecc71' }} />
            <span>Sistema Activo</span>
          </div>
        </div>
      </aside>
    </>
  );
}
