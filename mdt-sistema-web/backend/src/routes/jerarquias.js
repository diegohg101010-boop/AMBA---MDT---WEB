// routes/jerarquias.js - Endpoint para sistema de jerarquías
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
    JERARQUIAS, 
    getAgencias, 
    getRangos, 
    getInfoRango,
    puedeRealizarAccion,
    puedeOverride
} from '../config/jerarquias.js';

const router = express.Router();

// GET /api/jerarquias - Obtener todas las jerarquías
router.get('/', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: JERARQUIAS
    });
});

// GET /api/jerarquias/agencias - Listar agencias
router.get('/agencias', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: getAgencias()
    });
});

// GET /api/jerarquias/:agencia/rangos - Listar rangos de una agencia
router.get('/:agencia/rangos', authenticateToken, (req, res) => {
    const { agencia } = req.params;
    const rangos = getRangos(agencia);
    
    if (rangos.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Agencia no encontrada'
        });
    }
    
    res.json({
        success: true,
        data: rangos
    });
});

// GET /api/jerarquias/:agencia/:rango - Obtener info de un rango
router.get('/:agencia/:rango', authenticateToken, (req, res) => {
    const { agencia, rango } = req.params;
    const info = getInfoRango(agencia, rango);
    
    if (!info) {
        return res.status(404).json({
            success: false,
            message: 'Rango no encontrado'
        });
    }
    
    res.json({
        success: true,
        data: info
    });
});

// POST /api/jerarquias/validar - Validar permisos
router.post('/validar', authenticateToken, (req, res) => {
    const { agencia, rango, accion } = req.body;
    
    if (!agencia || !rango || !accion) {
        return res.status(400).json({
            success: false,
            message: 'Faltan parámetros: agencia, rango, accion'
        });
    }
    
    const puede = puedeRealizarAccion(agencia, rango, accion);
    
    res.json({
        success: true,
        puede,
        agencia,
        rango,
        accion
    });
});

// POST /api/jerarquias/override - Validar override
router.post('/override', authenticateToken, (req, res) => {
    const { agenciaA, rangoA, agenciaB, rangoB } = req.body;
    
    if (!agenciaA || !rangoA || !agenciaB || !rangoB) {
        return res.status(400).json({
            success: false,
            message: 'Faltan parámetros'
        });
    }
    
    const puede = puedeOverride(agenciaA, rangoA, agenciaB, rangoB);
    
    res.json({
        success: true,
        puede_override: puede
    });
});

export default router;
