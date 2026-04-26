// Script para eliminar la tabla oficiales local del MDT
// Los oficiales ahora se gestionan desde el Bot API

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../policedb.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar:', err);
        process.exit(1);
    }
    
    console.log('Conectado a la base de datos');
    
    // Eliminar tabla oficiales local
    db.run('DROP TABLE IF EXISTS oficiales', (err) => {
        if (err) {
            console.error('Error al eliminar tabla oficiales:', err);
        } else {
            console.log('✅ Tabla oficiales eliminada (ahora se usa la del Bot API)');
        }
        
        // Eliminar tabla historial_disciplinario que depende de oficiales
        db.run('DROP TABLE IF EXISTS historial_disciplinario', (err) => {
            if (err) {
                console.error('Error al eliminar tabla historial_disciplinario:', err);
            } else {
                console.log('✅ Tabla historial_disciplinario eliminada');
            }
            
            db.close();
            console.log('\n✅ Migración completada. Reinicia el backend MDT.');
        });
    });
});
