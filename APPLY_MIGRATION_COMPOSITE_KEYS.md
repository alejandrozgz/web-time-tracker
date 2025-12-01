# Migración: Agregar Campos de Claves Compuestas para BC

## Problema Identificado

Business Central requiere **claves compuestas** para actualizar y eliminar Job Journal Lines:
- `journalTemplateName` (ej: "PROJECT")
- `journalBatchName` (ej: "TT-ELY-WEB")
- `lineNo` (número de línea)

Anteriormente solo guardábamos el `systemId` (`bc_journal_id`), lo cual NO es suficiente para operaciones PATCH/DELETE en BC.

## Error Original

```
BC API Error: 404 - {
  "error": {
    "code": "BadRequest_NotFound",
    "message": "The number of keys specified in the URI does not match number of key properties for the resource 'Microsoft.NAV.jobJournalLine'."
  }
}
```

## Solución

Agregar dos nuevos campos a la tabla `time_entries`:
1. `bc_journal_template_name` - Nombre del template (usualmente "PROJECT")
2. `bc_journal_line_no` - Número de línea en BC

El campo `bc_batch_name` ya existe y es parte de la clave compuesta.

## Migración SQL

Ejecutar en Supabase:

```sql
-- Add composite key fields for BC Job Journal Lines
ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS bc_journal_template_name VARCHAR(50);

ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS bc_journal_line_no INTEGER;

-- Add comments
COMMENT ON COLUMN time_entries.bc_journal_template_name IS 'BC Journal Template Name (e.g., PROJECT) - part of composite key';
COMMENT ON COLUMN time_entries.bc_journal_line_no IS 'BC Journal Line Number - part of composite key';
```

## Pasos para Aplicar

### 1. Ejecutar la migración en Supabase

Ve al SQL Editor en Supabase y ejecuta:

```sql
-- backend/migrations/add_bc_journal_composite_keys.sql
ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS bc_journal_template_name VARCHAR(50);

ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS bc_journal_line_no INTEGER;

COMMENT ON COLUMN time_entries.bc_journal_template_name IS 'BC Journal Template Name (e.g., PROJECT) - part of composite key';
COMMENT ON COLUMN time_entries.bc_journal_line_no IS 'BC Journal Line Number - part of composite key';
```

### 2. Verificar que los campos se crearon

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
  AND column_name IN ('bc_journal_template_name', 'bc_journal_line_no')
