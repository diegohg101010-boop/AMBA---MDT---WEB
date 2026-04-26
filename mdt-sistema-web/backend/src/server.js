import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { generalLimiter, sanitizeData, ipBlocker, logSecurityEvent, blockVPN } from './middleware/security.js';
import { wafProtection, fakeRobotsTxt, fakeSitemap } from './middleware/waf.js';
import { connectDatabase, initMDTTables } from './config/database.js';
import { checkBotAPIHealth } from './config/bot-api.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import ciudadanosRoutes from './routes/ciudadanos.js';
import vehiculosRoutes from './routes/vehiculos.js';
import denunciasRoutes from './routes/denuncias.js';
import busquedaCapturaRoutes from './routes/busqueda-captura.js';
import arrestosRoutes from './routes/arrestos.js';
import multasRoutes from './routes/multas.js';
import oficialesRoutes from './routes/oficiales.js';
import reportesRoutes from './routes/reportes.js';
import adminRoutes from './routes/admin.js';
import setupRoutes from './routes/setup.js';
import codigoPenalRoutes from './routes/codigo-penal.js';
import usersRoutes from './routes/users.js';
import auditoriaRoutes from './routes/auditoria.js';
import cadRoutes from './routes/cad.js';
import jerarquiasRoutes from './routes/jerarquias.js';
import botProxyRoutes from './routes/bot-proxy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Confiar en proxies (necesario para Render y otros servicios cloud)
app.set('trust proxy', 1);

// Detectar modo de operación
const USE_BOT_API = !!process.env.BOT_API_URL;
const USE_LOCAL_DB = !!process.env.DATABASE_PATH;

// Middlewares de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Middleware para notificar accesos a la página
app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/login' || req.path.startsWith('/api')) {
        logSecurityEvent('PAGE_ACCESS', req);
    }
    next();
});

// Protección contra IPs bloqueadas
app.use(ipBlocker);

// WAF - Protección anti-escaneo
app.use(wafProtection);
app.use(fakeRobotsTxt);
app.use(fakeSitemap);

// Bloquear VPNs y Proxies
app.use(blockVPN);

// Rate limiting general
app.use('/api/', generalLimiter);

// Sanitización de datos
app.use(sanitizeData);

// Middlewares generales
app.use(express.json({ limit: '10mb' })); // Aumentar límite de payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ciudadanos', ciudadanosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/denuncias', denunciasRoutes);
app.use('/api/busqueda-captura', busquedaCapturaRoutes);
app.use('/api/arrestos', arrestosRoutes);
app.use('/api/multas', multasRoutes);
app.use('/api/oficiales', oficialesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/codigo-penal', codigoPenalRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/cad', cadRoutes);
app.use('/api/jerarquias', jerarquiasRoutes);
app.use('/api/bot', botProxyRoutes);

// Ruta de health check mejorada
app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        message: 'MDT API funcionando correctamente',
        mode: USE_BOT_API ? 'API del Bot (Hostings Separados)' : 'Base de Datos Local',
        timestamp: new Date().toISOString()
    };

    // Si usa API del bot, verificar conexión
    if (USE_BOT_API) {
        try {
            await checkBotAPIHealth();
            health.botAPI = {
                status: 'connected',
                url: process.env.BOT_API_URL
            };
        } catch (error) {
            health.status = 'degraded';
            health.botAPI = {
                status: 'disconnected',
                error: error.message
            };
            return res.status(503).json(health);
        }
    }

    res.json(health);
});

// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Manejo de rutas SPA - devolver index.html para rutas no-API
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    console.warn(`⚠ Frontend no encontrado en ${frontendPath}`);
    console.warn('  El backend estará disponible en /api/*, pero el frontend no se servirá');
    
    // Ruta por defecto para verificar que el API está vivo
    app.get('/', (req, res) => {
        res.json({ 
            success: true, 
            message: 'MDT Backend API operativo',
            docs: 'https://api.example.com/api/docs'
        });
    });
}

// Manejo de errores 404 para rutas API
app.use((req, res) => {
    logSecurityEvent('404_NOT_FOUND', req);
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    logSecurityEvent('SERVER_ERROR', req, { error: err.message });
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor'
    });
});

// Función para crear usuarios iniciales automáticamente
async function createInitialUsersIfNeeded() {
    const bcrypt = (await import('bcryptjs')).default;
    const { get, run } = await import('./config/database.js');
    
    try {
        const existingUsers = await get('SELECT COUNT(*) as count FROM usuarios_web');
        
        if (existingUsers.count > 0) {
            console.log(`✓ Usuarios existentes: ${existingUsers.count}`);
            // Activar todos los usuarios por si acaso
            await run('UPDATE usuarios_web SET activo = 1');
            return;
        }

        console.log('🔐 Inicializando usuarios del sistema...');

        const usuarios = [
            { username: 'Consejo Administrativo', password: 'n15W4pXJSUkS', rol: 'Admin' },
            { username: 'Jefatura', password: '96t23SDJ7zpC', rol: 'Jefatura' },
            { username: 'Supervisor', password: 'eoVqkW624RQn', rol: 'Supervisor' },
            { username: 'Oficial', password: 'pu~28oG5KF}`', rol: 'Oficial' },
            { username: 'Cadete', password: 'e83)\'U4Dy£7eK', rol: 'Cadete' }
        ];

        for (const usuario of usuarios) {
            const passwordHash = await bcrypt.hash(usuario.password, 10);
            await run(`
                INSERT INTO usuarios_web (username, password_hash, rol, activo, fecha_creacion, creado_por)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [usuario.username, passwordHash, usuario.rol, 1, new Date().toISOString(), 'auto-init']);
        }

        console.log(`✓ ${usuarios.length} usuarios inicializados correctamente`);
    } catch (error) {
        console.error('⚠ Error al inicializar usuarios:', error.message);
    }
}

// Iniciar servidor
async function startServer() {
    try {
        // Conectar a la base de datos local (para tablas del MDT)
        await connectDatabase();
        await initMDTTables();
        
        // Crear usuarios iniciales si no existen
        await createInitialUsersIfNeeded();
        
        console.log(`\n▸ Servidor MDT iniciado correctamente`);
        console.log(`▸ Puerto: ${PORT}`);
        console.log(`▸ URL: http://localhost:${PORT}`);
        console.log(`▸ Entorno: ${process.env.NODE_ENV || 'development'}`);
        
        // Mostrar modo de operación
        if (USE_BOT_API) {
            console.log(`\n▸ MODO: Hostings Separados (API del Bot)`);
            console.log(`▸ Bot API: ${process.env.BOT_API_URL}`);
            
            // Verificar conexión con el bot
            try {
                await checkBotAPIHealth();
                console.log(`✓ Conexión con Bot API establecida`);
            } catch (error) {
                console.log(`⚠ Advertencia: No se puede conectar con la API del bot`);
                console.log(`  Asegúrate de que el bot esté ejecutándose en: ${process.env.BOT_API_URL}`);
            }
        } else if (USE_LOCAL_DB) {
            console.log(`\n▸ MODO: Base de Datos Local (Mismo Servidor)`);
            console.log(`▸ Database: ${process.env.DATABASE_PATH}`);
        } else {
            console.log(`\n⚠ ADVERTENCIA: No se detectó configuración de BOT_API_URL ni DATABASE_PATH`);
            console.log(`  Revisa tu archivo .env`);
        }
        
        console.log(`\n✓ Sistema MDT operativo\n`);
        
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor MDT...');
    process.exit(0);
});
