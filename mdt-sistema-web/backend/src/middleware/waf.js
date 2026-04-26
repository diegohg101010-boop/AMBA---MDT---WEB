import { logSecurityEvent, markSuspiciousIP } from './security.js';

// User-Agents sospechosos (herramientas de pentesting)
const SUSPICIOUS_USER_AGENTS = [
    'nikto', 'sqlmap', 'nmap', 'masscan', 'nessus', 'openvas', 'metasploit',
    'burp', 'zap', 'owasp', 'acunetix', 'netsparker', 'w3af', 'skipfish',
    'wpscan', 'dirbuster', 'gobuster', 'ffuf', 'wfuzz', 'hydra', 'medusa',
    'havij', 'pangolin', 'jsql', 'commix', 'xsser', 'beef', 'arachni',
    'vega', 'webscarab', 'paros', 'httprint', 'whatweb', 'curl', 'wget',
    'python-requests', 'go-http-client', 'scrapy', 'mechanize', 'selenium'
];

// Rutas sensibles que no deben ser accedidas
const SENSITIVE_PATHS = [
    '/robots.txt', '/sitemap.xml', '/.env', '/.git', '/config', '/admin',
    '/phpmyadmin', '/wp-admin', '/wp-login', '/backup', '/.htaccess',
    '/server-status', '/server-info', '/.well-known', '/api/docs',
    '/swagger', '/graphql', '/.DS_Store', '/web.config', '/composer.json'
];

