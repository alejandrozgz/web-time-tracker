# Business Central Sync Logs

Sistema completo de logging para sincronizaciones con Business Central.

## Descripción

Esta implementación agrega un sistema robusto de logging que registra todas las operaciones de sincronización con Business Central, incluyendo:

- Sincronizaciones exitosas y fallidas
- Detalles de errores individuales por entrada
- Métricas de rendimiento (duración, entradas procesadas)
- Estadísticas agregadas
- Historial de actividad

## Archivos Creados/Modificados

### Backend

#### 1. Migración de Base de Datos
**Archivo:** `backend/migrations/create_sync_logs_table.sql`

Crea:
- Tabla `bc_sync_logs` con todos los campos necesarios
- Tipos ENUM: `sync_log_level` y `sync_operation_type`
- Índices para optimizar consultas
- Funciones SQL:
  - `get_sync_logs()` - Obtener logs con filtros
  - `get_sync_statistics()` - Estadísticas agregadas
  - `get_recent_sync_activity()` - Actividad reciente por hora
- Políticas de Row Level Security (RLS)

**Ejecutar migración:**
```sql
-- En el SQL Editor de Supabase, ejecutar el contenido del archivo:
-- backend/migrations/create_sync_logs_table.sql
```

#### 2. Ruta de Sincronización Actualizada
**Archivo:** `backend/src/app/api/[tenant]/sync/to-bc/route.ts`

Modificaciones:
- Registra inicio de operación con timestamp
- Log cuando no hay OAuth habilitado
- Log cuando no hay entradas para sincronizar
- Log detallado de cada error individual
- Log del resultado general de la sincronización
- Captura duración de la operación
- Manejo de errores críticos con logging

#### 3. Nuevas API Routes

**`backend/src/app/api/[tenant]/sync/logs/route.ts`**
- GET endpoint para obtener logs
- Soporta filtros: operation_type, log_level, date_from, date_to, limit, offset
- Usa la función SQL `get_sync_logs()`

**`backend/src/app/api/[tenant]/sync/statistics/route.ts`**
- GET endpoint para estadísticas
- Retorna métricas agregadas de sincronización
- Usa la función SQL `get_sync_statistics()`

**`backend/src/app/api/[tenant]/sync/activity/route.ts`**
- GET endpoint para actividad reciente
- Agrupa sincronizaciones por hora
- Usa la función SQL `get_recent_sync_activity()`

### Frontend

#### 4. Tipos TypeScript
**Archivo:** `frontend/src/types/index.ts`

Nuevos tipos agregados:
```typescript
enum SyncLogLevel { INFO, WARNING, ERROR, SUCCESS }
enum SyncOperationType { SYNC_TO_BC, POST_BATCH, FETCH_FROM_BC, RETRY }
interface BCSyncLog { ... }
interface SyncLogFilters { ... }
interface SyncStatistics { ... }
interface SyncActivity { ... }
```

#### 5. Servicio API
**Archivo:** `frontend/src/services/api.ts`

Nuevos métodos:
```typescript
getSyncLogs(companyId, filters?)
getSyncStatistics(companyId, dateFrom?, dateTo?)
getSyncActivity(companyId, hours?)
```

#### 6. Componente de Visualización
**Archivo:** `frontend/src/components/sync/SyncLogsViewer.tsx`

Componente React completo con:
- Visualización de logs en tabla expandible
- Tarjetas de estadísticas (Total Ops, Success Rate, Total Entries, Avg Duration)
- Panel de filtros (tipo de operación, nivel de log, rango de fechas)
- Paginación
- Detalles expandibles por log
- Badges de colores por tipo y nivel
- Formato de fechas y duración
- Botón de refresh

## Estructura de la Tabla bc_sync_logs

