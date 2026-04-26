import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const usuarios = [
    {
        username: 'Consejo Administrativo',
        password: 'n15W4pXJSUkS',
        rol: 'Admin'
    },
    {
        username: 'Jefatura',
        password: '96t23SDJ7zpC',
        rol: 'Jefatura'
    },
    {
        username: 'Supervisor',
        password: 'eoVqkW624RQn',
        rol: 'Supervisor'
    },
    {
        username: 'Oficial',
        password: 'pu~28oG5KF}`',
        rol: 'Oficial'
    },
    {
        username: 'Cadete',
        password: '83)\'U4Dy£7eK',
        rol: 'Cadete'
    }
];

async function crearUsuarios() {
    const db = new Database('/tmp/mdt-local.db');
    
    console.log('🔐 Creando usuarios iniciales...\n');

    for (const usuario of usuarios) {
        try {
            const passwordHash = await bcrypt.hash(usuario.password, 10);
            
            db.prepare(`
                INSERT INTO usuarios_web (username, password_hash, rol, activo, fecha_creacion, creado_por)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                usuario.username,
                passwordHash,
                usuario.rol,
                1,
                new Date().toISOString(),
                'script-inicial'
            );

            console.log(`✅ Usuario creado: ${usuario.username} (${usuario.rol})`);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`⚠️  Usuario ya existe: ${usuario.username}`);
            } else {
                console.error(`❌ Error creando ${usuario.username}:`, error.message);
            }
        }
    }

    db.close();
    console.log('\n✅ Proceso completado\n');
}

crearUsuarios();
