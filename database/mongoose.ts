// Archivo de conexión a MongoDB Atlas usando Mongoose
// Objetivo: crear una única conexión reutilizable entre recargas/requests en Next.js
import mongoose from "mongoose";
import 'dotenv/config';

// URL de conexión a MongoDB (defínela en .env.local como MONGODB_URI)
let MONGODB_URI = process.env.MONGODB_URI || "";

declare global {
	// Guardamos la conexión y/o la promesa de conexión en una variable global
	// para evitar crear múltiples conexiones durante el desarrollo (Hot Reload)
	var mongooseCache:{
		conn: typeof mongoose | null;
		promise: Promise<typeof mongoose> | null;
	}
}

let cached = global.mongooseCache;
if(!cached){
	// Si no existe aún, inicializamos el caché global la primera vez
	cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
	// Cargar variables de entorno si es necesario
	MONGODB_URI = process.env.MONGODB_URI || "";

	// 1) Validamos que exista la URI
	if(!MONGODB_URI){
		throw new Error("Please define the MONGODB_URI environment variable inside .env");
	}

	// 2) Si ya hay una conexión establecida, la reutilizamos
	if(cached.conn){
		return cached.conn;
	}

	// 3) Si no hay una promesa en curso, iniciamos la conexión
	if(!cached.promise){
		// bufferCommands: false evita que Mongoose almacene en cola operaciones
		// antes de que la conexión esté lista (útil para evitar comportamientos raros)
		cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
	}

	try{
		// 4) Esperamos a que la promesa se resuelva y guardamos la conexión
		cached.conn = await cached.promise;
	}catch(err){
		// Si falla, limpiamos la promesa para reintentar en el próximo llamado
		cached.promise = null;
		throw err;
	}

	console.log("Connected to MongoDB");

	// 5) Devolvemos siempre la conexión para uso consistente
	return cached.conn;
}
