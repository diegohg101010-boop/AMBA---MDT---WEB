import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { SkeletonStats } from './SkeletonLoader';
import './DashboardHome.css';

export default function DashboardHome({ setActiveView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discordMembers, setDiscordMembers] = useState(null);

  useEffect(() => {
    loadStats();
    loadDiscordMembers();
    
    const interval = setInterval(loadDiscordMembers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDiscordMembers = async () => {
    try {
      // Usar la API de invitación que es más confiable
      const response = await fetch('https://discord.com/api/v10/invites/5EktDKX6Fk?with_counts=true');
      
      if (!response.ok) {
        console.error('Discord API error:', response.status);
        setDiscordMembers(null);
        return;
      }
      
      const data = await response.json();
      console.log('Discord invite data:', data);
      
      // approximate_presence_count = usuarios online ahora
      // approximate_member_count = total de miembros
      setDiscordMembers(data.approximate_presence_count || 0);
    } catch (error) {
      console.error('Error al cargar miembros de Discord:', error);
      setDiscordMembers(null);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      if (response.success) {
        // Adaptar formato del bot al formato esperado
        const data = response.data;
        const adaptedStats = {
          totalCiudadanos: data.ciudadanos?.total || data.totalCiudadanos || 0,
          totalVehiculos: data.vehiculos?.total || data.totalVehiculos || 0,
          totalDenuncias: data.denuncias?.total || data.totalDenuncias || 0,
          totalArrestos: data.arrestos?.total || data.totalArrestos || 0
        };
        setStats(adaptedStats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Bienvenido al Sistema MDT</h1>
        <p>🇦🇷 Panel de control y gestión policial - [ARM] Área Metropolitana Reborn</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalCiudadanos || 0}</h3>
            <p>Ciudadanos Registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalVehiculos || 0}</h3>
            <p>Vehículos Registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalDenuncias || 0}</h3>
            <p>Denuncias Activas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalArrestos || 0}</h3>
            <p>Arrestos Realizados</p>
          </div>
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card card-animated">
          <h3>🚨 Acceso Rápido</h3>
          <p>Utiliza el menú lateral para navegar entre las diferentes secciones del sistema.</p>
          <ul>
            <li>Gestión de ciudadanos y vehículos</li>
            <li>Registro de denuncias y arrestos</li>
            <li>Control de multas y oficiales</li>
            <li>Generación de reportes</li>
          </ul>
        </div>

        <div className="info-card card-animated">
          <h3>📊 Estado del Sistema</h3>
          <div className="system-status">
            <div className="status-item">
              <span className="status-label">API Backend:</span>
              <div className="status-indicator">
                <span className="status-dot active"></span>
                <span className="badge badge-success">Conectado</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Base de Datos:</span>
              <div className="status-indicator">
                <span className="status-dot active"></span>
                <span className="badge badge-success">Operativa</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Bot Discord:</span>
              <div className="status-indicator">
                <span className="status-dot active"></span>
                <span className="badge badge-success">Activo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card card-animated">
          <h3>⚡ Acciones Rápidas</h3>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => setActiveView('ciudadanos')}>
              <span className="action-icon">🔍</span>
              <span className="action-label">Buscar Ciudadano</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveView('vehiculos')}>
              <span className="action-icon">🚗</span>
              <span className="action-label">Buscar Vehículo</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveView('denuncias')}>
              <span className="action-icon">📋</span>
              <span className="action-label">Nueva Denuncia</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveView('arrestos')}>
              <span className="action-icon">⛓️</span>
              <span className="action-label">Registrar Arresto</span>
            </button>
          </div>
        </div>

        <div className="info-card card-animated">
          <h3>📅 Información del Sistema</h3>
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Versión:</span>
              <span className="info-value">v1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Última actualización:</span>
              <span className="info-value">05/02/2026</span>
            </div>
            <div 
              className="info-row clickable-row"
              onClick={() => window.open('https://discord.gg/5EktDKX6Fk', '_blank')}
              title="Click para abrir Discord"
              style={{ cursor: 'pointer' }}
            >
              <span className="info-label">Servidor:</span>
              <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               Área Metropolitana Reborn
                <svg 
                  style={{ width: '14px', height: '14px', opacity: 0.6 }} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Usuarios activos:</span>
              <span className="info-value">
                {discordMembers !== null ? (
                  <span className="badge badge-info">{discordMembers}</span>
                ) : (
                  <span className="badge badge-info">
                    <span className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
