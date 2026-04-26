import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../policedb.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err);
        process.exit(1);
    }
});

console.log('\n📊 VERIFICANDO BASE DE DATOS\n');

// Ver todas las tablas
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('📋 Tablas encontradas:');
    tables.forEach(table => console.log(`  - ${table.name}`));
    console.log('');
    
    // Contar ciudadanos
    db.get("SELECT COUNT(*) as count FROM ciudadanos", [], (err, row) => {
        if (err) {
            console.error('Error al contar ciudadanos:', err);
        } else {
            console.log(`👤 Ciudadanos: ${row.count}`);
        }
        
        // Contar vehículos
        db.get("SELECT COUNT(*) as count FROM vehiculos", [], (err, row) => {
            if (err) {
                console.error('Error al contar vehículos:', err);
            } else {
                console.log(`🚗 Vehículos: ${row.count}`);
            }
            
            // Contar denuncias
            db.get("SELECT COUNT(*) as count FROM denuncias", [], (err, row) => {
                if (err) {
                    console.error('Error al contar denuncias:', err);
                } else {
                    console.log(`📋 Denuncias: ${row.count}`);
                }
                
                // Contar arrestos
                db.get("SELECT COUNT(*) as count FROM arrestos", [], (err, row) => {
                    if (err) {
                        console.error('Error al contar arrestos:', err);
                    } else {
                        console.log(`⛓️ Arrestos: ${row.count}`);
                    }
                    
                    console.log('');
                    db.close();
                });
            });
        });
    });
});
