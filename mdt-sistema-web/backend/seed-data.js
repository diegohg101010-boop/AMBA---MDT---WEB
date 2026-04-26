import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../policedb.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err);
        process.exit(1);
    }
});

console.log('\n📊 CREANDO DATOS DE PRUEBA\n');

// Crear tablas si no existen
db.serialize(() => {
    // Tabla ciudadanos
    db.run(`
        CREATE TABLE IF NOT EXISTS ciudadanos (
            dni TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            fecha_nacimiento TEXT,
            direccion TEXT,
            telefono TEXT,
            licencia_conducir INTEGER DEFAULT 0,
            licencia_armas INTEGER DEFAULT 0,
            buscado INTEGER DEFAULT 0,
            notas TEXT,
            fecha_registro TEXT NOT NULL
        )
    `);

    // Tabla vehiculos
    db.run(`
        CREATE TABLE IF NOT EXISTS vehiculos (
            matricula TEXT PRIMARY KEY,
            modelo TEXT NOT NULL,
            color TEXT NOT NULL,
            propietario_dni TEXT,
            robado INTEGER DEFAULT 0,
            notas TEXT,
            fecha_registro TEXT NOT NULL,
            FOREIGN KEY (propietario_dni) REFERENCES ciudadanos(dni)
        )
    `);

    // Tabla denuncias
    db.run(`
        CREATE TABLE IF NOT EXISTS denuncias (
            numero TEXT PRIMARY KEY,
            tipo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            denunciante_dni TEXT,
            acusado_dni TEXT,
            estado TEXT DEFAULT 'activa',
            fecha TEXT NOT NULL,
            oficial TEXT,
            FOREIGN KEY (denunciante_dni) REFERENCES ciudadanos(dni),
            FOREIGN KEY (acusado_dni) REFERENCES ciudadanos(dni)
        )
    `);

    // Tabla arrestos
    db.run(`
        CREATE TABLE IF NOT EXISTS arrestos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ciudadano_dni TEXT NOT NULL,
            oficial TEXT NOT NULL,
            motivo TEXT NOT NULL,
            fecha TEXT NOT NULL,
            tiempo_prision INTEGER,
            multa REAL,
            FOREIGN KEY (ciudadano_dni) REFERENCES ciudadanos(dni)
        )
    `);

    // Insertar datos de prueba
    console.log('✅ Tablas creadas');
    console.log('📝 Insertando datos de prueba...\n');

    // Ciudadanos
    const ciudadanos = [
        ['12345678', 'Juan', 'Pérez', '1990-05-15', 'Calle Principal 123', '555-0001', 1, 0, 0, '', new Date().toISOString()],
        ['87654321', 'María', 'García', '1985-08-22', 'Avenida Central 456', '555-0002', 1, 1, 0, '', new Date().toISOString()],
        ['11223344', 'Carlos', 'Rodríguez', '1992-03-10', 'Boulevard Norte 789', '555-0003', 0, 0, 1, 'Buscado por robo', new Date().toISOString()],
        ['44332211', 'Ana', 'Martínez', '1988-11-30', 'Calle Sur 321', '555-0004', 1, 0, 0, '', new Date().toISOString()],
        ['55667788', 'Luis', 'López', '1995-07-18', 'Avenida Este 654', '555-0005', 1, 1, 0, '', new Date().toISOString()]
    ];

    const stmtCiudadano = db.prepare('INSERT OR IGNORE INTO ciudadanos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    ciudadanos.forEach(c => stmtCiudadano.run(c));
    stmtCiudadano.finalize();
    console.log(`✅ ${ciudadanos.length} ciudadanos insertados`);

    // Vehículos
    const vehiculos = [
        ['ABC123', 'Toyota Corolla', 'Rojo', '12345678', 0, '', new Date().toISOString()],
        ['XYZ789', 'Honda Civic', 'Azul', '87654321', 0, '', new Date().toISOString()],
        ['DEF456', 'Ford Mustang', 'Negro', '11223344', 1, 'Reportado como robado', new Date().toISOString()],
        ['GHI789', 'Chevrolet Camaro', 'Blanco', '44332211', 0, '', new Date().toISOString()],
        ['JKL012', 'Nissan Altima', 'Gris', '55667788', 0, '', new Date().toISOString()]
    ];

    const stmtVehiculo = db.prepare('INSERT OR IGNORE INTO vehiculos VALUES (?, ?, ?, ?, ?, ?, ?)');
    vehiculos.forEach(v => stmtVehiculo.run(v));
    stmtVehiculo.finalize();
    console.log(`✅ ${vehiculos.length} vehículos insertados`);

    // Denuncias
    const denuncias = [
        ['D-001', 'Robo', 'Robo de vehículo en estacionamiento', '12345678', '11223344', 'activa', new Date().toISOString(), 'Oficial Smith'],
        ['D-002', 'Agresión', 'Agresión física en bar', '87654321', null, 'activa', new Date().toISOString(), 'Oficial Johnson'],
        ['D-003', 'Vandalismo', 'Daños a propiedad privada', '44332211', null, 'cerrada', new Date().toISOString(), 'Oficial Williams']
    ];

    const stmtDenuncia = db.prepare('INSERT OR IGNORE INTO denuncias VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    denuncias.forEach(d => stmtDenuncia.run(d));
    stmtDenuncia.finalize();
    console.log(`✅ ${denuncias.length} denuncias insertadas`);

    // Arrestos
    const arrestos = [
        ['11223344', 'Oficial Smith', 'Robo de vehículo', new Date().toISOString(), 120, 5000],
        ['11223344', 'Oficial Johnson', 'Conducción temeraria', new Date().toISOString(), 60, 2000]
    ];

    const stmtArresto = db.prepare('INSERT INTO arrestos (ciudadano_dni, oficial, motivo, fecha, tiempo_prision, multa) VALUES (?, ?, ?, ?, ?, ?)');
    arrestos.forEach(a => stmtArresto.run(a));
    stmtArresto.finalize();
    console.log(`✅ ${arrestos.length} arrestos insertados`);

    console.log('\n🎉 Datos de prueba creados exitosamente!\n');
    
    db.close();
});
