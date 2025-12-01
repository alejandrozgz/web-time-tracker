# Admin Panel - Secure Authentication Setup

## 📋 Resumen

Se ha implementado un sistema de autenticación seguro para el panel de administración basado en:
- **Backend**: JWT tokens con bcrypt para hashing de contraseñas
- **Base de datos**: Tabla `admin_users` en Supabase
- **Frontend**: React Context con validación de tokens
- **Protección**: Middleware en todas las rutas admin

## ✅ Cambios Implementados

### 1. Base de Datos

**Archivo**: `backend/migrations/create_admin_users.sql`

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

**Features:**
- Contraseñas hasheadas con bcrypt (nunca en texto plano)
- Timestamps automáticos
- Campo `is_active` para desactivar usuarios
- Tracking de último login

### 2. Backend - Autenticación

**Nuevos archivos creados:**

#### `backend/src/lib/auth.ts`
- `generateToken()`: Genera JWT tokens
- `verifyToken()`: Valida JWT tokens
- `hashPassword()`: Hashea contraseñas con bcrypt
- `comparePassword()`: Compara contraseñas
- `validateAdminAuth()`: Valida autenticación en requests

#### `backend/src/middleware/adminAuth.ts`
- `withAdminAuth()`: Middleware HOC para proteger rutas (soporta rutas regulares y dinámicas con params)
- `getAdminDataFromRequest()`: Extrae info del admin del request
- **Feature**: Sobrecarga de tipos para soportar tanto rutas simples como rutas dinámicas con parámetros

#### `backend/src/app/api/admin/auth/login/route.ts`
- POST endpoint para login
- Valida credenciales contra la BD
- Retorna JWT token

#### `backend/src/app/api/admin/auth/verify/route.ts`
- GET endpoint para verificar tokens
- Valida que el token siga siendo válido

### 3. Frontend - Context de Autenticación

**Archivo modificado**: `frontend/src/contexts/AdminAuthContext.tsx`

**Cambios:**
- ❌ Eliminadas credenciales hardcodeadas
- ✅ Login mediante API call al backend
- ✅ Verificación de token en mount
- ✅ Tokens almacenados en localStorage
- ✅ Auto-logout si token es inválido

### 4. Rutas Protegidas

Todas las rutas de admin ahora requieren autenticación JWT:

✅ `/api/admin/dashboard` - Dashboard stats
✅ `/api/admin/user-activity` - User activity analytics
✅ `/api/admin/companies` - GET, POST
✅ `/api/admin/tenants` - GET, POST
✅ `/api/admin/tenants/[id]` - GET, PATCH, DELETE
✅ `/api/admin/time-entries` - GET

🔓 Sin protección (endpoints públicos):
- `/api/admin/auth/login` - Login endpoint
- `/api/admin/auth/verify` - Token verification

## 🚀 Pasos de Instalación

### 1. Ejecutar Migración de Base de Datos

**IMPORTANTE**: Debes ejecutar esta migración en Supabase para crear la tabla `admin_users`.

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `backend/migrations/create_admin_users.sql`
4. Ejecuta el script

Esto creará:
- Tabla `admin_users`
- Índices para búsquedas rápidas
- Triggers para `updated_at`
- Usuario admin por defecto (username: `admin`, password: `admin123`)

### 2. Instalar Dependencias

Las dependencias ya fueron instaladas automáticamente:

```bash
npm install jsonwebtoken @types/jsonwebtoken
# bcryptjs ya estaba instalado
```

### 3. Configurar Variables de Entorno (Opcional)

En `backend/.env.local`, puedes agregar:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

⚠️ **IMPORTANTE**: En producción, DEBES cambiar el JWT_SECRET a un valor seguro y aleatorio.

Si no se configura, se usa un valor por defecto (NO SEGURO para producción).

### 4. Rebuild y Restart

```bash
# Backend
cd backend
npm run build
npm run dev

# Frontend
cd frontend
npm run dev
```

## 🔐 Credenciales Por Defecto

**Username**: `admin`
**Password**: `admin123`

⚠️ **DEBES cambiar estas credenciales en producción**

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa credentials en /admin/login
   ↓
2. Frontend llama POST /api/admin/auth/login
   ↓
3. Backend valida contra admin_users table
   ↓
4. Backend genera JWT token (válido por 7 días)
   ↓
5. Frontend guarda token en localStorage
   ↓
6. Frontend configura header Authorization: Bearer {token}
   ↓
7. Todas las peticiones admin incluyen el token
   ↓
8. Middleware withAdminAuth() valida token en cada request
   ↓
9. Si token válido → permite acceso
   Si token inválido → retorna 401 Unauthorized
