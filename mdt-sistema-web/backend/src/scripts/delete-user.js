import { connectDatabase, get, run, closeDatabase } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function deleteUser() {
    try {
        await connectDatabase();

        console.log('\n🗑️  ELIMINAR USUARIO MDT\n');

        // Listar usuarios primero
        const usuarios = await get('SELECT COUNT(*) as count FROM usuarios_web');
        
        if (usuarios.count === 0) {
            console.log('❌ No hay usuarios registrados.\n');
            process.exit(0);
        }

        const username = await question('Username a eliminar: ');

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

        // Mostrar información del usuario
        console.log('\n📋 Información del usuario:');
        console.log(`   ID: ${usuario.id}`);
        console.log(`   Username: ${usuario.username}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   DNI Oficial: ${usuario.dni_oficial || 'N/A'}`);
        console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);
        console.log(`   Creado: ${new Date(usuario.fecha_creacion).toLocaleString('es-ES')}\n`);

        const confirm = await question('⚠️  ¿Estás seguro de eliminar este usuario? (escribe "ELIMINAR" para confirmar): ');

        if (confirm !== 'ELIMINAR') {
            console.log('\n❌ Operación cancelada.\n');
            process.exit(0);
        }

        // Eliminar sesiones del usuario
        await run('DELETE FROM sesiones WHERE usuario_id = ?', [usuario.id]);

        // Eliminar usuario
        const result = await run('DELETE FROM usuarios_web WHERE id = ?', [usuario.id]);

        if (result.changes > 0) {
            console.log(`\n✅ Usuario "${username}" eliminado exitosamente.\n`);
        } else {
            console.log(`\n❌ No se pudo eliminar el usuario.\n`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await closeDatabase();
        rl.close();
        process.exit(0);
    }
}

deleteUser();
