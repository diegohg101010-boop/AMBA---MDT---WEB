#!/usr/bin/env node

/**
 * Script para ver sesiones e IPs de usuarios
 * Uso: node view-sessions.js
 */

import { connectDatabase, initMDTTables, all } from './src/config/database.js';

async function viewSessions() {
    try {
        // Conectar a la base de datos
        await connectDatabase();
        await initMDTTables();

        console.log('\n=== SESIONES ACTIVAS E IPs ===\n');

        const sesiones = await all(`
            SELECT 
                s.id,
                u.username,
                u.rol,
                s.ip_address,
                s.user_agent,
                s.fecha_creacion,
                s.activo
            FROM sesiones s
            JOIN usuarios_web u ON s.usuario_id = u.id
            ORDER BY s.fecha_creacion DESC
            LIMIT 50
        `);

        if (sesiones.length === 0) {
            console.log('No hay sesiones registradas\n');
            process.exit(0);
            return;
        }

        console.log(`Total de sesiones: ${sesiones.length}\n`);
        console.log('═══════════════════════════════════════════════════════════════════════════════\n');

        sesiones.forEach((s, index) => {
            const estado = s.activo ? '🟢 Activa' : '🔴 Inactiva';
            const fecha = new Date(s.fecha_creacion).toLocaleString('es-ES');
            
            console.log(`${index + 1}. ${s.username} (${s.rol}) - ${estado}`);
            console.log(`   IP: ${s.ip_address}`);
            console.log(`   Fecha: ${fecha}`);
            console.log(`   User-Agent: ${s.user_agent?.substring(0, 60)}...`);
            console.log('───────────────────────────────────────────────────────────────────────────────');
        });

        // Estadísticas
        const activas = sesiones.filter(s => s.activo).length;
        const inactivas = sesiones.filter(s => !s.activo).length;
        const ipsUnicas = [...new Set(sesiones.map(s => s.ip_address))].length;

        console.log('\n📊 ESTADÍSTICAS:');
        console.log(`   Sesiones activas: ${activas}`);
        console.log(`   Sesiones inactivas: ${inactivas}`);
        console.log(`   IPs únicas: ${ipsUnicas}\n`);

        // IPs más frecuentes
        const ipCount = {};
        sesiones.forEach(s => {
            ipCount[s.ip_address] = (ipCount[s.ip_address] || 0) + 1;
        });

        const topIPs = Object.entries(ipCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        console.log('🔝 TOP 5 IPs MÁS FRECUENTES:');
        topIPs.forEach(([ip, count], index) => {
            console.log(`   ${index + 1}. ${ip} - ${count} sesiones`);
        });
        console.log();

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

viewSessions();
