# 🔧 Configuración de Variables de Entorno

## 📋 Pasos para Configurar

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Completa las variables con tus datos reales:**
   Edita el archivo `.env` y reemplaza los valores de ejemplo.

## 🔑 Cómo Obtener las API Keys

### MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo cluster (gratis)
4. Ve a **Database Access** → Crea un usuario
5. Ve a **Network Access** → Permite tu IP
6. Ve a **Database** → **Connect** → **Connect your application**
7. Copia la connection string y reemplaza `<password>` con tu contraseña

### Gemini AI
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta Google
3. Crea una nueva API key
4. Copia la key generada

### Finnhub (Datos del Mercado)
1. Ve a [Finnhub](https://finnhub.io/register)
2. Crea una cuenta gratuita
3. Ve a tu dashboard
4. Copia tu API key

### Gmail (para emails)
1. Habilita **2FA** en tu cuenta Gmail
2. Ve a [App Passwords](https://myaccount.google.com/apppasswords)
3. Genera una nueva App Password para "Mail"
4. Usa esta password (no tu contraseña regular)

### BetterAuth Secret
Genera una clave secreta fuerte:
```bash
# En terminal (Mac/Linux):
openssl rand -base64 32

# O usa un generador online seguro
```

## ⚠️ Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- **NUNCA** compartas tus API keys públicamente
- Usa diferentes valores para desarrollo y producción
- Rota las keys periódicamente

## 🚀 Verificación

Para verificar que todo está configurado:

```bash
npm run dev
```

Si ves errores relacionados con variables de entorno, revisa que:
- El archivo `.env` existe en la raíz del proyecto
- Todas las variables requeridas están definidas
- No hay espacios extra alrededor de los valores
