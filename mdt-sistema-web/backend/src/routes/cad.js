// routes/cad.js - Sistema CAD/Despacho integrado con 911 del BOT
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import botAPI from '../config/bot-api.js';
import { puedeRealizarAccion, getInfoRango } from '../config/jerarquias.js';

const router = express.Router();

// Middleware de validación jerárquica
function validarAccionCAD(accion) {
    return (req, res, next) => {
        const { agencia, rango } = req.user || {};
        
        if (!agencia || !rango) {
            return res.status(401).json({
                success: false,
                message: 'Usuario sin agencia o rango asignado'
            });
        }
        
        if (!puedeRealizarAccion(agencia, rango, accion)) {
            const infoRango = getInfoRango(agencia, rango);
            return res.status(403).json({
                success: false,
                message: `Tu rango (${rango} - ${agencia}) no tiene permisos para: ${accion}`,
                tu_nivel: infoRango?.nivel || 0,
                accion_requerida: accion
            });
        }
        
        next();
    };
}

// Listar llamadas 911 activas (con deduplicación)
router.get('/llamadas', authenticateToken, async (req, res) => {
    try {
        const { estado = 'received' } = req.query;
        const response = await botAPI.get(`/api/cad/llamadas?estado=${estado}&limit=100`);
        
        // Deduplicar por call_id
        const llamadas = response.data.data || [];
        const llamadasUnicas = Array.from(new Map(llamadas.map(l => [l.call_id, l])).values());
        
        res.json({
            success: true,
            data: llamadasUnicas
        });
    } catch (error) {
        console.error('[CAD] Error al obtener llamadas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener llamadas 911'
        });
    }
});

// Obtener llamada específica
router.get('/llamadas/:callId', authenticateToken, async (req, res) => {
    try {
        const { callId } = req.params;
        const response = await botAPI.get(`/api/cad/llamadas/${callId}`);
        
        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('[CAD] Error al obtener llamada:', error.message);
        res.status(404).json({
            success: false,
            message: 'Llamada no encontrada'
        });
    }
});

// Asignar unidad a llamada (requiere permiso)
router.post('/llamadas/:callId/asignar', authenticateToken, validarAccionCAD('asignar_unidades'), async (req, res) => {
    try {
        const { callId } = req.params;
        const { unidad_id, oficial_dni } = req.body;
        
        if (!unidad_id || !oficial_dni) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }
        
        // Actualizar llamada en el BOT
        await botAPI.put(`/api/cad/llamadas/${callId}`, {
            status: 'assigned',
            handled_by: oficial_dni,
            unidades_asignadas: unidad_id
        });
        
        res.json({
            success: true,
            message: 'Unidad asignada exitosamente'
        });
    } catch (error) {
        console.error('[CAD] Error al asignar unidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar unidad'
        });
    }
});

// Actualizar estado de llamada
router.put('/llamadas/:callId/estado', authenticateToken, async (req, res) => {
    try {
        const { callId } = req.params;
        const { status, notas } = req.body;
        
        await botAPI.put(`/api/cad/llamadas/${callId}`, {
            status,
            handled_by: req.user.dni
        });
        
        res.json({
            success: true,
            message: 'Estado actualizado exitosamente'
        });
    } catch (error) {
        console.error('[CAD] Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado'
        });
    }
});

// Cerrar llamada (sin validación jerárquica para permitir a todos)
router.post('/llamadas/:callId/cerrar', authenticateToken, async (req, res) => {
    try {
        const { callId } = req.params;
        const { resolucion } = req.body;
        
        await botAPI.put(`/api/cad/llamadas/${callId}`, {
            status: 'completed',
            handled_by: req.user.dni
        });
        
        res.json({
            success: true,
            message: 'Llamada cerrada exitosamente'
        });
    } catch (error) {
        console.error('[CAD] Error al cerrar llamada:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar llamada'
        });
    }
});

export default router;
