import express from 'express';
import { getBusquedaCaptura, getOrdenBusqueda, createOrdenBusqueda } from '../config/bot-api.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// GET /api/busqueda-captura (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { estado = 'activa' } = req.query;
        const result = await getBusquedaCaptura({ estado });
        res.json(result);
    } catch (error) {
        console.error('Error al listar órdenes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar órdenes de búsqueda'
        });
    }
});

// GET /api/busqueda-captura/:numero (Todos los roles)
router.get('/:numero', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { numero } = req.params;
        const result = await getOrdenBusqueda(numero);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener orden:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener orden de búsqueda'
        });
    }
});

// POST /api/busqueda-captura - Crear nueva orden (Solo Jefatura)
router.post('/', authenticateToken, authorizeRoles(ROLES.JEFATURA), async (req, res) => {
    try {
        const { dni_buscado, motivo, descripcion_fisica, ultima_ubicacion, notas } = req.body;
        
        const oficial_emisor = req.user.username;
        
        const result = await createOrdenBusqueda({
            dni_buscado,
            motivo,
            oficial_emisor,
            descripcion_fisica,
            ultima_ubicacion,
            notas
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear orden de búsqueda'
        });
    }
});

export default router;
