import { connectDatabase, all, closeDatabase } from '../config/database.js';

async function listUsers() {
    try {
        await connectDatabase();

        console.log('\n👥 USUARIOS DEL SISTEMA MDT\n');

        const usuarios = await all(`
            SELECT 
                id,
                username,
                rol,
                dni_oficial,
                activo,
                ultimo_acceso,
                fecha_creacion,
                creado_por
            FROM usuarios_web
            ORDER BY id
        `);

        if (usuarios.length === 0) {
            console.log('❌ No hay usuarios registrados.\n');
        } else {
            console.table(usuarios.map(u => ({
                ID: u.id,
                Usuario: u.username,
                Rol: u.rol,
                DNI: u.dni_oficial || 'N/A',
                Activo: u.activo ? '✅ Sí' : '❌ No',
                'Último Acceso': u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-ES') : 'Nunca',
                'Creado': new Date(u.fecha_creacion).toLocaleString('es-ES'),
                'Creado Por': u.creado_por || 'N/A'
            })));
            
            console.log(`\n📊 Total: ${usuarios.length} usuario(s)\n`);

            // Estadísticas por rol
            const stats = {};
            usuarios.forEach(u => {
                stats[u.rol] = (stats[u.rol] || 0) + 1;
            });

            console.log('📈 Usuarios por rol:');
            Object.entries(stats).forEach(([rol, count]) => {
                console.log(`   ${rol}: ${count}`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await closeDatabase();
        process.exit(0);
    }
}

listUsers();