```sql
CREATE TABLE bc_sync_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  company_id UUID NOT NULL,

  -- Detalles de operación
  operation_type sync_operation_type NOT NULL,
  batch_name VARCHAR(50),
  batch_id UUID,
  time_entry_id UUID,

  -- Detalles del log
  log_level sync_log_level NOT NULL,
  message TEXT NOT NULL,
  details JSONB,

  -- Métricas
  entries_processed INT,
  entries_succeeded INT,
  entries_failed INT,
  total_hours DECIMAL(10,2),
  duration_ms INT,

  -- Contexto de usuario
  user_id UUID,
  resource_no VARCHAR(50),

  -- Contexto BC
  bc_journal_id VARCHAR(100),
  bc_error_code VARCHAR(50),
  bc_error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Uso del Componente

### Integrar en una Página

```tsx
import SyncLogsViewer from '@/components/sync/SyncLogsViewer';

function SyncLogsPage() {
  const { company } = useAuth(); // O como obtengas el companyId

  return (
    <div className="container mx-auto p-6">
      <SyncLogsViewer companyId={company.id} />
    </div>
  );
}
```

### Agregar a la Navegación

En tu sidebar o menú principal:

```tsx
<nav>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/time-tracker">Time Tracker</Link>
  <Link to="/sync-logs">Sync Logs</Link> {/* NUEVO */}
</nav>
```

### Crear Ruta (React Router)

```tsx
import SyncLogsViewer from '@/components/sync/SyncLogsViewer';

const routes = [
  // ... otras rutas
  {
    path: '/sync-logs',
    element: <SyncLogsViewer companyId={companyId} />
  }
];
```

## Ejemplos de Logs Registrados

### 1. Sincronización Exitosa
```json
{
  "operation_type": "sync_to_bc",
  "log_level": "success",
  "message": "Sync completed: 15 succeeded, 0 failed",
  "entries_processed": 15,
  "entries_succeeded": 15,
  "entries_failed": 0,
  "total_hours": 120.5,
  "duration_ms": 2340,
  "batch_name": "TT-WEB"
}
```

### 2. Error Individual de Entrada
```json
{
  "operation_type": "sync_to_bc",
  "log_level": "error",
  "message": "Failed to sync entry: Development work on API",
  "time_entry_id": "uuid-here",
  "bc_error_code": "BC_INVALID_JOB",
  "bc_error_message": "Job not found",
  "resource_no": "JOHN-001",
  "details": {
    "entry_id": "uuid",
    "job_bc_id": "JOB-123",
    "task_bc_id": "TASK-456",
    "hours": 8,
    "date": "2025-01-15"
  }
}
```

### 3. Sin Entradas para Sincronizar
```json
{
  "operation_type": "sync_to_bc",
  "log_level": "info",
  "message": "No entries to sync",
  "entries_processed": 0,
  "entries_succeeded": 0,
  "entries_failed": 0,
  "duration_ms": 123
}
```

## API Endpoints

### 1. Obtener Logs
```
GET /api/[tenant]/sync/logs?companyId={id}&operation_type=sync_to_bc&log_level=error&limit=50&offset=0
```

Response:
```json
{
  "logs": [...],
  "count": 50,
  "limit": 50,
  "offset": 0
}
```

### 2. Obtener Estadísticas
```
GET /api/[tenant]/sync/statistics?companyId={id}&date_from=2025-01-01&date_to=2025-01-31
```

Response:
```json
{
  "total_operations": 45,
  "successful_operations": 42,
  "failed_operations": 3,
  "total_entries_processed": 567,
  "total_entries_succeeded": 545,
  "total_entries_failed": 22,
  "total_hours": 4360.5,
  "avg_duration_ms": 1850.5,
  "last_sync_at": "2025-01-15T10:30:00Z",
  "errors_by_code": {
    "BC_INVALID_JOB": 5,
    "BC_TIMEOUT": 2
  }
}
```

### 3. Obtener Actividad Reciente
```
GET /api/[tenant]/sync/activity?companyId={id}&hours=24
```

Response:
```json
{
  "activity": [
    {
      "hour_start": "2025-01-15T10:00:00Z",
      "total_syncs": 3,
      "successful_syncs": 2,
      "failed_syncs": 1,
      "entries_synced": 45,
      "hours_synced": 360
    }
  ],
  "hours": 24
}
```

## Filtros Disponibles

### Operation Type
- `sync_to_bc` - Sincronización hacia BC
- `post_batch` - Publicación de lote
- `fetch_from_bc` - Obtención desde BC
- `retry` - Reintento de sincronización

### Log Level
- `success` - Operación exitosa
- `info` - Información general
- `warning` - Advertencia (parcialmente exitoso)
- `error` - Error

### Rango de Fechas
- `date_from` - Fecha inicio (ISO 8601)
- `date_to` - Fecha fin (ISO 8601)

## Índices de Base de Datos

Para rendimiento óptimo, se crearon los siguientes índices:

```sql
idx_bc_sync_logs_tenant         -- tenant_id
idx_bc_sync_logs_company        -- company_id
idx_bc_sync_logs_created_at     -- created_at DESC
idx_bc_sync_logs_operation      -- operation_type
idx_bc_sync_logs_level          -- log_level
idx_bc_sync_logs_batch          -- batch_id (where not null)
idx_bc_sync_logs_entry          -- time_entry_id (where not null)
idx_bc_sync_logs_user           -- user_id (where not null)
idx_bc_sync_logs_company_date   -- (company_id, created_at DESC)
idx_bc_sync_logs_batch_name     -- batch_name (where not null)
```

## Seguridad

### Row Level Security (RLS)

La tabla `bc_sync_logs` tiene RLS habilitado:

1. **Users can view sync logs for their tenant**
   - Los usuarios solo pueden ver logs de su tenant

2. **Service role has full access**
   - El role de servicio tiene acceso completo

## Mantenimiento

### Limpiar Logs Antiguos

Para mantener el tamaño de la tabla manejable, se recomienda crear un job que limpie logs antiguos:

```sql
-- Eliminar logs mayores a 90 días
DELETE FROM bc_sync_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Monitoreo de Rendimiento

