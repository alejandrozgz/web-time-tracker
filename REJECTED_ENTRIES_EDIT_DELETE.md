# Edición y Eliminación de Entradas Rechazadas

## Resumen

Las entradas de tiempo que han sido sincronizadas con Business Central y rechazadas pueden ahora ser editadas o eliminadas. Los cambios se sincronizan automáticamente con BC.

## Funcionalidad

### ✅ Entradas que se pueden editar/eliminar:
1. **No sincronizadas** (`bc_sync_status = 'not_synced'`)
2. **Con error** (`bc_sync_status = 'error'`)
3. **Sincronizadas pero rechazadas** (`bc_sync_status = 'synced' AND approval_status = 'rejected'`) ← **NUEVO**

### ❌ Entradas que NO se pueden editar/eliminar:
- Sincronizadas y aprobadas (`approval_status = 'approved'`)
- Sincronizadas y pendientes (`approval_status = 'pending'`)

## Flujo de Trabajo

### Editar Entrada Rechazada

1. Usuario hace clic en **Editar** en una entrada rechazada
2. Modifica los campos (descripción, horas, tiempo)
3. Guarda los cambios
4. **Backend automáticamente:**
   - Actualiza el Job Journal Line en BC con los nuevos datos
   - Resetea `approval_status` a `'pending'`
   - Limpia `bc_comments`
   - Mantiene `bc_sync_status = 'synced'` y `bc_journal_id`
5. La entrada vuelve al estado "Pendiente de Revisión" en BC

### Eliminar Entrada Rechazada

1. Usuario hace clic en **Eliminar** en una entrada rechazada
2. Confirma la eliminación
3. **Backend automáticamente:**
   - Elimina el Job Journal Line de BC
   - Elimina la entrada de la base de datos local
4. La entrada desaparece completamente de ambos sistemas

## Implementación Técnica

### Frontend: `RecentEntries.tsx`

```typescript
const canEditEntry = (entry: TimeEntry) => {
  if (entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error') {
    return true;
  }
  if (entry.bc_sync_status === 'synced' && entry.approval_status === 'rejected') {
    return true; // ← Permite editar rechazadas
  }
  return false;
};

const canDeleteEntry = (entry: TimeEntry) => {
  if (entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error') {
    return true;
  }
  if (entry.bc_sync_status === 'synced' && entry.approval_status === 'rejected') {
    return true; // ← Permite eliminar rechazadas
  }
  return false;
};
```

### Backend: `time-entries/route.ts`

#### PATCH Handler (Editar)

```typescript
// Si la entrada está sincronizada y rechazada, actualizar BC
if (existingEntry.bc_sync_status === 'synced' &&
    existingEntry.approval_status === 'rejected' &&
    existingEntry.bc_journal_id) {

  const bcApi = new BusinessCentralClient(tenant, company);

  // Preparar datos para BC
  const bcUpdateData: any = {
    id: existingEntry.bc_journal_id
  };

  if (filteredData.hours !== undefined) {
    bcUpdateData.quantity = filteredData.hours;
  }
  if (filteredData.description !== undefined) {
    bcUpdateData.description = filteredData.description;
  }
  if (filteredData.bc_job_id !== undefined) {
    bcUpdateData.jobNo = filteredData.bc_job_id;
  }
  if (filteredData.bc_task_id !== undefined) {
    bcUpdateData.jobTaskNo = filteredData.bc_task_id;
  }

  // Actualizar en BC
  await bcApi.updateJobJournalLine(bcUpdateData);

  // Resetear estado de aprobación
  filteredData.approval_status = 'pending';
  filteredData.bc_comments = null;
}
```

#### DELETE Handler (Eliminar)

```typescript
// Si la entrada está sincronizada y rechazada, eliminar de BC
if (existingEntry.bc_sync_status === 'synced' &&
    existingEntry.approval_status === 'rejected' &&
    existingEntry.bc_journal_id) {

  const bcApi = new BusinessCentralClient(tenant, company);

  // Eliminar de BC
  await bcApi.deleteJobJournalLine(existingEntry.bc_journal_id);

  logger.info('BC Job Journal Line deleted successfully', {
    entryId,
    journalId: existingEntry.bc_journal_id
  });
}

// Eliminar de la base de datos local
await supabaseAdmin
  .from('time_entries')
  .delete()
  .eq('id', entryId);
```

### BC API: `bc-api.ts`

#### Actualizar Job Journal Line

```typescript
async updateJobJournalLine(journalLine: any): Promise<any> {
  try {
    const { id, ...updateData } = journalLine;
    const endpoint = `/companies(${this.companyId})/jobJournalLines(${id})`;
    const data = await this.callBCApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    return data;
  } catch (error) {
    console.error('BC Update Job Journal Line error:', error);
    throw error;
  }
}
```

#### Eliminar Job Journal Line

```typescript
async deleteJobJournalLine(journalId: string): Promise<void> {
  try {
    const endpoint = `/companies(${this.companyId})/jobJournalLines(${journalId})`;
    await this.callBCApi(endpoint, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('BC Delete Job Journal Line error:', error);
    throw error;
  }
}
```

