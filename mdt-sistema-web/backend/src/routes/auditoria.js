import express from 'express';
import { all } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { limite = 100 } = req.query;
    const registros = await all(`SELECT * FROM auditoria ORDER BY fecha DESC LIMIT ?`, [parseInt(limite)]);
    res.json({ success: true, data: registros });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/estadisticas', async (req, res) => {
  try {
    const stats = {
      total_acciones: 0,
      acciones_por_usuario: [],
      acciones_por_tipo: [],
      acciones_por_severidad: [],
      ips_activas: []
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
