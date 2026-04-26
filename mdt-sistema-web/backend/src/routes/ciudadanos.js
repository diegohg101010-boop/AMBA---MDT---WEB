import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as botAPI from '../config/bot-api.js';
import { all, get, run } from '../config/database.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// GET /api/ciudadanos - Listar todos (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        // Intentar obtener de la API del bot
        if (process.env.BOT_API_URL) {
            try {
                const result = await botAPI.getCiudadanos({ limit: 100 });
                return res.json(result);
            } catch (error) {
                console.log('No se pudo conectar con la API del bot, usando base de datos local');
            }
        }

        // Consultar base de datos local
        const ciudadanos = await all('SELECT * FROM ciudadanos ORDER BY apellidos, nombres');
        res.json({
            success: true,
            data: ciudadanos
        });
    } catch (error) {
        console.error('Error al listar ciudadanos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ciudadanos'
        });
    }
});

// GET /api/ciudadanos/search?q= (Todos los roles)
router.get('/search', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El término de búsqueda debe tener al menos 2 caracteres'
            });
        }

        // Intentar obtener de la API del bot
        if (process.env.BOT_API_URL) {
            try {
                const result = await botAPI.searchCiudadanos(q);
                return res.json(result);
            } catch (error) {
                console.log('No se pudo conectar con la API del bot, usando base de datos local');
            }
        }

        // Buscar en base de datos local
        const ciudadanos = await all(
            `SELECT * FROM ciudadanos 
             WHERE nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?
             ORDER BY apellido, nombre`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );

        res.json({
            success: true,
            data: ciudadanos
        });
    } catch (error) {
        console.error('Error en búsqueda de ciudadanos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar ciudadanos'
        });
    }
});

// GET /api/ciudadanos/:dni (Todos los roles)
router.get('/:dni', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { dni } = req.params;

        // Intentar obtener de la API del bot
        if (process.env.BOT_API_URL) {
            try {
                const result = await botAPI.getCiudadano(dni);
                return res.json(result);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    return res.status(404).json({
                        success: false,
                        message: 'Ciudadano no encontrado'
                    });
                }
            }
        }

        // Buscar en base de datos local
        const ciudadano = await get('SELECT * FROM ciudadanos WHERE dni = ?', [dni]);
        
        if (!ciudadano) {
            return res.status(404).json({
                success: false,
                message: 'Ciudadano no encontrado'
            });
        }

        res.json({
            success: true,
            data: ciudadano
        });
    } catch (error) {
        console.error('Error al obtener expediente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener expediente del ciudadano'
        });
    }
});

// PUT /api/ciudadanos/:dni/estado - Actualizar estado de búsqueda y peligrosidad (Admin, Jefatura, Supervisor)
router.put('/:dni/estado', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR), async (req, res) => {
    try {
        const { dni } = req.params;
        const { en_busqueda_captura, es_peligroso, motivo_busqueda, motivo, notas } = req.body;
        const motivoFinal = motivo_busqueda ?? motivo;
        const notasFinal = notas ?? motivoFinal;

        // Intentar actualizar en la API del bot
        if (process.env.BOT_API_URL) {
            try {
                const result = await botAPI.updateCiudadanoEstado(dni, {
                    en_busqueda_captura,
                    es_peligroso,
                    motivo_busqueda: motivoFinal,
                    notas: notasFinal
                });
                return res.json(result);
            } catch (error) {
                console.log('No se pudo conectar con la API del bot, usando base de datos local');
            }
        }

        // Actualizar en base de datos local (si existen las columnas)
        const columns = await all('PRAGMA table_info(ciudadanos)');
        const hasColumn = (name) => columns.some((col) => col.name === name);

        const updates = [];
        const params = [];

        if (hasColumn('en_busqueda_captura')) {
            updates.push('en_busqueda_captura = ?');
            params.push(en_busqueda_captura);
        } else if (hasColumn('buscado')) {
            updates.push('buscado = ?');
            params.push(en_busqueda_captura);
        }

        if (hasColumn('es_peligroso')) {
            updates.push('es_peligroso = ?');
            params.push(es_peligroso);
        }

        if (hasColumn('motivo_busqueda')) {
            updates.push('motivo_busqueda = ?');
            params.push(en_busqueda_captura ? (motivoFinal || null) : null);
        }

        if (hasColumn('notas')) {
            updates.push('notas = ?');
            params.push(en_busqueda_captura ? (notasFinal || null) : null);
        }

        if (updates.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'La base de datos local no tiene columnas compatibles para actualizar el estado'
            });
        }

        const result = await run(
            `UPDATE ciudadanos SET ${updates.join(', ')} WHERE dni = ?`,
            [...params, dni]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ciudadano no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del ciudadano'
        });
    }
});

export default router;
