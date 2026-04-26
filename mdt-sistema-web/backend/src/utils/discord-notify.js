import axios from 'axios';

const DISCORD_USER_ID = '1065492067050070036';
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordNotification(event) {
    if (!WEBHOOK_URL) return;

    try {
        const embed = {
            title: getTitle(event.type),
            color: getColor(event.type),
            fields: [
                { name: '🌐 IP', value: event.ip || 'N/A', inline: true },
                { name: '👤 Usuario', value: event.username || 'N/A', inline: true },
                { name: '📍 Ruta', value: event.path || 'N/A', inline: true },
                { name: '📱 User-Agent', value: (event.userAgent || 'N/A').substring(0, 100), inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Sistema de Seguridad MDT HSRP' }
        };

        await axios.post(WEBHOOK_URL, {
            content: `<@${DISCORD_USER_ID}>`,
            embeds: [embed]
        });
    } catch (error) {
        console.error('[DISCORD] Error:', error.message);
    }
}

function getTitle(type) {
    const titles = {
        'PAGE_ACCESS': '🌍 Acceso a la Página',
        'LOGIN_SUCCESS': '✅ Login Exitoso',
        'LOGIN_FAILED_PASSWORD': '❌ Login Fallido',
        'LOGIN_FAILED_USER': '❌ Usuario No Encontrado',
        'WAF_BLOCKED_IP': '🛡️ Escaneo Bloqueado',
        'WAF_SUSPICIOUS_UA': '🛡️ User-Agent Sospechoso',
        'WAF_SCANNING_DETECTED': '🛡️ Escaneo Detectado',
        'VPN_BLOCKED': '🚫 VPN Bloqueado',
        'IP_BLOCKED': '🔒 IP Bloqueada'
    };
    return titles[type] || '🔔 Evento de Seguridad';
}

function getColor(type) {
    if (type === 'LOGIN_SUCCESS') return 0x00ff00;
    if (type.includes('FAILED') || type.includes('BLOCKED')) return 0xff0000;
    if (type.includes('WAF')) return 0xff6600;
    return 0x0099ff;
}

export function notifySecurityEvent(type, req, details = {}) {
    const criticalEvents = [
        'PAGE_ACCESS',
        'LOGIN_SUCCESS', 'LOGIN_FAILED_PASSWORD', 'LOGIN_FAILED_USER',
        'WAF_BLOCKED_IP', 'WAF_SUSPICIOUS_UA', 'WAF_SCANNING_DETECTED',
        'VPN_BLOCKED', 'IP_BLOCKED'
    ];

    if (criticalEvents.includes(type)) {
        sendDiscordNotification({
            type,
            ip: req.ip || req.connection?.remoteAddress,
            path: req.path,
            userAgent: req.get?.('user-agent'),
            ...details
        });
    }
}