Consultar logs que tardaron mucho:

```sql
SELECT *
FROM bc_sync_logs
WHERE duration_ms > 5000  -- Más de 5 segundos
ORDER BY duration_ms DESC
LIMIT 20;
```

## Troubleshooting

### Error: Function get_sync_logs does not exist
**Solución:** Ejecutar la migración SQL completa en Supabase.

### Error: Column bc_sync_logs.details does not exist
**Solución:** Verificar que la migración se ejecutó correctamente.

### Los logs no aparecen en el frontend
**Solución:**
1. Verificar que la tabla existe en Supabase
2. Revisar las políticas RLS
3. Verificar que el usuario tenga permisos correctos
4. Revisar console del navegador para errores de API

### Rendimiento lento al cargar logs
**Solución:**
1. Reducir el límite de registros (parámetro `limit`)
2. Agregar más filtros específicos
3. Verificar que los índices estén creados
4. Considerar paginación más agresiva

## Próximas Mejoras Sugeridas

1. **Dashboard de Métricas**
   - Gráficos de tendencias de sincronización
   - Alertas automáticas para fallos recurrentes

2. **Exportación de Logs**
   - Exportar a CSV/Excel
   - Exportar a PDF con filtros aplicados

3. **Notificaciones**
   - Email cuando hay errores críticos
   - Slack/Teams integration

4. **Retención de Logs**
   - Job automático para archivar logs antiguos
   - Compresión de detalles JSON antiguos

5. **Búsqueda Avanzada**
   - Búsqueda de texto completo en mensajes
   - Búsqueda en campo JSONB details

## Soporte

Para preguntas o problemas, contactar al equipo de desarrollo de ATP Dynamics Solutions.
