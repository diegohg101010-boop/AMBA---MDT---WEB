import express from 'express';
import { get, all, run } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// NOTA: Reportes es una tabla LOCAL del MDT, no del bot
// Por eso mantiene la conexión directa a la base de datos local

// GET /api/reportes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const reportes = await all('SELECT * FROM reportes ORDER BY fecha_creacion DESC LIMIT ?', [parseInt(limit)]);

        res.json({
            success: true,
            data: reportes
        });
    } catch (error) {
        console.error('Error al listar reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar reportes'
        });
    }
});

// GET /api/reportes/:numero
router.get('/:numero', authenticateToken, async (req, res) => {
    try {
        const { numero } = req.params;

        const reporte = await get('SELECT * FROM reportes WHERE numero_reporte = ?', [numero]);
        
        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.json({
            success: true,
            data: reporte
        });
    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte'
        });
    }
});

// POST /api/reportes
router.post('/', authenticateToken, authorizeRoles('Admin', 'Jefatura', 'Supervisor', 'Oficial'), async (req, res) => {
    try {
        const { tipo_reporte, fecha_hora, ubicacion, oficiales_involucrados, descripcion } = req.body;

        if (!tipo_reporte || !fecha_hora || !ubicacion || !oficiales_involucrados || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Generar número de reporte
        const numero_reporte = `REP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        await run(`
            INSERT INTO reportes (numero_reporte, tipo_reporte, fecha_hora, ubicacion, oficiales_involucrados, descripcion, creado_por, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [numero_reporte, tipo_reporte, fecha_hora, ubicacion, oficiales_involucrados, descripcion, req.user.username, new Date().toISOString()]);

        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'CREATE', 'reportes', `Reporte creado: ${numero_reporte}`, new Date().toISOString()]
        );

        res.json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: { numero_reporte }
        });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear reporte'
        });
    }
});

export default router;
