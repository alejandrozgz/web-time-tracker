# Implementación de Tracking de Aprobaciones desde BC

## 📋 Resumen

Sistema para consultar y mostrar el estado de aprobación de time entries desde Business Central Job Journal Lines.

## 🎯 Objetivo

Permitir que los usuarios vean si sus entries han sido:
- ✅ **Approved**: Aprobado en BC
- ❌ **Rejected**: Rechazado en BC
- ⏳ **Pending**: Pendiente de revisión (default)

Además, mostrar **comentarios** que se hayan añadido en BC.

## 🔄 Flujo de Trabajo

```
1. Usuario crea entry en Time Tracker
   ↓
2. Entry se sube a BC como Job Journal Line (editable)
   ↓ (guarda bc_journal_id)
3. Supervisor aprueba/rechaza en BC
   - Modifica campo: approvalStatus
   - Añade comentarios en: comments
   ↓
4. Time Tracker consulta BC periódicamente
   - GET /api/[tenant]/sync/refresh-status
   - Actualiza approval_status y bc_comments
   ↓
5. Usuario ve el estado actualizado en la UI
```

## 📁 Archivos Modificados/Creados

### 1. Migración de Base de Datos
**Archivo**: `backend/migrations/add_approval_fields_to_time_entries.sql`

```sql
-- Añade 2 nuevos campos a time_entries:
ALTER TABLE time_entries
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE time_entries
ADD COLUMN bc_comments TEXT;
```

**⚠️ IMPORTANTE**: Ejecutar esta migración en Supabase antes de usar la funcionalidad.

### 2. BC API Client
**Archivo**: `backend/src/lib/bc-api.ts`

Añadidos 2 métodos nuevos:

```typescript
// Consultar un solo Job Journal Line
async getJobJournalLineStatus(journalId: string): Promise<{
  approvalStatus?: string;
  comments?: string;
} | null>

// Consultar múltiples Journal Lines en batch (más eficiente)
async getJobJournalLinesStatus(journalIds: string[]): Promise<Map<
  string,
  { approvalStatus: string; comments: string }
>>
```

### 3. Endpoint de Refresh
**Archivo**: `backend/src/app/api/[tenant]/sync/refresh-status/route.ts`

**Endpoint**: `GET /api/[tenant]/sync/refresh-status?companyId=xxx`

**Funcionalidad**:
- Consulta BC para todas las entries sincronizadas
- Compara approval_status actual vs estado en BC
- Actualiza solo las entries que cambiaron
- Filtra por usuario actual (usa JWT token)
- Registra la operación en bc_sync_logs

**Respuesta**:
```json
{
  "success": true,
  "checked_entries": 25,
  "updated_entries": 3,
  "updates": [
    {
      "id": "uuid",
      "old_status": "pending",
      "new_status": "approved",
      "old_comments": "",
      "new_comments": "Approved by manager"
    }
  ],
  "message": "Checked 25 entries, updated 3"
}
```

### 4. Types Actualizados
**Archivo**: `frontend/src/types/index.ts`

```typescript
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TimeEntry {
  // ... campos existentes
  approval_status?: string;
  bc_comments?: string;
}
```

## 🚀 Cómo Usar

### Paso 1: Ejecutar Migración
```sql
-- En Supabase SQL Editor:
-- Copiar y ejecutar: backend/migrations/add_approval_fields_to_time_entries.sql
```

### Paso 2: Configurar BC
En Business Central, asegurarse de que la API Page `jobJournalLines` incluya:
- Campo: `approvalStatus` (Text[20])
- Campo: `comments` (Text[250] o más)

### Paso 3: Implementar UI (Pendiente)
Ver sección "Próximos Pasos" abajo.

## 📊 Estados de Aprobación

| Estado | Descripción | Color sugerido |
|--------|-------------|----------------|
| `pending` | Pendiente de revisión | Gris/Amarillo |
| `approved` | Aprobado | Verde |
| `rejected` | Rechazado | Rojo |

## 🔍 Cuándo se Consulta BC

**Opción 1**: Al cargar la lista de entries
```typescript
// En Dashboard.tsx o RecentEntries.tsx
useEffect(() => {
  loadEntries();
  refreshApprovalStatus(); // Nueva función
}, []);
```

**Opción 2**: Con botón manual de refresh
```typescript
<button onClick={refreshApprovalStatus}>
  Refresh Status from BC
</button>
```

