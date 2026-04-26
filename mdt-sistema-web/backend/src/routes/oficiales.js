import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import botAPI from '../config/bot-api.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// Proxy all oficiales requests to Bot API

// GET /api/oficiales - Listar todos los oficiales (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        console.log('[MDT Backend] GET /api/oficiales - Proxying to Bot API');
        const response = await botAPI.get('/api/oficiales', { params: req.query });
        console.log('[MDT Backend] Bot API response:', response.data);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al listar oficiales:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al listar oficiales'
        });
    }
});

// GET /api/oficiales/:id - Obtener oficial específico con sanciones (Todos los roles)
router.get('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[MDT Backend] GET /api/oficiales/' + id + ' - Proxying to Bot API');
        const response = await botAPI.get(`/api/oficiales/${id}`);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al obtener oficial:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al obtener oficial'
        });
    }
});

// POST /api/oficiales - Crear nuevo oficial (Solo Admin y Jefatura)
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        console.log('[MDT Backend] POST /api/oficiales - Datos recibidos:', req.body);
        console.log('[MDT Backend] Proxying to Bot API...');
        const response = await botAPI.post('/api/oficiales', req.body);
        console.log('[MDT Backend] Bot API response:', response.data);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al crear oficial:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear oficial'
        });
    }
});

// PUT /api/oficiales/:id - Actualizar oficial (Solo Admin y Jefatura)
router.put('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[MDT Backend] PUT /api/oficiales/' + id + ' - Proxying to Bot API');
        const response = await botAPI.put(`/api/oficiales/${id}`, req.body);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al actualizar oficial:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al actualizar oficial'
        });
    }
});

// DELETE /api/oficiales/:id - Eliminar oficial (Solo Admin)
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[MDT Backend] DELETE /api/oficiales/' + id + ' - Proxying to Bot API');
        const response = await botAPI.delete(`/api/oficiales/${id}`);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al eliminar oficial:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al eliminar oficial'
        });
    }
});

// POST /api/oficiales/:id/sanciones - Agregar sanción a oficial (Solo Admin y Jefatura)
router.post('/:id/sanciones', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[MDT Backend] POST /api/oficiales/' + id + '/sanciones - Proxying to Bot API');
        const response = await botAPI.post(`/api/oficiales/${id}/sanciones`, req.body);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al agregar sanción:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al agregar sanción'
        });
    }
});

// DELETE /api/oficiales/:oficialId/sanciones/:sancionId - Eliminar sanción (Solo Admin y Jefatura)
router.delete('/:oficialId/sanciones/:sancionId', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { oficialId, sancionId } = req.params;
        console.log('[MDT Backend] DELETE /api/oficiales/' + oficialId + '/sanciones/' + sancionId + ' - Proxying to Bot API');
        const response = await botAPI.delete(`/api/oficiales/${oficialId}/sanciones/${sancionId}`);
        return res.json(response.data);
    } catch (error) {
        console.error('[MDT Backend] Error al eliminar sanción:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al eliminar sanción'
        });
    }
});

export default router;
