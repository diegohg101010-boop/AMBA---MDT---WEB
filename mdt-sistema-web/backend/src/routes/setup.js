import express from 'express';
import bcrypt from 'bcryptjs';
import { get, run } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/setup/create-initial-users
 * Crear los usuarios iniciales del sistema (solo si no hay usuarios)
 */
router.post('/create-initial-users', async (req, res) => {
    try {
        // Verificar si ya existen usuarios
        const existingUsers = await get('SELECT COUNT(*) as count FROM usuarios_web');
        
        if (existingUsers.count > 0) {
            return res.status(403).json({
                success: false,
                message: 'Ya existen usuarios en el sistema. Este endpoint solo funciona una vez.'
            });
        }

        const usuarios = [
            {
                username: 'Consejo Administrativo',
                password: 'n15W4pXJSUkS',
                rol: 'Admin'
            },
            {
                username: 'Jefatura',
                password: '96t23SDJ7zpC',
                rol: 'Jefatura'
            },
            {
                username: 'Supervisor',
                password: 'eoVqkW624RQn',
                rol: 'Supervisor'
            },
            {
                username: 'Oficial',
                password: 'pu~28oG5KF}`',
                rol: 'Oficial'
            },
            {
                username: 'Cadete',
                password: '83)\'U4Dy£7eK',
                rol: 'Cadete'
            }
        ];

        const creados = [];
        const errores = [];

        for (const usuario of usuarios) {
            try {
                const passwordHash = await bcrypt.hash(usuario.password, 10);
                
                await run(`
                    INSERT INTO usuarios_web (username, password_hash, rol, activo, fecha_creacion, creado_por)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [usuario.username, passwordHash, usuario.rol, 1, new Date().toISOString(), 'setup-inicial']);

                creados.push({
                    username: usuario.username,
                    rol: usuario.rol
                });
            } catch (error) {
                errores.push({
                    username: usuario.username,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `${creados.length} usuarios creados exitosamente`,
            data: {
                creados,
                errores
            }
        });

    } catch (error) {
        console.error('Error creando usuarios iniciales:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuarios iniciales',
            error: error.message
        });
    }
});

/**
 * POST /api/setup/activate-all-users
 * Activar todos los usuarios del sistema
 */
router.post('/activate-all-users', async (req, res) => {
    try {
        await run('UPDATE usuarios_web SET activo = 1');
        
        const usuarios = await get('SELECT COUNT(*) as count FROM usuarios_web WHERE activo = 1');
        
        res.json({
            success: true,
            message: 'Todos los usuarios han sido activados',
            data: {
                usuariosActivos: usuarios.count
            }
        });
    } catch (error) {
        console.error('Error activando usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al activar usuarios',
            error: error.message
        });
    }
});

export default router;
