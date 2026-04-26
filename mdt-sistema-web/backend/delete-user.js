#!/usr/bin/env node

/**
 * Script para desactivar usuarios
 * Uso: node delete-user.js
 */

import { run, get, all, connectDatabase, initMDTTables } from './src/config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function deleteUser() {
    try {
        // Conectar a la base de datos
        await connectDatabase();
        await initMDTTables();

        console.log('\n=== DESACTIVAR USUARIO ===\n');

        // Listar usuarios activos
        const usuarios = await all('SELECT id, username, rol, activo FROM usuarios_web ORDER BY username');
        
        console.log('Usuarios disponibles:\n');
        usuarios.forEach(u => {
            const estado = u.activo ? '✅ Activo' : '❌ Inactivo';
            console.log(`${u.id}. ${u.username} (${u.rol}) - ${estado}`);
        });

        const userId = await question('\nID del usuario a desactivar: ');
        
        const usuario = await get('SELECT * FROM usuarios_web WHERE id = ?', [userId]);
        
        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            rl.close();
            return;
        }

        if (usuario.activo === 0) {
            console.log('⚠️  El usuario ya está desactivado');
            rl.close();
            return;
        }

        const confirmar = await question(`\n¿Desactivar usuario "${usuario.username}"? (s/N): `);
        
        if (confirmar.toLowerCase() !== 's') {
            console.log('❌ Operación cancelada');
            rl.close();
            return;
        }

        // Desactivar usuario
        await run('UPDATE usuarios_web SET activo = 0 WHERE id = ?', [userId]);

        // Invalidar sesiones
        await run('UPDATE sesiones SET activo = 0 WHERE usuario_id = ?', [userId]);

        console.log(`\n✅ Usuario "${usuario.username}" desactivado exitosamente\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

deleteUser();
