import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BackgroundEffects from './components/BackgroundEffects';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <BackgroundEffects />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundEffects />
      {user ? <Dashboard /> : <Login />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
