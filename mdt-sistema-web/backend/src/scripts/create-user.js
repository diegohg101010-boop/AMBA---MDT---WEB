import bcrypt from 'bcryptjs';
import { connectDatabase, run, closeDatabase } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const ROLES = {
    1: 'Admin',
    2: 'Jefatura',
    3: 'Supervisor',
    4: 'Oficial',
    5: 'Cadete'
};

async function createUser() {
    try {
        await connectDatabase();

        console.log('\n🔐 CREAR NUEVO USUARIO MDT\n');

        const username = await question('Username: ');
        const password = await question('Password (min 8 caracteres): ');
        
        console.log('\nRoles disponibles:');
        console.log('1. Admin (Acceso total)');
        console.log('2. Jefatura (Gestión completa)');
        console.log('3. Supervisor (Crear y actualizar)');
        console.log('4. Oficial (Crear registros)');
        console.log('5. Cadete (Solo lectura)\n');
        
        const rolOption = await question('Selecciona rol (1-5): ');
        const rol = ROLES[rolOption];

        if (!rol) {
            console.log('❌ Rol inválido');
            process.exit(1);
        }

        if (password.length < 8) {
            console.log('❌ La contraseña debe tener al menos 8 caracteres');
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await run(`
            INSERT INTO usuarios_web (username, password_hash, rol, activo, fecha_creacion, creado_por)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [username, passwordHash, rol, 1, new Date().toISOString(), 'script']);

        console.log('\n✅ Usuario creado exitosamente');
        console.log(`   Username: ${username}`);
        console.log(`   Rol: ${rol}\n`);

    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('\n❌ El username ya existe\n');
        } else {
            console.error('\n❌ Error:', error.message, '\n');
        }
    } finally {
        await closeDatabase();
        rl.close();
        process.exit(0);
    }
}

createUser();
