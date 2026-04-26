import express from 'express';
import bcrypt from 'bcryptjs';
import { all, run, get } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// POST /api/admin/users - Crear nuevo usuario (Solo Admin y Jefatura)
router.post('/users', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { username, password, rol, dni_oficial } = req.body;

        // Validaciones
        if (!username || !password || !rol) {
            return res.status(400).json({
                success: false,
                message: 'Username, password y rol son requeridos'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const rolesValidos = ['Admin', 'Jefatura', 'Supervisor', 'Oficial', 'Cadete'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido'
            });
        }

        // Verificar que el username no exista
        const existente = await get('SELECT id FROM usuarios_web WHERE username = ?', [username]);
        if (existente) {
            return res.status(400).json({
                success: false,
                message: 'El username ya existe'
            });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        await run(`
            INSERT INTO usuarios_web (username, password_hash, rol, dni_oficial, activo, fecha_creacion, creado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [username, passwordHash, rol, dni_oficial || null, 1, new Date().toISOString(), req.user.username]);

        // Registrar en auditoría
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'CREATE', 'usuarios', `Usuario creado: ${username} (${rol})`, new Date().toISOString()]
        );

        res.json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                username,
                rol
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
});

// GET /api/admin/users - Listar usuarios (Solo Admin y Jefatura)
router.get('/users', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const usuarios = await all(`
            SELECT id, username, rol, dni_oficial, activo, ultimo_acceso, fecha_creacion, creado_por
            FROM usuarios_web
            ORDER BY fecha_creacion DESC
        `);

        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar usuarios'
        });
    }
});

// GET /api/admin/auditoria (Solo Admin y Jefatura)
router.get('/auditoria', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { limit = 100, modulo } = req.query;
        
        let query = 'SELECT * FROM auditoria WHERE 1=1';
        const params = [];

        if (modulo) {
            query += ' AND modulo = ?';
            params.push(modulo);
        }

        query += ' ORDER BY fecha DESC LIMIT ?';
        params.push(parseInt(limit));

        const auditoria = await all(query, params);

        res.json({
            success: true,
            data: auditoria
        });
    } catch (error) {
        console.error('Error al obtener auditoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener auditoría'
        });
    }
});

// GET /api/admin/stats (Solo Admin y Jefatura)
router.get('/stats', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        // Estadísticas globales para administradores
        const totalUsuarios = await all('SELECT COUNT(*) as total FROM usuarios_web');
        const totalOficiales = await all('SELECT COUNT(*) as total FROM oficiales');
        const totalAuditoria = await all('SELECT COUNT(*) as total FROM auditoria');

        res.json({
            success: true,
            data: {
                usuarios: totalUsuarios[0].total,
                oficiales: totalOficiales[0].total,
                registrosAuditoria: totalAuditoria[0].total
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// DELETE /api/admin/users/:id - Eliminar/Desactivar usuario (Solo Admin)
router.delete('/users/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Desactivar en lugar de eliminar (mejor práctica)
        await run('UPDATE usuarios_web SET activo = 0 WHERE id = ?', [id]);

        // Invalidar sesiones
        await run('UPDATE sesiones SET activo = 0 WHERE usuario_id = ?', [id]);

        // Registrar en auditoría
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'DELETE', 'usuarios', `Usuario desactivado: ${usuario.username}`, new Date().toISOString()]
        );

        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
});

// PUT /api/admin/users/:id/activate - Reactivar usuario (Solo Admin)
router.put('/users/:id/activate', authenticateToken, authorizeRoles(ROLES.ADMIN), async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await run('UPDATE usuarios_web SET activo = 1 WHERE id = ?', [id]);

        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'UPDATE', 'usuarios', `Usuario reactivado: ${usuario.username}`, new Date().toISOString()]
        );

        res.json({
            success: true,
            message: 'Usuario reactivado exitosamente'
        });
    } catch (error) {
        console.error('Error al reactivar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reactivar usuario'
        });
    }
});

// GET /api/admin/sessions - Ver sesiones activas con IPs (Solo Admin y Jefatura)
router.get('/sessions', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const sesiones = await all(`
            SELECT 
                s.id,
                s.usuario_id,
                u.username,
                u.rol,
                s.ip_address,
                s.user_agent,
                s.fecha_creacion,
                s.fecha_expiracion,
                s.activo
            FROM sesiones s
            JOIN usuarios_web u ON s.usuario_id = u.id
            ORDER BY s.fecha_creacion DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            data: sesiones
        });
    } catch (error) {
        console.error('Error al obtener sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener sesiones'
        });
    }
});

export default router;
