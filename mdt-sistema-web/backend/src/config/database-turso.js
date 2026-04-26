import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function connectDatabase() {
  console.log('✓ Conectado a Turso (SQLite persistente)');
  return client;
}

export async function initMDTTables() {
  await client.execute(`
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
    )
  `);

  await client.execute(`
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
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      accion TEXT NOT NULL,
      modulo TEXT NOT NULL,
      detalles TEXT,
      ip_address TEXT,
      user_agent TEXT,
      fecha TEXT NOT NULL
    )
  `);

  console.log('✓ Tablas MDT inicializadas en Turso');
}

export async function run(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return { changes: result.rowsAffected, lastID: result.lastInsertRowid };
}

export async function get(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows[0];
}

export async function all(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows;
}

export function closeDatabase() {
  return Promise.resolve();
}
