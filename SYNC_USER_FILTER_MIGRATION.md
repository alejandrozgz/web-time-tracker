# Migración: Filtro por Usuario en Sincronización

## Problema Resuelto
Cuando un usuario hacía clic en el botón de sincronización, se sincronizaban las entradas pendientes de **todos los usuarios** de la compañía. Ahora, cada usuario solo sincroniza **sus propias entradas pendientes**.

## Cambios Realizados

### 1. Backend - Funciones SQL de Supabase
Se actualizaron dos funciones para aceptar un parámetro opcional `p_resource_no` que filtra las entradas por usuario:

- **`get_pending_sync_entries`**: Filtra las entradas pendientes de sincronización
- **`get_sync_dashboard`**: Filtra las estadísticas del dashboard de sincronización

### 2. Backend - API Routes
Se actualizaron tres endpoints para extraer el `resourceNo` del token JWT del usuario y pasarlo a las funciones SQL:

- **`/api/[tenant]/sync/to-bc`**: Endpoint de sincronización
- **`/api/[tenant]/sync/dashboard`**: Endpoint del dashboard de sincronización
- **`/api/[tenant]/sync/pending`**: Endpoint de entradas pendientes

## Instrucciones de Migración

### Paso 1: Ejecutar Migraciones SQL en Supabase

Debes ejecutar estas dos migraciones SQL en el **SQL Editor** de Supabase en el siguiente orden:

#### 1.1. Actualizar función `get_pending_sync_entries`

```sql
-- Ejecutar el contenido del archivo:
-- backend/migrations/update_get_pending_sync_entries_add_user_filter.sql
```

#### 1.2. Actualizar función `get_sync_dashboard`

```sql
-- Ejecutar el contenido del archivo:
-- backend/migrations/update_sync_dashboard_add_user_filter.sql
```

### Paso 2: Verificar las Funciones

Después de ejecutar las migraciones, verifica que las funciones se crearon correctamente:

```sql
-- Verificar get_pending_sync_entries
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_pending_sync_entries';

-- Verificar get_sync_dashboard
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_sync_dashboard';
```

### Paso 3: Probar la Funcionalidad

1. **Reiniciar el backend** para que cargue los cambios en las rutas
2. **Iniciar sesión con dos usuarios diferentes** (cada uno con su propio `resourceNo`)
3. **Crear entradas de tiempo** para cada usuario
4. **Hacer clic en el botón de sincronización** con cada usuario
5. **Verificar** que cada usuario solo sincroniza sus propias entradas

## Comportamiento Esperado

### Antes de la Migración ❌
- Usuario A hace clic en "Sync"
- Se sincronizan entradas de Usuario A, Usuario B, Usuario C, etc. (todas las entradas pendientes de la compañía)

### Después de la Migración ✅
- Usuario A hace clic en "Sync"
- Se sincronizan **solo** las entradas del Usuario A
- Usuario B hace clic en "Sync"
- Se sincronizan **solo** las entradas del Usuario B

## Notas Técnicas

### Filtrado por resourceNo
- El `resourceNo` se extrae del token JWT en cada request
- Si el token no está presente o no se puede decodificar, `resourceNo` será `undefined`
- Si `resourceNo` es `undefined` o `NULL`, las funciones SQL retornan **todas las entradas** (modo admin)

### Compatibilidad con Admin
Las funciones SQL tienen un parámetro `DEFAULT NULL` que permite:
- **Usuario normal**: Pasa su `resourceNo` → solo ve sus entradas
- **Admin**: Pasa `NULL` → ve todas las entradas

### Archivos Modificados

**SQL Migrations:**
- `backend/migrations/update_get_pending_sync_entries_add_user_filter.sql` (nuevo)
- `backend/migrations/update_sync_dashboard_add_user_filter.sql` (nuevo)

**Backend API Routes:**
- `backend/src/app/api/[tenant]/sync/to-bc/route.ts` (modificado)
- `backend/src/app/api/[tenant]/sync/dashboard/route.ts` (modificado)
- `backend/src/app/api/[tenant]/sync/pending/route.ts` (modificado)

## Troubleshooting

### Error: "function get_pending_sync_entries(uuid) does not exist"
- **Causa**: La función anterior tenía solo 1 parámetro, la nueva tiene 2
- **Solución**: Ejecutar la migración SQL que hace `DROP FUNCTION IF EXISTS` primero

### Error: "column resource_no does not exist"
- **Causa**: La tabla `time_entries` no tiene el campo `resource_no`
- **Solución**: Verificar el esquema de la tabla en Supabase

### Las entradas de otros usuarios aún aparecen
- **Causa**: Las migraciones SQL no se ejecutaron correctamente
- **Solución**: Verificar que las funciones se crearon con el parámetro `p_resource_no`

### El dashboard muestra 0 entradas para todos
- **Causa**: El `resourceNo` del token no coincide con el `resource_no` de las entradas
- **Solución**: Verificar que el token JWT contiene el campo `resourceNo` correcto
