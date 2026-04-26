#!/usr/bin/env node

/**
 * Script para crear usuarios en la base de datos REMOTA del bot
 * Uso: node create-user-remote.js
 */

import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateSecurePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function createUser() {
    try {
        console.log('\n=== CREAR USUARIO EN DB REMOTA ===\n');
        console.log('⚠️  Este script se conectará a la base de datos del bot en VexyHost\n');

        const dbPath = await question('Ruta a la DB del bot (ej: \\\\179.41.11.247\\policedb.db o ruta local): ');
        
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('❌ Error al conectar:', err.message);
                process.exit(1);
            }
            console.log('✅ Conectado a la base de datos\n');
        });

        const username = await question('Username: ');
        if (!username) {
            console.log('❌ Username requerido');
            rl.close();
            db.close();
            return;
        }

        // Verificar si existe
        db.get('SELECT id FROM usuarios_web WHERE username = ?', [username], async (err, row) => {
            if (row) {
                console.log('❌ El username ya existe');
                rl.close();
                db.close();
                return;
            }

            console.log('\nRoles disponibles:');
            console.log('1. Admin');
            console.log('2. Jefatura');
            console.log('3. Supervisor');
            console.log('4. Oficial');
            console.log('5. Cadete');
            
            const rolNum = await question('\nSelecciona rol (1-5): ');
            const roles = ['Admin', 'Jefatura', 'Supervisor', 'Oficial', 'Cadete'];
            const rol = roles[parseInt(rolNum) - 1];
            
            if (!rol) {
                console.log('❌ Rol inválido');
                rl.close();
                db.close();
                return;
            }

            const dniOficial = await question('DNI del oficial (opcional, Enter para omitir): ');

            const useCustomPassword = await question('\n¿Usar contraseña personalizada? (s/N): ');
            let password;

            if (useCustomPassword.toLowerCase() === 's') {
                password = await question('Contraseña (mínimo 8 caracteres): ');
                if (password.length < 8) {
                    console.log('❌ La contraseña debe tener al menos 8 caracteres');
                    rl.close();
                    db.close();
                    return;
                }
            } else {
                password = generateSecurePassword(16);
                console.log('\n✅ Contraseña generada automáticamente (segura)');
            }

            // Hash de contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Crear usuario
            db.run(`
                INSERT INTO usuarios_web (username, password_hash, rol, dni_oficial, activo, fecha_creacion, creado_por)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [username, passwordHash, rol, dniOficial || null, 1, new Date().toISOString(), 'script-remote'], (err) => {
                if (err) {
                    console.error('❌ Error al crear usuario:', err.message);
                } else {
                    console.log('\n✅ Usuario creado exitosamente\n');
                    console.log('═══════════════════════════════════════');
                    console.log('CREDENCIALES (GUARDAR EN LUGAR SEGURO)');
                    console.log('═══════════════════════════════════════');
                    console.log(`Username: ${username}`);
                    console.log(`Password: ${password}`);
                    console.log(`Rol: ${rol}`);
                    if (dniOficial) console.log(`DNI: ${dniOficial}`);
                    console.log('═══════════════════════════════════════\n');
                    console.log('⚠️  IMPORTANTE: Esta contraseña no se mostrará de nuevo.');
                    console.log('    Guárdala en un gestor de contraseñas seguro.\n');
                }
                
                rl.close();
                db.close();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

createUser();
