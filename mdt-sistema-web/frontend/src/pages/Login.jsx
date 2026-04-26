import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (!result.success) {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="police-lights"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="badge-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <h1>Sistema MDT</h1>
          <p>🇦🇷 [ARM] Área Metropolitana Reborn</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M10 17l5-5-5-5v10z"/>
                </svg>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Sistema de Gestión Policial</p>
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
