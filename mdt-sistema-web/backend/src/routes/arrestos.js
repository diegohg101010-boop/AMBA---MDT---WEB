import express from 'express';
import { getArrestos, getArresto, createArresto, deleteArresto } from '../config/bot-api.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';
import { puedeRealizarAccion } from '../config/jerarquias.js';

const router = express.Router();

// Middleware de validación jerárquica
function validarAccionArresto(accion) {
    return (req, res, next) => {
        const { agencia, rango } = req.user || {};
        
        if (!agencia || !rango) {
            return res.status(401).json({
                success: false,
                message: 'Usuario sin agencia o rango asignado'
            });
        }
        
        if (!puedeRealizarAccion(agencia, rango, accion)) {
            return res.status(403).json({
                success: false,
                message: `Tu rango (${rango}) no tiene permisos para: ${accion}`
            });
        }
        
        next();
    };
}

// GET /api/arrestos (Todos los roles)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { limit = 50, activo } = req.query;
        const result = await getArrestos({ limit, activo });
        res.json(result);
    } catch (error) {
        console.error('Error al listar arrestos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar arrestos'
        });
    }
});

// GET /api/arrestos/:id (Todos los roles)
router.get('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA, ROLES.SUPERVISOR, ROLES.OFICIAL, ROLES.CADETE), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getArresto(id);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener arresto:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Arresto no encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener arresto'
        });
    }
});

// POST /api/arrestos - Crear nuevo arresto (Admin y Jefatura)
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { 
            dni_detenido, 
            articulos, 
            oficial_1_dni,
            oficial_2_dni,
            oficial_3_dni,
            oficial_4_dni,
            oficial_5_dni,
            oficial_6_dni,
            evidencias 
        } = req.body;
        
        // Validar campos obligatorios
        if (!dni_detenido || !articulos || !oficial_1_dni || !evidencias) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: dni_detenido, articulos, oficial_1_dni, evidencias'
            });
        }
        
        // El oficial principal es el primer oficial del formulario
        const oficial_arresto = oficial_1_dni;
        
        // Construir array de oficiales
        const oficialesDnis = [oficial_1_dni, oficial_2_dni, oficial_3_dni, oficial_4_dni, oficial_5_dni, oficial_6_dni]
            .filter(dni => dni && dni.trim() !== '');
        
        console.log('[MDT BACKEND] Creando arresto con oficial_arresto:', oficial_arresto);
        console.log('[MDT BACKEND] Oficiales DNIs:', oficialesDnis);
        
        const result = await createArresto({
            dni_detenido,
            oficial_arresto,
            articulos,
            oficiales_dnis: oficialesDnis,
            evidencias
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error al crear arresto:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear arresto'
        });
    }
});

// DELETE /api/arrestos/:id - Eliminar arresto (Solo Admin y Jefatura)
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.JEFATURA), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteArresto(id);
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar arresto:', error);
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Arresto no encontrado'
            });
        }
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al eliminar arresto'
        });
    }
});

export default router;
