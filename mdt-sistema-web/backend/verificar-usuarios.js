import Database from 'better-sqlite3';

const db = new Database('/tmp/mdt-local.db');

console.log('🔍 Verificando usuarios...\n');

const usuarios = db.prepare('SELECT id, username, rol, activo FROM usuarios_web').all();

console.log(`Total de usuarios: ${usuarios.length}\n`);

usuarios.forEach(usuario => {
    console.log(`ID: ${usuario.id}`);
    console.log(`Username: ${usuario.username}`);
    console.log(`Rol: ${usuario.rol}`);
    console.log(`Activo: ${usuario.activo ? '✅ Sí' : '❌ No'}`);
    console.log('---');
});

// Activar todos los usuarios
console.log('\n🔄 Activando todos los usuarios...\n');

const result = db.prepare('UPDATE usuarios_web SET activo = 1').run();

console.log(`✅ ${result.changes} usuarios activados\n`);

db.close();
