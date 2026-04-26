import express from 'express';
import { getCodigoPenal, getArticulo, procesarArticulos } from '../config/bot-api.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/codigo-penal - Obtener código penal completo
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await getCodigoPenal();
        res.json(result);
    } catch (error) {
        console.error('Error al obtener código penal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener código penal'
        });
    }
});

// GET /api/codigo-penal/:codigo - Obtener artículo específico
router.get('/:codigo', authenticateToken, async (req, res) => {
    try {
        const { codigo } = req.params;
        const result = await getArticulo(codigo);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener artículo:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Artículo no encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener artículo'
        });
    }
});

// POST /api/codigo-penal/procesar - Procesar artículos
router.post('/procesar', authenticateToken, async (req, res) => {
    try {
        const { articulos } = req.body;
        const result = await procesarArticulos(articulos);
        res.json(result);
    } catch (error) {
        console.error('Error al procesar artículos:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al procesar artículos'
        });
    }
});

export default router;