ORDER BY column_name;
```

Deberías ver:
```
bc_journal_line_no         | integer          | YES
bc_journal_template_name   | character varying| YES
```

### 3. Reiniciar el backend

El backend ya está actualizado para:
- **Guardar** estos campos al sincronizar con BC
- **Usar** estos campos al actualizar/eliminar entradas rechazadas

```bash
# Si está corriendo, reinicia el backend
npm run dev
```

### 4. Sincronizar entradas existentes (Opcional)

Si tienes entradas ya sincronizadas que quieres poder editar/eliminar, necesitas poblar estos campos.

**Opción A: Re-sincronizar desde Time Tracker**
- Las entradas se volverán a sincronizar y guardarán los campos correctamente

**Opción B: Actualizar manualmente (no recomendado)**
- Solo si tienes entradas críticas que NO puedes re-sincronizar
- Necesitarías obtener el `lineNo` desde BC y actualizarlo manualmente

**Opción C: Dejar como está**
- Las entradas antiguas sin estos campos usarán fallback a `systemId`
- Nuevas entradas tendrán las claves compuestas

## Cambios en el Código

### 1. BC API (`bc-api.ts`)

```typescript
async updateJobJournalLine(journalLine: any): Promise<any> {
  const { id, journalTemplateName, journalBatchName, lineNo, ...updateData } = journalLine;

  // Usar claves compuestas si están disponibles
  let endpoint;
  if (journalTemplateName && journalBatchName && lineNo) {
    endpoint = `/companies(${this.companyId})/jobJournalLines(journalTemplateName='${journalTemplateName}',journalBatchName='${journalBatchName}',lineNo=${lineNo})`;
  } else {
    // Fallback a systemId
    endpoint = `/companies(${this.companyId})/jobJournalLines(${id})`;
  }

  return await this.callBCApi(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

async deleteJobJournalLine(journalId: string, compositeKeys?: {
  journalTemplateName: string;
  journalBatchName: string;
  lineNo: number
}): Promise<void> {
  let endpoint;
  if (compositeKeys) {
    endpoint = `/companies(${this.companyId})/jobJournalLines(journalTemplateName='${compositeKeys.journalTemplateName}',journalBatchName='${compositeKeys.journalBatchName}',lineNo=${compositeKeys.lineNo})`;
  } else {
    endpoint = `/companies(${this.companyId})/jobJournalLines(${journalId})`;
  }

  await this.callBCApi(endpoint, { method: 'DELETE' });
}
```

### 2. Sync to BC (`sync/to-bc/route.ts`)

Ahora guarda los campos al sincronizar:

```typescript
await supabaseAdmin
  .from('time_entries')
  .update({
    bc_sync_status: 'synced',
    bc_journal_id: bcJournalLine.id,
    bc_batch_name: batchName,
    bc_journal_template_name: bcJournalLine.journalTemplateName || 'PROJECT',  // ← NUEVO
    bc_journal_line_no: bcJournalLine.lineNo,                                   // ← NUEVO
    bc_last_sync_at: new Date().toISOString(),
    is_editable: true
  })
  .eq('id', entry.id);
```

### 3. Time Entries Endpoints (`time-entries/route.ts`)

**PATCH (Update):**
```typescript
const bcUpdateData: any = {
  id: existingEntry.bc_journal_id,
  journalTemplateName: existingEntry.bc_journal_template_name || 'PROJECT',  // ← Clave compuesta
  journalBatchName: existingEntry.bc_batch_name,                             // ← Clave compuesta
  lineNo: existingEntry.bc_journal_line_no                                   // ← Clave compuesta
};

await bcApi.updateJobJournalLine(bcUpdateData);
```

**DELETE:**
```typescript
const compositeKeys = existingEntry.bc_journal_line_no ? {
  journalTemplateName: existingEntry.bc_journal_template_name || 'PROJECT',
  journalBatchName: existingEntry.bc_batch_name,
  lineNo: existingEntry.bc_journal_line_no
} : undefined;

await bcApi.deleteJobJournalLine(existingEntry.bc_journal_id, compositeKeys);
```

## Verificación

### 1. Crear y sincronizar una entrada nueva

1. Crear entrada en Time Tracker
2. Sincronizar con BC
3. Verificar en la base de datos:

```sql
SELECT
  id,
  description,
  bc_journal_id,
  bc_journal_template_name,
  bc_batch_name,
  bc_journal_line_no,
  approval_status
FROM time_entries
WHERE bc_sync_status = 'synced'
ORDER BY created_at DESC
LIMIT 5;
```

Deberías ver valores en `bc_journal_template_name` (ej: "PROJECT") y `bc_journal_line_no` (ej: 10000).

### 2. Rechazar la entrada en BC

1. Ir a BC → Job Journal Lines
2. Rechazar la entrada con un comentario
3. Refrescar en Time Tracker
4. Verificar que muestra estado "Rechazado"

### 3. Editar la entrada rechazada

1. Hacer clic en Editar
2. Modificar la descripción
3. Guardar
4. **Verificar en BC:** La línea debe estar actualizada
5. **Verificar estado:** Debe cambiar a "Pending"

### 4. Verificar logs del backend

```bash
# Deberías ver algo como:
[INFO] Entry is rejected, updating BC Job Journal Line
[DEBUG] BC API CALL to: .../jobJournalLines(journalTemplateName='PROJECT',journalBatchName='TT-ELY-WEB',lineNo=10000)
[INFO] BC Job Journal Line updated successfully
```

## Notas Importantes

1. **Backward Compatibility**: El código tiene fallback a `systemId` para entradas antiguas sin las claves compuestas.

2. **Template Name**: Por defecto usa "PROJECT", pero se guarda el valor real de BC por si alguna empresa usa otro template.

3. **Line Number**: El `lineNo` es único dentro del batch y se incrementa automáticamente en BC.

4. **Entradas Registradas (Posted)**: Una vez que las entradas se registran en Job Ledger Entries, estos campos ya no son necesarios porque las entradas se vuelven inmutables.

## Troubleshooting

### Error: "column does not exist"

Si ves este error al sincronizar:
```
ERROR: column "bc_journal_template_name" of relation "time_entries" does not exist
```

**Solución:** Ejecuta la migración SQL en Supabase.

### Error: "The number of keys specified in the URI does not match"

Si ves este error al editar/eliminar:
```
BC API Error: 404 - BadRequest_NotFound
```

**Causa:** La entrada fue sincronizada antes de la migración y no tiene las claves compuestas.

**Solución:** Re-sincroniza la entrada desde Time Tracker.

### Editar no actualiza en BC

**Verificar:**
1. Los campos están poblados en la base de datos
2. El backend está reiniciado con el código actualizado
3. Los logs del backend muestran la llamada a BC

**Debug:**
```sql
-- Ver campos de una entrada específica
SELECT
  bc_journal_id,
  bc_journal_template_name,
  bc_batch_name,
  bc_journal_line_no
FROM time_entries
WHERE id = 'xxx-xxx-xxx-xxx';
```

Si alguno es NULL, la entrada necesita re-sincronizarse.
