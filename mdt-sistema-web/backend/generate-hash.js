import bcrypt from 'bcryptjs';

const password = 'queseyonose987654321';
const hash = await bcrypt.hash(password, 10);

console.log('\n=== HASH GENERADO ===\n');
console.log('Username: crx_5');
console.log('Rol: Jefatura');
console.log('DNI: 97050461');
console.log('\nHash de contraseña:');
console.log(hash);
console.log('\n=== SQL PARA EJECUTAR EN LA DB DEL BOT ===\n');
console.log(`INSERT INTO usuarios_web (username, password_hash, rol, dni_oficial, activo, fecha_creacion, creado_por)
VALUES ('crx_5', '${hash}', 'Jefatura', '97050461', 1, '${new Date().toISOString()}', 'manual');`);
console.log('\n');
