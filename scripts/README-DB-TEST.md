# Prueba de Conexión a MongoDB Atlas

Este script te permite verificar que tu conexión a MongoDB Atlas funciona correctamente.

## 📋 Prerrequisitos

1. **Archivo .env.local**: Debe existir en la raíz del proyecto con:
   ```
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombreBD
   ```

2. **Dependencias instaladas**: 
   ```bash
   npm install
   ```

## 🚀 Cómo ejecutar la prueba

### Opción 1: Script directo
```bash
node scripts/test-db-connection.js
```

### Opción 2: Agregar al package.json (recomendado)
Añade este script a tu `package.json`:
```json
{
  "scripts": {
    "test:db": "node scripts/test-db-connection.js"
  }
}
```

Luego ejecuta:
```bash
npm run test:db
```

## ✅ Resultados esperados

### Conexión exitosa:
```
🔄 Iniciando prueba de conexión a MongoDB...
✅ Variable MONGODB_URI encontrada
🔗 URI: mongodb+srv://***:***@cluster.mongodb.net/stockmarket
🔄 Conectando a MongoDB Atlas...
✅ ¡Conexión exitosa a MongoDB Atlas!
📊 Estado de conexión: 1
🏷️  Nombre de la base de datos: stockmarket
🌐 Host: cluster.mongodb.net
📁 Colecciones disponibles: 2
   - Nombres de colecciones:
     • users
     • stocks
🎉 Prueba completada exitosamente!
```

### Errores comunes:

#### ❌ Variable de entorno no definida:
```
❌ MONGODB_URI no está definida en las variables de entorno
💡 Solución:
   1. Crea un archivo .env.local en la raíz del proyecto
   2. Añade: MONGODB_URI=tu_url_de_mongodb_atlas
```

#### ❌ Error de autenticación:
```
❌ Error al conectar a MongoDB:
   Mensaje: Authentication failed
💡 Posibles causas:
   - Usuario o contraseña incorrectos
   - IP no permitida en MongoDB Atlas
```

## 🔧 Configuración de MongoDB Atlas

Si tienes errores, verifica:

1. **Usuario y contraseña**: En MongoDB Atlas > Database Access
2. **IP Whitelist**: En MongoDB Atlas > Network Access
   - Agrega tu IP actual o `0.0.0.0/0` (para desarrollo)
3. **URL correcta**: En MongoDB Atlas > Connect > Connect your application

## 📝 Próximos pasos

Una vez que la conexión funcione:
1. Crear modelos de Mongoose en `/models/`
2. Implementar API routes en `/app/api/`
3. Usar `await connectToDatabase()` antes de operaciones de BD