## Experiencia de Usuario

### Vista de Entrada Rechazada

```
┌─────────────────────────────────────────────────────────┐
│ Trabajo de instalación eléctrica                       │
│ Proyecto X • Tarea Y                                    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✕ Rechazado                                         │ │
│ │ Nota de BC: Las horas exceden el presupuesto       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 09:00 - 17:00 (8.00h)          Sincronizado  ✏️ 🗑️   │
└─────────────────────────────────────────────────────────┘
```

- **✏️ Botón de editar**: Ahora habilitado para entradas rechazadas
- **🗑️ Botón de eliminar**: Ahora habilitado para entradas rechazadas

### Después de Editar

```
┌─────────────────────────────────────────────────────────┐
│ Trabajo de instalación eléctrica (corregido)           │
│ Proyecto X • Tarea Y                                    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ Pendiente de Revisión                             │ │
│ │ • Esperando aprobación en BC                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 09:00 - 15:00 (6.00h)          Sincronizado  ✏️ 🗑️   │
└─────────────────────────────────────────────────────────┘
```

- Estado cambia a **"Pendiente de Revisión"**
- Comentarios de BC desaparecen
- La entrada sigue sincronizada (mismo `bc_journal_id`)

## Manejo de Errores

### Error al Actualizar/Eliminar en BC

Si falla la operación en BC, el sistema:
1. **Registra el error en los logs**
2. **NO falla la operación completa**
3. **Continúa con la actualización/eliminación local**

Esto evita que problemas de conectividad con BC impidan al usuario corregir entradas.

## Requisitos de Business Central

Para que esta funcionalidad funcione correctamente, Business Central debe:

1. **Permitir PATCH en Job Journal Lines**
   - Endpoint: `/jobJournalLines(systemId)`
   - Campos editables: `description`, `quantity`, `jobNo`, `jobTaskNo`

2. **Permitir DELETE en Job Journal Lines**
   - Endpoint: `/jobJournalLines(systemId)`
   - Solo debe permitir eliminar líneas que aún no han sido registradas (posted)

3. **Resetear approval_status al editar**
   - Cuando una línea es modificada, el `approvalStatus` debe volver a `'pending'`
   - Los `comments` deben limpiarse o mantenerse según la lógica de negocio

## Logging

Todas las operaciones se registran en los logs:

```
✅ Edición exitosa:
INFO: Entry is rejected, updating BC Job Journal Line
INFO: BC Job Journal Line updated successfully
INFO: Time entry updated successfully

✅ Eliminación exitosa:
INFO: Entry is rejected, deleting from BC Job Journal Line
INFO: BC Job Journal Line deleted successfully
INFO: Time entry deleted successfully

❌ Error en BC (no falla la operación):
ERROR: Failed to update BC Job Journal Line
INFO: Time entry updated successfully (local only)
```

## Testing

### Escenario 1: Editar Entrada Rechazada

1. Crear entrada y sincronizar con BC
2. En BC, rechazar la entrada con un comentario
3. Refrescar el Time Tracker
4. Verificar que la entrada muestra estado "Rechazado" con comentario
5. Hacer clic en Editar
6. Modificar la descripción o las horas
7. Guardar
8. **Verificar en BC:** La línea debe estar actualizada con `approvalStatus = 'pending'`
9. **Verificar en UI:** La entrada debe mostrar "Pendiente de Revisión"

### Escenario 2: Eliminar Entrada Rechazada

1. Crear entrada y sincronizar con BC
2. En BC, rechazar la entrada
3. Refrescar el Time Tracker
4. Hacer clic en Eliminar
5. Confirmar eliminación
6. **Verificar en BC:** La línea del Job Journal debe haber desaparecido
7. **Verificar en UI:** La entrada debe haber desaparecido de la lista

### Escenario 3: No Permitir Editar Entrada Aprobada

1. Crear entrada y sincronizar con BC
2. En BC, aprobar la entrada
3. Refrescar el Time Tracker
4. **Verificar:** Los botones de editar y eliminar deben estar deshabilitados
5. Al hacer hover, debe mostrar "Cannot edit (already synced)"

## Notas Importantes

1. **Solo Job Journal Lines**: Esta funcionalidad solo aplica a líneas que aún están en el Job Journal. Una vez registradas (posted) a Job Ledger Entries, no se pueden modificar.

2. **Approval Status**: Después de editar, la entrada vuelve automáticamente a `'pending'`. El usuario en BC deberá revisar y aprobar/rechazar nuevamente.

3. **BC Journal ID**: El `bc_journal_id` se mantiene durante la edición, asegurando que se actualice la línea correcta en BC.

4. **Eliminación**: Es una operación irreversible. La entrada desaparece tanto de Time Tracker como de BC.

## Próximos Pasos (Futuro)

En la **Fase 2**, cuando las entradas se registren en Job Ledger Entries:
- Las entradas registradas tendrán `bc_ledger_id`
- El campo `is_editable` se establecerá en `false`
- No se podrán editar ni eliminar, independientemente del approval status
- Se necesitará un proceso de reversión en BC para corregir errores
