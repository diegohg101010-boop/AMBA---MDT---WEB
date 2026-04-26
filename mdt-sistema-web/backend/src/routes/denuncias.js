import express from 'express';
import { getDenuncias, getDenuncia, updateDenuncia, createDenuncia, deleteDenuncia } from '../config/bot-api.js';
import { run } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// GET /api/denuncias (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { estado, prioridad, limit = 50 } = req.query;
        const result = await getDenuncias({ estado, prioridad, limit });
        res.json(result);
    } catch (error) {
        console.error('Error al listar denuncias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar denuncias'
        });
    }
});

// GET /api/denuncias/:numero (Todos los roles)
router.get('/:numero', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { numero } = req.params;
        const result = await getDenuncia(numero);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener denuncia:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener denuncia'
        });
    }
});

// POST /api/denuncias - Crear nueva denuncia (Admin, Jefatura, Supervisor, Oficial)
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL), async (req, res) => {
    try {
        const { dni_denunciante, dni_acusado, tipo_denuncia, descripcion, ubicacion, prioridad, oficial_receptor } = req.body;
        
        // Usar el oficial_receptor del formulario, no el usuario logueado
        // El oficial_receptor debe ser el DNI del oficial que recibe la denuncia
        console.log('[MDT BACKEND] Datos recibidos del frontend:', { dni_denunciante, dni_acusado, tipo_denuncia, oficial_receptor });
        console.log('[MDT BACKEND] Usuario logueado:', req.user?.username);
        console.log('[MDT BACKEND] Enviando al bot API con oficial_receptor:', oficial_receptor);
        
        const result = await createDenuncia({
            dni_denunciante,
            dni_acusado,
            tipo_denuncia,
            descripcion,
            ubicacion,
            prioridad,
            oficial_receptor
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error al crear denuncia:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear denuncia'
        });
    }
});

// PUT /api/denuncias/:numero (Admin, Jefatura, Supervisor)
router.put('/:numero', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR), async (req, res) => {
    try {
        const { numero } = req.params;
        const { estado, notas } = req.body;

        // Actualizar a través de la API del bot
        const result = await updateDenuncia(numero, {
            estado,
            notas,
            oficial: req.user.username
        });

        // Registrar en auditoría local
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'UPDATE', 'denuncias', `Denuncia actualizada: ${numero}`, new Date().toISOString()]
        );

        res.json(result);
    } catch (error) {
        console.error('Error al actualizar denuncia:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al actualizar denuncia'
        });
    }
});

// DELETE /api/denuncias/:numero (Todos los roles autenticados - TEMPORAL PARA DEBUG)
router.delete('/:numero', authenticateToken, async (req, res) => {
    try {
        const { numero } = req.params;

        console.log(`[BACKEND] Usuario: ${req.user.username}, Rol: ${req.user.rol}`);
        console.log(`[BACKEND] Intentando eliminar denuncia: ${numero}`);

        // Eliminar a través de la API del bot
        const result = await deleteDenuncia(numero);

        console.log(`[BACKEND] Denuncia eliminada exitosamente: ${numero}`);
        console.log(`[BACKEND] Resultado:`, result);

        // Registrar en auditoría local
        try {
            await run(
                'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
                [req.user.username, 'DELETE', 'denuncias', `Denuncia eliminada: ${numero}`, new Date().toISOString()]
            );
            console.log(`[BACKEND] Auditoría registrada exitosamente`);
        } catch (auditError) {
            console.error('[BACKEND] Error al registrar auditoría:', auditError);
            // No fallar si la auditoría falla
        }

        res.json(result);
    } catch (error) {
        console.error('[BACKEND] Error al eliminar denuncia:', error);
        console.error('[BACKEND] Error stack:', error.stack);
        console.error('[BACKEND] Error response:', error.response?.data);
        console.error('[BACKEND] Error status:', error.response?.status);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Error al eliminar denuncia',
            details: error.stack
        });
    }
});

export default router;
