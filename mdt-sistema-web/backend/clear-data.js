import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../policedb.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err);
        process.exit(1);
    }
});

console.log('\n🗑️  ELIMINANDO DATOS DE PRUEBA\n');

db.serialize(() => {
    db.run('DELETE FROM arrestos', (err) => {
        if (err) console.error('Error:', err);
        else console.log('✅ Arrestos eliminados');
    });

    db.run('DELETE FROM denuncias', (err) => {
        if (err) console.error('Error:', err);
        else console.log('✅ Denuncias eliminadas');
    });

    db.run('DELETE FROM vehiculos', (err) => {
        if (err) console.error('Error:', err);
        else console.log('✅ Vehículos eliminados');
    });

    db.run('DELETE FROM ciudadanos', (err) => {
        if (err) console.error('Error:', err);
        else console.log('✅ Ciudadanos eliminados');
        
        console.log('\n🎉 Datos de prueba eliminados!\n');
        db.close();
    });
});
