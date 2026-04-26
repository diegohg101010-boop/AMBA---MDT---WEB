import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Roles disponibles en el sistema
export const ROLES = {
  ADMIN: 'Admin',
  JEFATURA: 'Jefatura',
  SUPERVISOR: 'Supervisor',
  OFICIAL: 'Oficial',
  CADETE: 'Cadete'
};

// Permisos por rol
const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], // Acceso total
  [ROLES.JEFATURA]: [
    'view_all',
    'create_all',
    'update_all',
    'delete_denuncias',
    'delete_arrestos',
    'manage_users'
  ],
  [ROLES.SUPERVISOR]: [
    'view_all',
    'create_all',
    'update_denuncias',
    'update_arrestos',
    'update_multas'
  ],
  [ROLES.OFICIAL]: [
    'view_all',
    'create_denuncias',
    'create_arrestos',
    'create_multas',
    'create_busqueda'
  ],
  [ROLES.CADETE]: [
    'view_ciudadanos',
    'view_vehiculos',
    'view_denuncias'
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Timeout de inactividad: 30 minutos
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Eventos que indican actividad
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Verificar inactividad cada minuto
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        logout();
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [user, lastActivity]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      
      if (response.success) {
        const { token, refreshToken, user } = response.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    if (!user || !user.rol) return false;
    
    const userPermissions = PERMISSIONS[user.rol] || [];
    
    // Admin tiene todos los permisos
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permission);
  };

  // Verificar si el usuario tiene uno de varios roles
  const hasRole = (...roles) => {
    if (!user || !user.rol) return false;
    return roles.includes(user.rol);
  };

  // Verificar si puede crear registros
  const canCreate = (module) => {
    return hasPermission('create_all') || hasPermission(`create_${module}`);
  };

  // Verificar si puede actualizar registros
  const canUpdate = (module) => {
    return hasPermission('update_all') || hasPermission(`update_${module}`);
  };

  // Verificar si puede eliminar registros
  const canDelete = (module) => {
    return hasPermission('*') || hasPermission(`delete_${module}`);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    canCreate,
    canUpdate,
    canDelete
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
