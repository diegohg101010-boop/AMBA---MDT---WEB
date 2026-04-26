import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const BOT_API_URL = process.env.BOT_API_URL || 'http://179.41.11.247:7043';
const BOT_API_KEY = process.env.BOT_API_KEY;

// Proxy para todas las rutas del bot
router.all('/*', authenticateToken, async (req, res) => {
    try {
        const path = req.params[0];
        const url = `${BOT_API_URL}/${path}`;
        
        console.log(`[BOT PROXY] ${req.method} ${url}`);
        
        const config = {
            method: req.method,
            url: url,
            headers: {
                'X-API-Key': BOT_API_KEY,
                'Content-Type': 'application/json'
            },
            params: req.query,
            timeout: 30000
        };
        
        if (req.body && Object.keys(req.body).length > 0) {
            config.data = req.body;
        }
        
        const response = await axios(config);
        res.json(response.data);
        
    } catch (error) {
        console.error('[BOT PROXY] Error:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'El servidor del Bot no está disponible'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al conectar con el Bot',
                error: error.message
            });
        }
    }
});

export default router;
