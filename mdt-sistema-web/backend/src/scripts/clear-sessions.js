import { connectDatabase, run, get, closeDatabase } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function clearSessions() {
    try {
        await connectDatabase();

        console.log('\n🧹 LIMPIAR SESIONES MDT\n');
        console.log('Opciones:');
        console.log('1. Cerrar todas las sesiones');
        console.log('2. Cerrar sesiones de un usuario específico');
        console.log('3. Limpiar sesiones expiradas');
        console.log('4. Cancelar\n');

        const opcion = await question('Selecciona una opción (1-4): ');

        switch (opcion) {
            case '1':
                const confirmAll = await question('⚠️  ¿Cerrar TODAS las sesiones? (escribe "SI" para confirmar): ');
                if (confirmAll === 'SI') {
                    const result = await run('UPDATE sesiones SET activo = 0');
                    console.log(`\n✅ ${result.changes} sesión(es) cerrada(s).\n`);
                } else {
                    console.log('\n❌ Operación cancelada.\n');
                }
                break;

            case '2':
                const username = await question('Username: ');
                const usuario = await get('SELECT id, username FROM usuarios_web WHERE username = ?', [username]);
                
                if (!usuario) {
                    console.log(`\n❌ Usuario "${username}" no encontrado.\n`);
                    break;
                }

                const confirmUser = await question(`¿Cerrar todas las sesiones de "${username}"? (si/no): `);
                if (confirmUser.toLowerCase() === 'si') {
                    const result = await run('UPDATE sesiones SET activo = 0 WHERE usuario_id = ?', [usuario.id]);
                    console.log(`\n✅ ${result.changes} sesión(es) cerrada(s) para "${username}".\n`);
                } else {
                    console.log('\n❌ Operación cancelada.\n');
                }
                break;

            case '3':
                const result = await run(
                    'UPDATE sesiones SET activo = 0 WHERE activo = 1 AND fecha_expiracion < ?',
                    [new Date().toISOString()]
                );
                console.log(`\n✅ ${result.changes} sesión(es) expirada(s) limpiada(s).\n`);
                break;

            case '4':
                console.log('\n❌ Operación cancelada.\n');
                break;

            default:
                console.log('\n❌ Opción inválida.\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await closeDatabase();
        rl.close();
        process.exit(0);
    }
}

clearSessions();
