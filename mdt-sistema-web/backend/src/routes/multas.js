import express from 'express';
import { getMultas, createMulta, deleteMulta } from '../config/bot-api.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// GET /api/multas (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { limit = 50, pagada } = req.query;
        const result = await getMultas({ limit, pagada });
        res.json(result);
    } catch (error) {
        console.error('Error al listar multas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar multas'
        });
    }
});

// POST /api/multas - Crear nueva multa (Admin, Jefatura, Supervisor, Oficial)
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL), async (req, res) => {
    try {
        console.log('[MDT BACKEND] Body recibido en multas:', req.body);
        
        const { dni_dueno, oficial, articulos, notas, evidencias } = req.body;
        
        console.log('[MDT BACKEND] Datos procesados:', { dni_dueno, oficial, articulos, notas });
        
        const result = await createMulta({
            dni_dueno,
            oficial,
            articulos,
            notas,
            evidencias
        });
        
        res.json(result);
    } catch (error) {
        console.error('[MDT BACKEND] Error al crear multa:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear multa'
        });
    }
});

// DELETE /api/multas/:id - Eliminar multa (Solo Admin y Jefatura)
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteMulta(id);
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar multa:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Multa no encontrada'
            });
        }
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al eliminar multa'
        });
    }
});

export default router;
