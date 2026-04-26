import { connectDatabase, get, run, closeDatabase } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function disableUser() {
    try {
        await connectDatabase();

        console.log('\n🔒 DESACTIVAR/ACTIVAR USUARIO MDT\n');

        const username = await question('Username: ');

        if (!username || username.trim() === '') {
            console.log('❌ Username no puede estar vacío.\n');
            process.exit(1);
        }

        // Verificar que el usuario existe
        const usuario = await get('SELECT * FROM usuarios_web WHERE username = ?', [username]);

        if (!usuario) {
            console.log(`\n❌ Usuario "${username}" no encontrado.\n`);
            process.exit(1);
        }

        // Mostrar estado actual
        console.log(`\n📋 Estado actual: ${usuario.activo ? '✅ ACTIVO' : '❌ INACTIVO'}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   DNI Oficial: ${usuario.dni_oficial || 'N/A'}\n`);

        const nuevoEstado = usuario.activo ? 0 : 1;
        const accion = nuevoEstado ? 'ACTIVAR' : 'DESACTIVAR';

        const confirm = await question(`¿Deseas ${accion} este usuario? (si/no): `);

        if (confirm.toLowerCase() !== 'si') {
            console.log('\n❌ Operación cancelada.\n');
            process.exit(0);
        }

        // Actualizar estado
        await run('UPDATE usuarios_web SET activo = ? WHERE id = ?', [nuevoEstado, usuario.id]);

        // Si se desactiva, cerrar todas sus sesiones
        if (nuevoEstado === 0) {
            await run('UPDATE sesiones SET activo = 0 WHERE usuario_id = ?', [usuario.id]);
        }

        console.log(`\n✅ Usuario "${username}" ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.\n`);

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await closeDatabase();
        rl.close();
        process.exit(0);
    }
}

disableUser();
