#!/usr/bin/env node

// Script para probar la conexión a MongoDB Atlas
// Ejecuta: npx tsx scripts/test-db-connection.js

// Cargar variables de entorno desde .env.local
import 'dotenv/config';

import { connectToDatabase } from '../database/mongoose.js';

async function testDatabaseConnection() {
    console.log('🔄 Iniciando prueba de conexión a MongoDB...\n');

    try {
        // Verificar que existe la variable de entorno
		console.log('process.env.MONGODB_URI',process.env.MONGODB_URI);
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
        }

        console.log('✅ Variable MONGODB_URI encontrada');
        console.log('🔗 URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Oculta credenciales

        // Intentar conectar
        console.log('\n🔄 Conectando a MongoDB Atlas...');
        const connection = await connectToDatabase();

        if (connection && connection.connection.readyState === 1) {
            console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');
            console.log('📊 Estado de conexión:', connection.connection.readyState);
            console.log('🏷️  Nombre de la base de datos:', connection.connection.name);
            console.log('🌐 Host:', connection.connection.host);

            // Hacer una consulta simple para confirmar que funciona
            const collections = await connection.connection.db.listCollections().toArray();
            console.log('📁 Colecciones disponibles:', collections.length);

            if (collections.length > 0) {
                console.log('   - Nombres de colecciones:');
                collections.forEach(col => console.log(`     • ${col.name}`));
            }

        } else {
            console.log('❌ Conexión establecida pero estado no válido');
        }

    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:');
        console.error('   Mensaje:', error.message);

        if (error.message.includes('MONGODB_URI')) {
            console.log('\n💡 Solución:');
            console.log('   1. Crea un archivo .env.local en la raíz del proyecto');
            console.log('   2. Añade: MONGODB_URI=tu_url_de_mongodb_atlas');
        } else if (error.message.includes('authentication')) {
            console.log('\n💡 Posibles causas:');
            console.log('   - Usuario o contraseña incorrectos');
            console.log('   - IP no permitida en MongoDB Atlas');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            console.log('\n💡 Posibles causas:');
            console.log('   - Problemas de red');
            console.log('   - IP no está en la whitelist de MongoDB Atlas');
        }

        process.exit(1);
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    process.exit(0);
}

// Ejecutar la prueba
testDatabaseConnection();
