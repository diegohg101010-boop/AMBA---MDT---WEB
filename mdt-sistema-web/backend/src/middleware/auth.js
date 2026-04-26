import jwt from 'jsonwebtoken';
import { get } from '../config/database.js';
import botAPI from '../config/bot-api.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

/**
 * Middleware de autenticación JWT
 */
export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticación requerido' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        const usuario = await get(
            'SELECT id, username, rol, dni_oficial, activo FROM usuarios_web WHERE id = ?',
            [decoded.userId]
        );

        if (!usuario || !usuario.activo) {
            return res.status(403).json({ 
                success: false, 
                message: 'Usuario inactivo o no encontrado' 
            });
        }

        req.user = {
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol,
            dni: usuario.dni_oficial,
            dniOficial: usuario.dni_oficial
        };

        // Si tiene DNI de oficial, obtener agencia y rango del BOT
        if (usuario.dni_oficial) {
            try {
                const response = await botAPI.get(`/api/oficiales/${usuario.dni_oficial}`);
                if (response.data && response.data.success && response.data.data) {
                    req.user.agencia = response.data.data.agencia;
                    req.user.rango = response.data.data.rango;
                }
            } catch (error) {
                // Si no se puede obtener del BOT, continuar sin agencia/rango
                console.warn(`[AUTH] No se pudo obtener agencia/rango para DNI ${usuario.dni_oficial}`);
            }
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expirado' 
            });
        }
        
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
}

/**
 * Middleware de autorización por rol
 */
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado' 
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para realizar esta acción',
                requiredRoles: roles,
                yourRole: req.user.rol
            });
        }

        next();
    };
}

/**
 * Middleware de autorización por permiso específico
 */
export function requirePermission(permiso) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado' 
            });
        }

        // Importar dinámicamente para evitar dependencias circulares
        const { tienePermiso } = await import('../config/roles.js');
        
        if (!tienePermiso(req.user.rol, permiso)) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para realizar esta acción',
                requiredPermission: permiso,
                yourRole: req.user.rol
            });
        }

        next();
    };
}

/**
 * Generar token JWT
 */
export function generateToken(userId, username, rol) {
    return jwt.sign(
        { userId, username, rol },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
}

/**
 * Generar refresh token
 */
export function generateRefreshToken(userId) {
    return jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
}

/**
 * Verificar refresh token
 */
export function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'refresh') {
            throw new Error('Token inválido');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
}
