import express from 'express';
import bcrypt from 'bcryptjs';
import { get, all, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { logSecurityEvent } from '../middleware/security.js';

const router = express.Router();

// Middleware para verificar que solo Admin puede acceder
function requireAdmin(req, res, next) {
    console.log('[USERS] Verificando acceso Admin:', { 
        userId: req.user?.id,
        username: req.user?.username,
        rol: req.user?.rol,
        fullUser: req.user 
    });
    
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    
    if (req.user.rol !== 'Admin') {
        logSecurityEvent('UNAUTHORIZED_ACCESS', req, { module: 'users', rol: req.user.rol });
        return res.status(403).json({ 
            success: false, 
            message: `Acceso denegado. Tu rol es: ${req.user.rol}. Se requiere: Admin` 
        });
    }
    next();
}

// GET /api/users - Listar todos los usuarios
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const usuarios = await all(`
            SELECT id, username, rol, dni_oficial, activo, ultimo_acceso, fecha_creacion
            FROM usuarios_web
            ORDER BY fecha_creacion DESC
        `);

        res.json({ success: true, data: usuarios });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
});

// POST /api/users - Crear nuevo usuario
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, password, rol, dniOficial } = req.body;

        if (!username || !password || !rol) {
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const rolesValidos = ['Admin', 'Jefatura', 'Supervisor', 'Oficial', 'Cadete'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ success: false, message: 'Rol inválido' });
        }

        // Verificar si existe
        const existente = await get('SELECT id FROM usuarios_web WHERE username = ?', [username]);
        if (existente) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await run(`
            INSERT INTO usuarios_web (username, password_hash, rol, dni_oficial, activo, fecha_creacion, creado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [username, passwordHash, rol, dniOficial || null, 1, new Date().toISOString(), req.user.username]);

        logSecurityEvent('USER_CREATED', req, { newUser: username, rol });

        res.json({ 
            success: true, 
            message: 'Usuario creado exitosamente',
            data: { id: result.lastID, username, rol }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }
});

// PUT /api/users/:id/toggle - Activar/Desactivar usuario
router.put('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const nuevoEstado = usuario.activo === 1 ? 0 : 1;

        await run('UPDATE usuarios_web SET activo = ? WHERE id = ?', [nuevoEstado, id]);

        if (nuevoEstado === 0) {
            await run('UPDATE sesiones SET activo = 0 WHERE usuario_id = ?', [id]);
        }

        logSecurityEvent('USER_TOGGLED', req, { targetUser: usuario.username, newState: nuevoEstado });

        res.json({ 
            success: true, 
            message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`,
            data: { activo: nuevoEstado }
        });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar estado' });
    }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (usuario.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'No puedes eliminar tu propio usuario' });
        }

        await run('DELETE FROM sesiones WHERE usuario_id = ?', [id]);
        await run('DELETE FROM usuarios_web WHERE id = ?', [id]);

        logSecurityEvent('USER_DELETED', req, { deletedUser: usuario.username });

        res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
});

// PUT /api/users/:id/password - Cambiar contraseña
router.put('/:id/password', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await run('UPDATE usuarios_web SET password_hash = ? WHERE id = ?', [passwordHash, id]);

        logSecurityEvent('PASSWORD_CHANGED', req, { targetUser: usuario.username });

        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar contraseña' });
    }
});

export default router;
