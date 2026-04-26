import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as botAPI from '../config/bot-api.js';
import { all } from '../config/database.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Obtener estadísticas generales del dashboard (Todos los roles)
 */
router.get('/stats', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        // Intentar obtener stats de la API del bot
        if (process.env.BOT_API_URL) {
            try {
                const stats = await botAPI.getDashboardStats();
                return res.json(stats);
            } catch (error) {
                console.log('No se pudo conectar con la API del bot, usando base de datos local');
            }
        }

        // Si no hay API del bot, consultar base de datos local
        const ciudadanos = await all('SELECT COUNT(*) as count FROM ciudadanos');
        const vehiculos = await all('SELECT COUNT(*) as count FROM vehiculos');
        const denuncias = await all('SELECT COUNT(*) as count FROM denuncias WHERE estado = ?', ['activa']);
        const arrestos = await all('SELECT COUNT(*) as count FROM arrestos');

        res.json({
            success: true,
            data: {
                totalCiudadanos: ciudadanos[0]?.count || 0,
                totalVehiculos: vehiculos[0]?.count || 0,
                totalDenuncias: denuncias[0]?.count || 0,
                totalArrestos: arrestos[0]?.count || 0
            }
        });
    } catch (error) {
        console.error('Error en dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

export default router;
