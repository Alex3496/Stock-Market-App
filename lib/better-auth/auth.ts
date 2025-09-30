import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

//ReturnType: es una utilidad de TypeScript que infiere y devuelve el tipo de retorno de una función dada.
//en este caso, se usa para definir el tipo de authInstance basado en el tipo que devuelve betterAuth.
//authInstance se usa para almacenar la instancia singleton de la autenticación.
//singleton: patrón de diseño que asegura que una clase tenga solo una instancia y proporciona un punto de acceso global a ella.
//esto es útil para evitar múltiples instancias en entornos como Next.js donde el código puede recargarse frecuentemente.
let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {

	if(authInstance){
		return authInstance;
	}

	const mongoose = await connectToDatabase();

	const db = mongoose.connection.db;

	if(!db){
		throw new Error("Database connection is not established");
	}

	authInstance = betterAuth({
		database: mongodbAdapter(db as any), //cast a any para evitar error de tipos
		secret: process.env.BETTER_AUTH_SECRET,
		baseURL: process.env.BETTER_AUTH_URL,
		emailAndPassword:{
			enabled: true, // Habilitar autenticación por email y contraseña
			disableSignUp: false, // Permitir registro de nuevos usuarios
			requireEmailVerification: false, // No es obligatorio verificar el email
			minPasswordLength: 6,
			maxPasswordLength: 100,
			autoSignIn: true // Iniciar sesión automáticamente tras el registro
		},
		plugins: [nextCookies()]
	});

	return authInstance;
}


export const auth = await getAuth();
