import sqlite3 from 'sqlite3';

let db = null;

/**
 * Conectar a la base de datos SQLite compartida con el bot
 */
export function connectDatabase() {
    return new Promise((resolve, reject) => {
        // Leer env en tiempo de ejecución: dotenv se carga en server.js
        // En Windows, "/tmp" no existe, por eso necesitamos un fallback local.
        const DB_PATH = process.env.DATABASE_PATH || './mdt-local.db';

        // Usar OPEN_READWRITE | OPEN_CREATE para crear la DB si no existe
        db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('✗ Error al conectar con la base de datos:', err.message);
                reject(err);
            } else {
                console.log('✓ Conectado a la base de datos SQLite (MDT Web)');
                console.log(`▸ Ruta: ${DB_PATH}`);
                db.run('PRAGMA foreign_keys = ON');
                resolve();
            }
        });
    });
}

/**
 * Inicializar tablas adicionales para el MDT Web
 * NO modifica las tablas existentes del bot
 */
export async function initMDTTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de usuarios web (oficiales con acceso al MDT)
            db.run(`
                CREATE TABLE IF NOT EXISTS usuarios_web (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    rol TEXT NOT NULL,
                    dni_oficial TEXT,
                    discord_id TEXT,
                    activo INTEGER DEFAULT 1,
                    ultimo_acceso TEXT,
                    fecha_creacion TEXT NOT NULL,
                    creado_por TEXT
                );
            `);

            // NOTA: La tabla oficiales y sanciones_oficiales están en la base de datos del BOT
            // El MDT hace proxy a través de la API del bot para acceder a estos datos

            // Tabla de historial disciplinario
            db.run(`
                CREATE TABLE IF NOT EXISTS historial_disciplinario (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    oficial_id INTEGER NOT NULL,
                    tipo TEXT NOT NULL,
                    descripcion TEXT NOT NULL,
                    fecha TEXT NOT NULL,
                    autoridad TEXT NOT NULL,
                    documento_url TEXT,
                    FOREIGN KEY (oficial_id) REFERENCES oficiales(id)
                );
            `);

            // Tabla de reportes/procedimientos
            db.run(`
                CREATE TABLE IF NOT EXISTS reportes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_reporte TEXT UNIQUE NOT NULL,
                    tipo_reporte TEXT NOT NULL,
                    fecha_hora TEXT NOT NULL,
                    ubicacion TEXT NOT NULL,
                    oficiales_involucrados TEXT NOT NULL,
                    ciudadanos_involucrados TEXT,
                    vehiculos_involucrados TEXT,
                    descripcion TEXT NOT NULL,
                    resultado TEXT,
                    evidencias TEXT,
                    testigos TEXT,
                    estado TEXT DEFAULT 'borrador',
                    creado_por TEXT NOT NULL,
                    fecha_creacion TEXT NOT NULL,
                    ultima_modificacion TEXT
                );
            `);

            // Tabla de auditoría
            db.run(`
                CREATE TABLE IF NOT EXISTS auditoria (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario TEXT NOT NULL,
                    accion TEXT NOT NULL,
                    modulo TEXT NOT NULL,
                    detalles TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    fecha TEXT NOT NULL
                );
            `);

            // Tabla de sesiones (para refresh tokens)
            db.run(`
                CREATE TABLE IF NOT EXISTS sesiones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    refresh_token TEXT NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    fecha_creacion TEXT NOT NULL,
                    fecha_expiracion TEXT NOT NULL,
                    activo INTEGER DEFAULT 1,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios_web(id)
                );
            `, (err) => {
                if (err) {
                    console.error('✗ Error al crear tablas MDT:', err.message);
                    reject(err);
                } else {
                    console.log('✓ Tablas MDT inicializadas correctamente');
                    resolve();
                }
            });
        });
    });
}

/**
 * Ejecutar query con parámetros
 */
export function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error en query:', err.message);
                reject(err);
            } else {
                resolve({ changes: this.changes, lastID: this.lastID });
            }
        });
    });
}

/**
 * Obtener una fila
 */
export function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Error en query:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Obtener todas las filas
 */
export function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error en query:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Cerrar conexión
 */
export function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Conexión a la base de datos cerrada');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

export default db;
