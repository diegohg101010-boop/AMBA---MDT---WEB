import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { get, run } from '../config/database.js';
import { generateToken, generateRefreshToken, authenticateToken } from '../middleware/auth.js';
import { getPermisos, getDescripcionRol } from '../config/roles.js';
import { loginLimiter, delayResponse, logSecurityEvent, markSuspiciousIP } from '../middleware/security.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Iniciar sesión con seguridad reforzada
 */
router.post('/login', loginLimiter, delayResponse(1000), async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        // Validación estricta de entrada
        if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
            logSecurityEvent('LOGIN_INVALID_INPUT', req);
            markSuspiciousIP(ip);
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Limitar longitud para prevenir ataques
        if (username.length > 100 || password.length > 200) {
            logSecurityEvent('LOGIN_EXCESSIVE_LENGTH', req);
            markSuspiciousIP(ip);
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar intentos previos de esta IP
        const recentAttempts = await get(
            `SELECT COUNT(*) as count FROM auditoria 
             WHERE ip_address = ? AND accion LIKE 'LOGIN_FAILED%' 
             AND datetime(fecha) > datetime('now', '-15 minutes')`,
            [ip]
        );

        if (recentAttempts && recentAttempts.count >= 10) {
            logSecurityEvent('LOGIN_TOO_MANY_ATTEMPTS', req);
            markSuspiciousIP(ip);
            return res.status(429).json({
                success: false,
                message: 'Demasiados intentos fallidos'
            });
        }

        const usuario = await get(
            'SELECT * FROM usuarios_web WHERE username = ? AND activo = 1',
            [username]
        );

        if (!usuario) {
            logSecurityEvent('LOGIN_FAILED_USER', req, { username });
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            logSecurityEvent('LOGIN_FAILED_PASSWORD', req, { username });
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si hay sesiones activas sospechosas
        const activeSessions = await get(
            'SELECT COUNT(*) as count FROM sesiones WHERE usuario_id = ? AND activo = 1',
            [usuario.id]
        );

        if (activeSessions && activeSessions.count >= 5) {
            logSecurityEvent('LOGIN_TOO_MANY_SESSIONS', req, { username });
            // Invalidar sesiones antiguas
            await run(
                `UPDATE sesiones SET activo = 0 
                 WHERE usuario_id = ? AND id NOT IN (
                     SELECT id FROM sesiones WHERE usuario_id = ? 
                     ORDER BY fecha_creacion DESC LIMIT 3
                 )`,
                [usuario.id, usuario.id]
            );
        }

        // Generar tokens con información adicional de seguridad
        const sessionId = crypto.randomBytes(32).toString('hex');
        const token = generateToken(usuario.id, usuario.username, usuario.rol);
        const refreshToken = generateRefreshToken(usuario.id);

        // Guardar sesión con fingerprint
        await run(
            `INSERT INTO sesiones (usuario_id, refresh_token, ip_address, user_agent, fecha_creacion, fecha_expiracion, activo) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario.id,
                refreshToken,
                ip,
                userAgent,
                new Date().toISOString(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                1
            ]
        );

        // Actualizar último acceso
        await run(
            'UPDATE usuarios_web SET ultimo_acceso = ? WHERE id = ?',
            [new Date().toISOString(), usuario.id]
        );

        // Registrar en auditoría
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, ip_address, fecha) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario.username, 'LOGIN_SUCCESS', 'auth', `Login exitoso desde ${ip}`, ip, new Date().toISOString()]
        );
        
        logSecurityEvent('LOGIN_SUCCESS', req, { username: usuario.username, sessionId });

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                refreshToken,
                user: {
                    id: usuario.id,
                    username: usuario.username,
                    rol: usuario.rol,
                    dniOficial: usuario.dni_oficial
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        logSecurityEvent('LOGIN_ERROR', req, { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Invalidar todas las sesiones del usuario
        await run(
            'UPDATE sesiones SET activo = 0 WHERE usuario_id = ?',
            [req.user.id]
        );

        // Registrar en auditoría
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, ip_address, fecha) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.username, 'LOGOUT', 'auth', 'Cierre de sesión', req.ip, new Date().toISOString()]
        );

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
        });
    }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const usuario = await get(
            'SELECT id, username, rol, dni_oficial, ultimo_acceso, fecha_creacion FROM usuarios_web WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Error en /me:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario'
        });
    }
});

/**
 * GET /api/auth/permisos
 * Obtener permisos del usuario autenticado
 */
router.get('/permisos', authenticateToken, async (req, res) => {
    try {
        const permisos = getPermisos(req.user.rol);
        const descripcion = getDescripcionRol(req.user.rol);

        res.json({
            success: true,
            data: {
                rol: req.user.rol,
                descripcion,
                permisos
            }
        });
    } catch (error) {
        console.error('Error en /permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener permisos'
        });
    }
});

export default router;