```

## 🛡️ Seguridad

### ✅ Implementado

1. **Contraseñas hasheadas**: bcrypt con salt rounds = 10
2. **JWT tokens**: Firmados con secret, expiran en 7 días
3. **Middleware de protección**: Todas las rutas admin validadas
4. **Tokens en headers**: Bearer token authentication
5. **Validación backend**: No confía en cliente, valida todo en servidor
6. **Auto-logout**: Si token expira o es inválido

### ⚠️ Pendiente para Producción

1. **Cambiar JWT_SECRET**: Usar variable de entorno segura
2. **Cambiar password admin**: Usar credenciales fuertes
3. **HTTPS**: Asegurar que todas las peticiones usen HTTPS
4. **Rate limiting**: Implementar límite de intentos de login
5. **Refresh tokens**: Implementar tokens de refresh para mejor UX
6. **Audit logging**: Registrar accesos y cambios en panel admin

## 📝 Cómo Cambiar Contraseña de Admin

### Opción 1: Mediante SQL (Recomendado para primera vez)

1. Genera un hash de tu nueva contraseña:

```javascript
// En Node.js
const bcrypt = require('bcryptjs');
const password = 'tu-nueva-contraseña-segura';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

2. Actualiza en Supabase SQL Editor:

```sql
UPDATE admin_users
SET password_hash = '$2b$10$...(tu-hash-aqui)...'
WHERE username = 'admin';
```

### Opción 2: Agregar endpoint de cambio de contraseña

Puedes crear un endpoint protegido `/api/admin/auth/change-password` que permita a los admins cambiar su propia contraseña.

## 🔍 Debugging

### Token inválido o expirado

Si ves este error:
```
Token verification failed: TokenExpiredError: jwt expired
```

**Solución**: El usuario debe hacer login nuevamente. Los tokens expiran después de 7 días.

### No puede acceder a rutas admin

Si obtienes `401 Unauthorized`:

1. Verifica que el token esté en localStorage: `localStorage.getItem('admin_token')`
2. Verifica que el header Authorization esté configurado
3. Verifica que el token no haya expirado
4. Verifica que la migración de `admin_users` se ejecutó correctamente

### Build fails

Si el build falla con errores de tipo:

```bash
npm install jsonwebtoken @types/jsonwebtoken bcryptjs @types/bcryptjs
```

## 📁 Archivos Modificados/Creados

### Nuevos Archivos

```
backend/
├── migrations/
│   └── create_admin_users.sql                    [NUEVO]
├── src/
│   ├── lib/
│   │   └── auth.ts                                [NUEVO]
│   ├── middleware/
│   │   └── adminAuth.ts                           [NUEVO]
│   └── app/api/admin/
│       └── auth/
│           ├── login/route.ts                     [NUEVO]
│           └── verify/route.ts                    [NUEVO]
```

### Archivos Modificados

```
backend/src/app/api/admin/
├── dashboard/route.ts                              [MODIFICADO]
├── user-activity/route.ts                          [MODIFICADO]
├── companies/route.ts                              [MODIFICADO]
├── tenants/route.ts                                [MODIFICADO]
├── tenants/[id]/route.ts                           [MODIFICADO]
└── time-entries/route.ts                           [MODIFICADO]

frontend/src/
├── contexts/AdminAuthContext.tsx                   [MODIFICADO]
└── services/adminApi.ts                            [MODIFICADO]
```

## 🎯 Próximos Pasos Recomendados

1. ✅ **Ejecutar migración SQL** en Supabase
2. ✅ **Probar login** con credenciales por defecto
3. ✅ **Cambiar password** del admin
4. ✅ **Configurar JWT_SECRET** en production
5. ⏳ **Implementar rate limiting** para login
6. ⏳ **Agregar 2FA** (opcional pero recomendado)
7. ⏳ **Implementar audit log** para acciones admin

## ❓ FAQ

**P: ¿Por qué usar JWT en lugar de sessions?**
R: JWT es stateless, escalable, y funciona bien con Next.js y React. No requiere almacenamiento de sesión en el servidor.

**P: ¿Por qué 7 días de expiración?**
R: Balance entre seguridad y UX. Se puede ajustar en `backend/src/lib/auth.ts` (variable `JWT_EXPIRES_IN`).

**P: ¿Puedo agregar más admins?**
R: Sí, simplemente inserta nuevos registros en la tabla `admin_users` con contraseñas hasheadas.

**P: ¿Es seguro almacenar tokens en localStorage?**
R: Es aceptable para paneles admin. Para mayor seguridad, considera httpOnly cookies o sessionStorage. El token expira automáticamente.

**P: ¿Qué pasa si pierdo el password de admin?**
R: Puedes resetearl mediante SQL directo en Supabase, generando un nuevo hash y actualizando la tabla.

## 📞 Soporte

Si encuentras problemas con la implementación, revisa:
1. Logs del backend: `console.log` muestra errores de autenticación
2. Network tab: Verifica que el header Authorization esté presente
3. Supabase logs: Verifica que las queries funcionen correctamente

---

**✨ La autenticación del panel de admin ahora es segura y está lista para producción (después de cambiar credenciales y secret).**