// Patrones de ataque comunes
const ATTACK_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
    /(\<script\>)|(\<\/script\>)|(\<iframe\>)/i, // XSS
    /(\.\.\/)|(\.\.\%2F)/i, // Path Traversal
    /(\bor\b|\band\b).*(\=)/i, // SQL Boolean
    /(union.*select|select.*from|insert.*into|delete.*from|drop.*table)/i, // SQL
    /(\$\{.*\})|(\%\{.*\})/i, // Template Injection
    /(eval\(|base64_decode|exec\(|system\()/i, // Code Injection
];

// Tracking de requests por IP
const requestTracking = new Map();
const TRACKING_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_MINUTE = 300; // Límite alto para uso normal
const MAX_REQUESTS_PER_SECOND = 50; // Permitir ráfagas normales
const ATTACK_THRESHOLD_PER_SECOND = 100; // Bloquear solo si supera 100 req/seg
const ATTACK_THRESHOLD_PER_MINUTE = 500; // Bloquear solo si supera 500 req/min

// IPs bloqueadas por escaneo
const scannedIPs = new Map();
const SCAN_BLOCK_DURATION = 60 * 60 * 1000; // 1 hora

// Detectar User-Agent sospechoso
function isSuspiciousUserAgent(userAgent) {
    if (!userAgent) return true;
    const ua = userAgent.toLowerCase();
    return SUSPICIOUS_USER_AGENTS.some(pattern => ua.includes(pattern));
}

// Detectar ruta sensible
function isSensitivePath(path) {
    return SENSITIVE_PATHS.some(sensitive => path.toLowerCase().includes(sensitive));
}

// Detectar patrón de ataque
function hasAttackPattern(str) {
    if (!str) return false;
    return ATTACK_PATTERNS.some(pattern => pattern.test(str));
}

// Detectar comportamiento de escaneo
function detectScanningBehavior(ip) {
    const now = Date.now();
    const tracking = requestTracking.get(ip) || { requests: [], paths: new Set() };
    
    // Limpiar requests antiguos
    tracking.requests = tracking.requests.filter(time => now - time < TRACKING_WINDOW);
    
    // Agregar request actual
    tracking.requests.push(now);
    
    // Detectar MUCHAS requests en poco tiempo (ataque real)
    const recentRequests = tracking.requests.filter(time => now - time < 1000);
    if (recentRequests.length > ATTACK_THRESHOLD_PER_SECOND) {
        return { isScanning: true, reason: `ATTACK: ${recentRequests.length} req/seg` };
    }
    
    // Detectar demasiados requests por minuto (ataque sostenido)
    if (tracking.requests.length > ATTACK_THRESHOLD_PER_MINUTE) {
        return { isScanning: true, reason: `ATTACK: ${tracking.requests.length} req/min` };
    }
    
    // Detectar acceso a muchas rutas diferentes (spider agresivo)
    if (tracking.paths.size > 200) {
        return { isScanning: true, reason: `SPIDER: ${tracking.paths.size} rutas` };
    }
    
    requestTracking.set(ip, tracking);
    return { isScanning: false };
}

// Agregar ruta visitada
function trackPath(ip, path) {
    const tracking = requestTracking.get(ip) || { requests: [], paths: new Set() };
    tracking.paths.add(path);
    requestTracking.set(ip, tracking);
}

// Verificar si IP está bloqueada por escaneo
function isScannedIP(ip) {
    const blocked = scannedIPs.get(ip);
    if (blocked && blocked.until > Date.now()) {
        return true;
    }
    if (blocked && blocked.until <= Date.now()) {
        scannedIPs.delete(ip);
    }
    return false;
}

// Bloquear IP por escaneo
function blockScanningIP(ip, reason) {
    scannedIPs.set(ip, {
        until: Date.now() + SCAN_BLOCK_DURATION,
        reason,
        timestamp: new Date().toISOString()
    });
    console.log(`[WAF] IP bloqueada por escaneo: ${ip} - Razón: ${reason}`);
}

// Middleware principal WAF
export function wafProtection(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    const path = req.path;
    const method = req.method;
    
    // Ignorar health checks y assets
    if (path === '/health' || path.startsWith('/assets') || path.startsWith('/static')) {
        return next();
    }
    
    // Ignorar IPs privadas (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
    if (ip?.startsWith('10.') || ip?.startsWith('192.168.') || ip?.startsWith('172.')) {
        return next();
    }
    
    // Verificar si IP ya está bloqueada
    if (isScannedIP(ip)) {
        logSecurityEvent('WAF_BLOCKED_IP', req, { reason: 'Previously detected scanning' });
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    
    // Detectar User-Agent sospechoso
    if (isSuspiciousUserAgent(userAgent)) {
        logSecurityEvent('WAF_SUSPICIOUS_UA', req, { userAgent });
        blockScanningIP(ip, 'SUSPICIOUS_USER_AGENT');
        markSuspiciousIP(ip);
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    
    // Detectar acceso a rutas sensibles
    if (isSensitivePath(path)) {
        logSecurityEvent('WAF_SENSITIVE_PATH', req, { path });
        blockScanningIP(ip, 'SENSITIVE_PATH_ACCESS');
        markSuspiciousIP(ip);
        return res.status(404).json({ success: false, message: 'No encontrado' });
    }
    
    // Detectar patrones de ataque en URL
    if (hasAttackPattern(path) || hasAttackPattern(req.originalUrl)) {
        logSecurityEvent('WAF_ATTACK_PATTERN_URL', req, { path });
        blockScanningIP(ip, 'ATTACK_PATTERN_IN_URL');
        markSuspiciousIP(ip);
        return res.status(400).json({ success: false, message: 'Solicitud inválida' });
    }
    
    // Detectar patrones de ataque en query params
    const queryString = JSON.stringify(req.query);
    if (hasAttackPattern(queryString)) {
        logSecurityEvent('WAF_ATTACK_PATTERN_QUERY', req, { query: req.query });
        blockScanningIP(ip, 'ATTACK_PATTERN_IN_QUERY');
        markSuspiciousIP(ip);
        return res.status(400).json({ success: false, message: 'Solicitud inválida' });
    }
    
    // Detectar patrones de ataque en body (solo para POST/PUT)
    if ((method === 'POST' || method === 'PUT') && req.body) {
        const bodyString = JSON.stringify(req.body);
        if (hasAttackPattern(bodyString)) {
            logSecurityEvent('WAF_ATTACK_PATTERN_BODY', req, { body: req.body });
            blockScanningIP(ip, 'ATTACK_PATTERN_IN_BODY');
            markSuspiciousIP(ip);
            return res.status(400).json({ success: false, message: 'Solicitud inválida' });
        }
    }
    
    // Detectar comportamiento de escaneo
    const scanDetection = detectScanningBehavior(ip);
    if (scanDetection.isScanning) {
        logSecurityEvent('WAF_SCANNING_DETECTED', req, { reason: scanDetection.reason });
        blockScanningIP(ip, scanDetection.reason);
        markSuspiciousIP(ip);
        return res.status(429).json({ success: false, message: 'Demasiadas solicitudes' });
    }
    
    // Trackear ruta visitada
    trackPath(ip, path);
    
    // Agregar headers de seguridad adicionales
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
}

// Middleware para falsear robots.txt
export function fakeRobotsTxt(req, res, next) {
    if (req.path === '/robots.txt') {
        logSecurityEvent('WAF_ROBOTS_ACCESS', req);
        return res.status(200).type('text/plain').send('User-agent: *\nDisallow: /');
    }
    next();
}

// Middleware para falsear sitemap.xml
export function fakeSitemap(req, res, next) {
    if (req.path === '/sitemap.xml') {
        logSecurityEvent('WAF_SITEMAP_ACCESS', req);
        return res.status(404).json({ success: false, message: 'No encontrado' });
    }
    next();
}

// Limpiar tracking periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [ip, tracking] of requestTracking.entries()) {
        tracking.requests = tracking.requests.filter(time => now - time < TRACKING_WINDOW);
        if (tracking.requests.length === 0) {
            requestTracking.delete(ip);
        }
    }
}, 60000); // Cada minuto
