import express from 'express';
import { searchVehiculos, getVehiculo, createVehiculo } from '../config/bot-api.js';
import { run } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// GET /api/vehiculos (Listar todos los vehículos)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { getAllVehiculos } = await import('../config/bot-api.js');
        const result = await getAllVehiculos();
        res.json(result);
    } catch (error) {
        console.error('Error al listar vehículos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener lista de vehículos'
        });
    }
});

// GET /api/vehiculos/search?matricula= (Todos los roles)
router.get('/search', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { matricula } = req.query;
        
        if (!matricula || matricula.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'La matrícula debe tener al menos 2 caracteres'
            });
        }

        const result = await searchVehiculos(matricula);
        res.json(result);
    } catch (error) {
        console.error('Error en búsqueda de vehículos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar vehículos'
        });
    }
});

// GET /api/vehiculos/:matricula (Todos los roles)
router.get('/:matricula', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { matricula } = req.params;
        const result = await getVehiculo(matricula);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del vehículo'
        });
    }
});

// POST /api/vehiculos (Admin, Jefatura, Supervisor, Oficial)
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL), async (req, res) => {
    try {
        const { matricula, marca, modelo, color, anio, tipo_vehiculo, dni_dueno } = req.body;

        // Validar campos requeridos
        if (!matricula || !marca || !modelo || !dni_dueno) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Crear vehículo a través de la API del bot
        const result = await createVehiculo({
            matricula,
            marca,
            modelo,
            color,
            anio,
            tipo_vehiculo,
            dni_dueno
        });

        // Registrar en auditoría local
        await run(
            'INSERT INTO auditoria (usuario, accion, modulo, detalles, fecha) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, 'CREATE', 'vehiculos', `Vehículo registrado: ${matricula}`, new Date().toISOString()]
        );

        res.json(result);
    } catch (error) {
        console.error('Error al registrar vehículo:', error);
        if (error.response?.status === 400) {
            return res.status(400).json({
                success: false,
                message: error.response.data.message || 'Error en los datos del vehículo'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al registrar vehículo'
        });
    }
});

export default router;
