import { connectDatabase, all, closeDatabase } from '../config/database.js';

async function listSessions() {
    try {
        await connectDatabase();

        console.log('\n🔐 SESIONES ACTIVAS DEL SISTEMA MDT\n');

        const sesiones = await all(`
            SELECT 
                s.id,
                s.usuario_id,
                u.username,
                u.rol,
                s.ip_address,
                s.fecha_creacion,
                s.fecha_expiracion,
                s.activo
            FROM sesiones s
            JOIN usuarios_web u ON s.usuario_id = u.id
            WHERE s.activo = 1
            ORDER BY s.fecha_creacion DESC
        `);

        if (sesiones.length === 0) {
            console.log('❌ No hay sesiones activas.\n');
        } else {
            console.table(sesiones.map(s => ({
                ID: s.id,
                Usuario: s.username,
                Rol: s.rol,
                IP: s.ip_address || 'N/A',
                'Inicio': new Date(s.fecha_creacion).toLocaleString('es-ES'),
                'Expira': new Date(s.fecha_expiracion).toLocaleString('es-ES'),
                Estado: s.activo ? '✅ Activa' : '❌ Cerrada'
            })));
            
            console.log(`\n📊 Total: ${sesiones.length} sesión(es) activa(s)\n`);
        }

        // Mostrar sesiones expiradas
        const expiradas = await all(`
            SELECT COUNT(*) as count
            FROM sesiones
            WHERE activo = 1 AND fecha_expiracion < ?
        `, [new Date().toISOString()]);

        if (expiradas[0].count > 0) {
            console.log(`⚠️  Hay ${expiradas[0].count} sesión(es) expirada(s) que deberían limpiarse.\n`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await closeDatabase();
        process.exit(0);
    }
}

listSessions();
