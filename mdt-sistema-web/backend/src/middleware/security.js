import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { notifySecurityEvent } from '../utils/discord-notify.js';

// Rate limiter general
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Aumentado de 100 a 200
    message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter estricto para login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Demasiados intentos de inicio de sesión' },
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_LOGIN', req);
        res.status(429).json({ success: false, message: 'Demasiados intentos de inicio de sesión' });
    }
});

// Rate limiter para API
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // Aumentado de 30 a 60
    message: { success: false, message: 'Límite de solicitudes excedido' }
});

// Sanitización de datos
export const sanitizeData = [
    mongoSanitize(),
    xss(),
    hpp()
];

// Logging de eventos de seguridad
const SECURITY_LOG_PATH = path.join(process.cwd(), 'logs', 'security.log');

function ensureLogDirectory() {
    const logDir = path.dirname(SECURITY_LOG_PATH);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

export function logSecurityEvent(type, req, details = {}) {
    ensureLogDirectory();
    
    const event = {
        timestamp: new Date().toISOString(),
        type,
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent'),
        ...details
    };
    
    const logLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(SECURITY_LOG_PATH, logLine);
    
    console.log(`[SECURITY] ${type}:`, event);
    
    // Notificar a Discord
    notifySecurityEvent(type, req, details);
}

// Middleware de detección de IPs sospechosas
const suspiciousIPs = new Map();
const BLOCK_THRESHOLD = 20; // Aumentado de 10 a 20
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hora

export function ipBlocker(req, res, next) {
    // Deshabilitado temporalmente para debugging
    next();
}

export function markSuspiciousIP(ip) {
    const current = suspiciousIPs.get(ip) || { count: 0 };
    current.count++;
    
    // Solo bloquear si supera el umbral
    if (current.count >= BLOCK_THRESHOLD) {
        current.until = Date.now() + BLOCK_DURATION;
        console.log(`[SECURITY] IP bloqueada: ${ip} (${current.count} intentos) hasta ${new Date(current.until).toISOString()}`);
    }
    
    suspiciousIPs.set(ip, current);
}

// Validación de entrada
export function validateInput(schema) {
    return async (req, res, next) => {
        try {
            await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
            next();
        } catch (error) {
            logSecurityEvent('VALIDATION_FAILED', req, { errors: error.errors });
            res.status(400).json({ 
                success: false, 
                message: 'Datos inválidos'
            });
        }
    };
}

// Middleware anti-timing attack para login
export function delayResponse(ms = 1000) {
    return (req, res, next) => {
        const start = Date.now();
        const originalSend = res.send;
        
        res.send = function(data) {
            const elapsed = Date.now() - start;
            const delay = Math.max(0, ms - elapsed);
            
            setTimeout(() => {
                originalSend.call(this, data);
            }, delay);
        };
        
        next();
    };
}

// Cache de IPs verificadas
const vpnCache = new Map();
const VPN_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Detectar VPN/Proxy
export async function detectVPN(ip) {
    const cached = vpnCache.get(ip);
    if (cached && Date.now() - cached.timestamp < VPN_CACHE_DURATION) {
        return cached.isVPN;
    }

    try {
        const response = await axios.get(`https://proxycheck.io/v2/${ip}?vpn=1&asn=1`, {
            timeout: 3000
        });

        const isVPN = response.data[ip]?.proxy === 'yes' || response.data[ip]?.type === 'VPN';
        
        vpnCache.set(ip, { isVPN, timestamp: Date.now() });
        return isVPN;
    } catch (error) {
        console.error('[VPN] Error al verificar IP:', error.message);
        return false;
    }
}

// Middleware para bloquear VPNs
export async function blockVPN(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    
    if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
        return next();
    }

    try {
        const isVPN = await detectVPN(ip);
        
        if (isVPN) {
            logSecurityEvent('VPN_BLOCKED', req, { ip });
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: No se permite el uso de VPN o Proxy'
            });
        }
        
        next();
    } catch (error) {
        next();
    }
}
