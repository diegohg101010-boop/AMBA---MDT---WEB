import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ user, toggleSidebar }) {
  const { logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          <div className="hamburger">
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
        </button>
        
        <div className="header-title">
          <h1>Sistema MDT</h1>
          <p>🇦🇷 [ARM] Área Metropolitana Reborn</p>
        </div>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.rol}</span>
          </div>
        </div>

        <button className="btn-logout" onClick={logout} title="Cerrar Sesión">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
