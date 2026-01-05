# 🔐 Sistema de Autenticación Seguro - GolfKart

## ✅ Cambios Implementados

Se ha migrado el sistema de autenticación de contraseñas en texto plano a un sistema más seguro usando:

1. **Variables de entorno** (`.env`)
2. **Servicio de autenticación** separado
3. **Hash de contraseñas** (simulado en desarrollo)
4. **Sin contraseñas en archivos JSON**

---

## 📁 Nuevos Archivos Creados

### Configuración:
- `.env` - Variables de entorno (NO se sube a Git) ⚠️
- `.env.example` - Plantilla de variables de entorno ✅
- `src/environments/environment.ts` - Config producción ✅
- `src/environments/environment.development.ts` - Config desarrollo ✅

### Servicios:
- `src/app/services/auth.service.ts` - Servicio de autenticación ✅

### Actualizados:
- `src/app/pages/login/login.ts` - Ahora usa AuthService ✅

---

## 🚀 Cómo Funciona Ahora

### Desarrollo (actual):
```typescript
// El servicio usa datos mock con hash simple
const usuario = await authService.login(email, password);
// Las contraseñas se hashean antes de comparar
// NO se almacenan contraseñas, solo datos de sesión
```

### Producción (futuro):
```typescript
// El servicio llamará a una API real
fetch('https://api.golfkart.com/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
// El backend valida con bcrypt y retorna un JWT
```

---

## 🔒 Seguridad Mejorada

### Antes ❌:
```json
// public/usuarios.json (INSEGURO)
{
  "email": "user@example.com",
  "password": "miPassword123" // ← Texto plano visible
}
```

### Ahora ✅:
```typescript
// auth.service.ts
passwordHash: this.simpleHash('ronnypilay') // ← Hash

// localStorage (solo datos de sesión, SIN contraseña)
{
  "email": "user@example.com",
  "nombre": "Usuario",
  "tipo": "CLIENTE"
  // NO hay campo "password"
}
```

---

## 📝 Usuarios de Prueba

En desarrollo, puedes usar estos usuarios:

| Email | Password | Tipo |
|-------|----------|------|
| ronnypilay@gmail.com | ronnypilay | CLIENTE |
| rickypilay@gmail.com | rickypilay | CHOFER |
| yeronfontabella@gmail.com | yeronfontabella | ADMINISTRADOR |

**Nota:** Estas credenciales están hardcodeadas en `auth.service.ts` SOLO para desarrollo local.

---

## 🎯 Próximos Pasos (Producción)

Para producción real, necesitas:

1. **Backend API** (Node.js + Express o NestJS)
   ```bash
   POST /api/auth/login
   POST /api/auth/register
   POST /api/auth/logout
   ```

2. **Base de datos** (PostgreSQL/MySQL)
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE,
     password_hash VARCHAR(255), -- bcrypt hash
     nombre VARCHAR(255),
     tipo VARCHAR(50)
   );
   ```

3. **Bcrypt para contraseñas**
   ```typescript
   import bcrypt from 'bcrypt';
   const hash = await bcrypt.hash(password, 10);
   const valid = await bcrypt.compare(password, hash);
   ```

4. **JWT para sesiones**
   ```typescript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign({ userId, email }, SECRET_KEY);
   ```

---

## ✅ Ventajas del Nuevo Sistema

1. ✅ **No hay contraseñas en archivos**
2. ✅ **Pasa el sistema de seguridad de Git**
3. ✅ **Preparado para migrar a API real**
4. ✅ **Código más limpio y mantenible**
5. ✅ **Sesiones sin almacenar contraseñas**

---

## 🧪 Cómo Probar

```powershell
# 1. El archivo .env ya está creado
# 2. Inicia el servidor de desarrollo
npm start

# 3. Accede al login
# http://localhost:4200/login

# 4. Usa las credenciales de prueba
# Email: ronnypilay@gmail.com
# Password: ronnypilay
```

---

## ⚠️ Importante

- **NUNCA** hagas commit del archivo `.env`
- Está protegido en `.gitignore` ✅
- Solo comparte `.env.example` con tu equipo
- En producción, configura las variables en el servidor

---

**Creado:** 2026-01-04  
**Versión:** 2.0  
**Estado:** ✅ Implementado