**Opción 3**: Intervalo automático (cada 5 minutos)
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refreshApprovalStatus();
  }, 5 * 60 * 1000); // 5 minutos

  return () => clearInterval(interval);
}, []);
```

## 📝 Próximos Pasos (TODO)

### 1. Frontend Service
Crear método en `frontend/src/services/api.ts`:

```typescript
export const refreshApprovalStatus = async (
  companyId: string
): Promise<RefreshStatusResponse> => {
  const response = await axiosInstance.get(
    `/sync/refresh-status?companyId=${companyId}`
  );
  return response.data;
};
```

### 2. UI Components

#### RecentEntries Badge
Modificar `frontend/src/components/tracker/RecentEntries.tsx`:

```tsx
// Añadir badge de approval status
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
  entry.approval_status === 'approved'
    ? 'bg-green-100 text-green-800'
    : entry.approval_status === 'rejected'
    ? 'bg-red-100 text-red-800'
    : 'bg-gray-100 text-gray-600'
}`}>
  {entry.approval_status === 'approved' && '✅ Approved'}
  {entry.approval_status === 'rejected' && '❌ Rejected'}
  {entry.approval_status === 'pending' && '⏳ Pending'}
</span>

// Mostrar comentarios si existen
{entry.bc_comments && (
  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
    <strong>BC Comments:</strong> {entry.bc_comments}
  </div>
)}
```

#### Botón de Refresh
Añadir en Dashboard o junto al Sync Button:

```tsx
<button
  onClick={handleRefreshStatus}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  🔄 Refresh Status
</button>
```

### 3. Translations
Añadir en archivos de traducción:

```json
// frontend/public/locales/en/tracker.json
{
  "approval_status": {
    "pending": "Pending Review",
    "approved": "Approved",
    "rejected": "Rejected"
  },
  "actions": {
    "refresh_status": "Refresh Status from BC"
  }
}

// frontend/public/locales/es/tracker.json
{
  "approval_status": {
    "pending": "Pendiente de Revisión",
    "approved": "Aprobado",
    "rejected": "Rechazado"
  },
  "actions": {
    "refresh_status": "Actualizar Estado desde BC"
  }
}
```

## 🔮 Fase 2: Job Ledger Entries (Futuro)

Cuando los Journal Lines se postean y van a Job Ledger Entry:

1. **Detectar que se posteó**:
   - El `bc_journal_id` ya no existe en jobJournalLines
   - Buscar en jobLedgerEntries por campos coincidentes

2. **Actualizar tracking**:
   ```sql
   UPDATE time_entries
   SET bc_ledger_id = 'xxx',
       is_editable = false
   WHERE bc_journal_id = 'yyy'
   ```

3. **Consultar estado en Ledger**:
   - Similar a jobJournalLines pero en jobLedgerEntries
   - Los ledger entries son inmutables

## 🐛 Troubleshooting

### Error: "approvalStatus not found in BC response"
- Verificar que el campo existe en la API Page de BC
- Verificar capitalización: `approvalStatus` vs `approval_status`
- Añadir logging en bc-api.ts para ver la respuesta real

### Error: "No entries updated"
- Normal si no hay cambios en BC
- Verificar que las entries tienen `bc_journal_id` poblado
- Verificar filtros de usuario

### Performance con muchas entries
- El endpoint usa batch query (1 sola llamada a BC para múltiples IDs)
- Si aún es lento, considerar:
  - Limitar a entries de última semana
  - Paginar la consulta
  - Cachear resultados por 1-2 minutos

## 📚 Referencias

- BC API Docs: OData queries con `$filter`
- Supabase RLS: Considerar políticas para approval_status
- React Query: Para cachear y refrescar automáticamente

## ✅ Checklist de Implementación

- [x] Migración SQL creada
- [x] Métodos BC API implementados
- [x] Endpoint refresh-status creado
- [x] Types actualizados
- [ ] Ejecutar migración en Supabase
- [ ] Verificar campos en BC API Page
- [ ] Implementar servicio frontend
- [ ] Implementar UI badges
- [ ] Implementar botón refresh
- [ ] Añadir traducciones
- [ ] Probar flujo completo
- [ ] Documentar para usuarios finales

## 🎯 Siguientes Pasos Inmediatos

1. **Ejecutar migración SQL en Supabase**
2. **Verificar que BC tiene los campos approvalStatus y comments**
3. **Implementar UI para mostrar badges**
4. **Añadir botón de refresh manual**
5. **Probar flujo end-to-end**
