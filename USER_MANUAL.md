# Manual de Usuario - Time Tracker ATP Dynamics Solutions

## Índice

1. [Introducción](#introducción)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Interfaz Principal](#interfaz-principal)
4. [Registro de Tiempo](#registro-de-tiempo)
5. [Entradas Recientes](#entradas-recientes)
6. [Hoja de Tiempo Semanal](#hoja-de-tiempo-semanal)
7. [Estados de Aprobación](#estados-de-aprobación)
8. [Sincronización con Business Central](#sincronización-con-business-central)
9. [Configuración de Idioma](#configuración-de-idioma)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El **Time Tracker** es una aplicación web diseñada para registrar y gestionar el tiempo de trabajo de los empleados, integrada con Microsoft Dynamics 365 Business Central. Permite a los usuarios registrar sus horas de trabajo, asignarlas a proyectos y tareas específicas, y sincronizar esta información con Business Central para su aprobación y procesamiento.

### Características Principales

- ✅ Registro de tiempo mediante **Timer** o **Entrada Manual**
- ✅ Visualización de entradas recientes con **colapso/expansión por día**
- ✅ Hoja de tiempo semanal con vista de todas las tareas
- ✅ **Estados de aprobación** visuales (Pendiente, Aprobado, Rechazado)
- ✅ Sincronización automática con Business Central
- ✅ Interfaz **completamente responsive** (móvil y escritorio)
- ✅ Soporte **multiidioma** (Español e Inglés)

---

## Inicio de Sesión

### Acceso a la Aplicación

1. Accede a la URL proporcionada por tu organización: `https://time-tracker.atpdynamicssolutions.com/{tenant-slug}`
2. Verás la pantalla de inicio de sesión con tres campos:

### Campos de Inicio de Sesión

| Campo | Descripción |
|-------|-------------|
| **Company** | Selecciona tu compañía de la lista desplegable |
| **Username** | Tu nombre de usuario de Business Central |
| **Password** | Tu contraseña de Business Central |

### Proceso de Inicio de Sesión

1. **Selecciona tu compañía** del menú desplegable
2. **Ingresa tu nombre de usuario** (Resource No. de BC)
3. **Ingresa tu contraseña**
4. Haz clic en el botón **"Iniciar Sesión"**

> **💡 Nota**: El selector de idioma está disponible en la esquina superior derecha de la pantalla de inicio de sesión.

### Pantalla de Inicio de Sesión - Vista Responsive

**Desktop:**
```
┌─────────────────────────────────────────┐
│              [Language]                  │
│                                          │
│              [Clock Icon]                │
│          Time Tracker                    │
│    Microsoft Dynamics 365 BC             │
│                                          │
│  Company: [Select Company ▼]            │
│  Username: [________________]            │
│  Password: [________________]            │
│                                          │
│         [Iniciar Sesión]                 │
└─────────────────────────────────────────┘
```

**Mobile:**
- Todos los elementos se adaptan a pantallas pequeñas
- Texto e iconos más compactos
- Formulario optimizado para táctil

---

## Interfaz Principal

### Header (Cabecera)

La cabecera contiene información importante y acciones rápidas:

**Desktop:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Clock] Time Tracker     [Company Info]   [ES ▼] [User] [Logout] │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────────────────────────┐
│ [Clock] Time Tracker            [Logout]     │
│ Company • User                    [ES ▼]     │
└──────────────────────────────────────────────┘
```

#### Elementos del Header

| Elemento | Descripción |
|----------|-------------|
| **Logo y Título** | Identificación de la aplicación |
| **Company Info** | Nombre de la compañía actual (solo desktop) |
| **Selector de Idioma** | Cambiar entre Español e Inglés |
| **Usuario** | Nombre y Resource No. (solo desktop) |
| **Logout** | Cerrar sesión |

### Dashboard Principal

El dashboard tiene dos pestañas principales:

```
┌────────────────────────────────────────────────────────┐
│  Company Name                          [Sincronizar]   │
│  User • X proyectos • Y tareas                         │
│                                                         │
│  [⏱️ Time Tracker]  [📅 Week]                          │
│────────────────────────────────────────────────────────│
│                                                         │
│  [Contenido según la pestaña seleccionada]            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

#### Pestañas Disponibles

1. **⏱️ Time Tracker**: Registro de tiempo y entradas recientes
2. **📅 Week**: Hoja de tiempo semanal

### Botón de Sincronización

El botón de sincronización en la esquina superior derecha permite:
- **Sincronizar manualmente** con Business Central
- Ver el **estado de la última sincronización**
- **Actualizar** la información de aprobaciones

Estados del botón:
- ⏱️ **"Sincronizar"**: Listo para sincronizar
- 🔄 **"Sincronizando..."**: En proceso (con animación)
- ✅ **"Sincronizado hace X min"**: Última sincronización

---

## Registro de Tiempo

### Modos de Registro

El sistema ofrece dos modos para registrar tiempo:

```
┌────────────────────────────────────────────┐
│  [Timer] [Manual]  ← Cambiar modo         │
└────────────────────────────────────────────┘
```

> **💡 Por defecto**: El modo **Manual** está seleccionado al iniciar.

---

### Modo 1: Timer (Cronómetro)

Ideal para registrar tiempo en tiempo real mientras trabajas.

#### Elementos del Timer

```
┌────────────────────────────────────────────────────────┐
│  ¿En qué estás trabajando? *                           │
│  [________________________________________]             │
│                                                         │
│  [Seleccionar tarea...] ▼                              │
│                                                         │
│  00:00:00  ← Contador de tiempo                        │
│  [▶️ Iniciar]                                          │
└────────────────────────────────────────────────────────┘
```

#### Cómo Usar el Timer

1. **Describe tu trabajo** en el campo de descripción (obligatorio)
2. **Selecciona un proyecto y tarea** del menú desplegable
3. Haz clic en **"Iniciar"** para comenzar a contar
4. El timer mostrará el tiempo transcurrido en formato HH:MM:SS
5. Puedes **"Pausar"** el timer cuando necesites
6. Haz clic en **"Parar"** para finalizar y guardar

#### Estados del Timer

| Estado | Botón | Acción |
|--------|-------|--------|
| **Detenido** | ▶️ Iniciar | Comienza a contar |
| **En ejecución** | ⏸️ Pausar | Pausa el conteo |
| **Pausado** | ▶️ Reanudar | Continúa contando |
| **En ejecución/Pausado** | ⏹️ Parar | Guarda la entrada |

> **⚠️ Importante**: Debes completar la descripción y seleccionar una tarea antes de poder iniciar el timer.

---

### Modo 2: Manual

Ideal para registrar tiempo de forma retrospectiva.

#### Formulario de Entrada Manual

```
┌────────────────────────────────────────────────────────┐
│  ¿En qué estás trabajando? *                           │
│  [________________________________________]             │
│                                                         │
│  [Seleccionar tarea...] ▼                              │
│                                                         │
│  Fecha:        [2024-01-15] 📅                         │
│  Hora inicio:  [09:00]                                 │
│  Hora fin:     [17:00]                                 │
│                                                         │
│  Tiempo calculado: 8.00h                               │
│                                                         │
│  [Agregar tiempo manual]                               │
└────────────────────────────────────────────────────────┘
```

#### Cómo Registrar Tiempo Manualmente

1. **Describe tu trabajo** en el campo de descripción (obligatorio)
2. **Selecciona un proyecto y tarea** del menú desplegable
3. **Selecciona la fecha** del trabajo
4. **Ingresa la hora de inicio** (formato 24h: HH:MM)
5. **Ingresa la hora de fin** (formato 24h: HH:MM)
6. El sistema calculará automáticamente las horas totales
7. Haz clic en **"Agregar tiempo manual"**

#### Validaciones del Modo Manual

- ⚠️ La hora de fin debe ser posterior a la hora de inicio
- ⚠️ El tiempo mínimo es de 36 segundos
- ⚠️ Una entrada no puede exceder 24 horas
- ⚠️ La descripción es obligatoria
- ⚠️ Debes seleccionar una tarea

---

### Selector de Tareas

El selector de tareas muestra todos los proyectos y tareas disponibles:

```
┌─────────────────────────────────────────────────┐
│  Seleccionar tarea                              │
├─────────────────────────────────────────────────┤
│  📁 PROYECTO A - Nombre del Proyecto            │
│     • Tarea 1 - Descripción                     │
│     • Tarea 2 - Descripción                     │
│                                                  │
│  📁 PROYECTO B - Nombre del Proyecto            │
│     • Tarea 3 - Descripción                     │
│     • Tarea 4 - Descripción                     │
└─────────────────────────────────────────────────┘
```

#### Características

- **Búsqueda visual** por proyecto
- **Agrupación** de tareas por proyecto
- **Click para seleccionar**
- **Cierre automático** al seleccionar
- **Responsive**: Se adapta a pantallas pequeñas

---

## Entradas Recientes

La sección de **Entradas Recientes** muestra todas tus registros de tiempo ordenados por fecha.

### Vista General

```
┌────────────────────────────────────────────────────────────┐
│  Entradas recientes                                        │
│  Estado de aprobación: • Pendiente • Aprobado • Rechazado │
├────────────────────────────────────────────────────────────┤
│  ▼ LUNES, 15 DE ENERO                           8.00h     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ║ Desarrollo de funcionalidad X                      │ │
│  │ ║ Proyecto A • Tarea 1                               │ │
│  │ ║ 09:00 - 17:00 (8.00h)  • [Sincronizado] [✏️][🗑️] │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ▶ VIERNES, 12 DE ENERO                         6.50h     │
│  (colapsado)                                               │
└────────────────────────────────────────────────────────────┘
```

### Características Principales

#### 1. **Colapso/Expansión por Día** 🆕

- **Click en el header del día** para colapsar/expandir
- **Icono indicador**: ▼ (expandido) / ▶ (colapsado)
- **Totales visibles** incluso cuando está colapsado
- **Estado independiente** para cada día

#### 2. **Leyenda de Estados de Aprobación**

En la parte superior se muestra una leyenda con los colores:

```
Estado de aprobación: • Pendiente • Aprobado • Rechazado
                      🟡 Amarillo  🟢 Verde    🔴 Rojo
```

#### 3. **Indicadores Visuales por Entrada**

Cada entrada tiene múltiples indicadores:

**Borde Izquierdo Coloreado:**
- **🟡 Amarillo grueso (4px)**: Pendiente de aprobación
- **🟢 Verde grueso (4px)**: Aprobado
- **🔴 Rojo grueso (4px)**: Rechazado

**Punto de Estado:**
- **• Punto pequeño** junto a la entrada (mismo color que el borde)

**Hover Effect:**
- **Fondo sutil** del color correspondiente al pasar el mouse

---

### Vista Desktop vs Mobile

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ║ Descripción del trabajo              | 09:00-17:00 (8h) | • | │
│ ║ Proyecto • Tarea                     | [Sincronizado] [✏️][🗑️] │
└──────────────────────────────────────────────────────────────────┘
```

**Características Desktop:**
- Layout horizontal compacto
- Toda la información en una línea
- Descripción con truncamiento (...)

#### Mobile Layout 🆕

```
┌────────────────────────────────────────┐
│ ║ Descripción del trabajo       [✏️][🗑️]│
│ ║ Proyecto • Tarea                     │
│ ║ 09:00 - 17:00 (8.00h)  • [Badge]    │
└────────────────────────────────────────┘
```

**Características Mobile:**
- Layout vertical en 2 filas
- **Fila superior**: Descripción completa + botones de acción
- **Fila inferior**: Horario + estado de sincronización
- Sin truncamiento de texto
- Optimizado para táctil

---

### Estados de Sincronización

Cada entrada muestra su estado de sincronización con Business Central:

| Badge | Color | Significado |
|-------|-------|-------------|
| **No Sincronizado** | 🟠 Naranja | No se ha enviado a BC |
| **Sincronizado** | 🔵 Azul | Enviado exitosamente a BC |
| **Error** | 🔴 Rojo | Falló la sincronización |

---

### Acciones Disponibles

#### Botón Editar ✏️

**Disponible cuando:**
- La entrada NO está sincronizada
- La entrada está sincronizada pero fue **RECHAZADA**

**No disponible cuando:**
- La entrada está sincronizada y **APROBADA**
- La entrada está sincronizada y **PENDIENTE**

**Cómo editar:**
1. Click en el icono de lápiz ✏️
2. La entrada se convierte en un formulario editable
3. Modifica descripción, tarea, horas de inicio/fin
4. Click en **✓ Guardar** o **✕ Cancelar**

```
┌──────────────────────────────────────────────────────────┐
│ [Descripción_______________] [Tarea ▼] 09:00 - 17:00    │
│                                              [✓] [✕]      │
└──────────────────────────────────────────────────────────┘
```

#### Botón Eliminar 🗑️

**Disponible cuando:**
- La entrada NO está sincronizada
- La entrada está sincronizada pero fue **RECHAZADA**

**No disponible cuando:**
- La entrada está sincronizada y **APROBADA**
- La entrada está sincronizada y **PENDIENTE**

**Cómo eliminar:**
1. Click en el icono de papelera 🗑️
2. Confirma la eliminación en el diálogo
3. La entrada se elimina permanentemente

> **⚠️ Advertencia**: Esta acción no se puede deshacer.

---

### Entradas Rechazadas

Cuando una entrada es **RECHAZADA** en Business Central:

```
┌─────────────────────────────────────────────────────────┐
│ ║ Descripción del trabajo                         [✏️][🗑️]│
│ ║ Proyecto • Tarea                                      │
│ ║ 09:00 - 17:00 (8.00h)  • [Sincronizado]              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ ⚠️ Motivo del rechazo: El tiempo reportado no     │  │
│ │ coincide con el registro del proyecto             │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Características:**
- **Borde rojo** en la entrada
- **Mensaje del rechazo** visible debajo
- **Puedes editar** la entrada para corregir
- **Puedes eliminar** si ya no es necesaria

---

### Paginación (Load More)

Cuando hay más de 20 entradas:

```
┌────────────────────────────────┐
│    [Cargar más entradas]       │
└────────────────────────────────┘
```

- Carga 20 entradas adicionales
- Se agregan al final de la lista
- Mantiene el estado de colapso de días anteriores

---

## Hoja de Tiempo Semanal

La pestaña **Week** muestra una vista consolidada de todas tus horas por proyecto y tarea.

### Vista General

```
┌────────────────────────────────────────────────────────────────┐
│  Weekly Timesheet                                              │
│  [◀] Enero 8 - Enero 14, 2024 [▶]  [📅 Esta Semana]          │
├────────────────────────────────────────────────────────────────┤
│  Proyecto/Tarea    │ L │ M │ X │ J │ V │ S │ D │ Total       │
├────────────────────────────────────────────────────────────────┤
│  📁 PROYECTO A                                                 │
│    Tarea 1         │ 8 │ - │ 7 │ 8 │ 6 │ - │ - │ 29.0h       │
│    Tarea 2         │ - │ 8 │ 1 │ - │ 2 │ - │ - │ 11.0h       │
├────────────────────────────────────────────────────────────────┤
│  Daily Totals      │ 8 │ 8 │ 8 │ 8 │ 8 │ 0 │ 0 │ 40.0h       │
└────────────────────────────────────────────────────────────────┘
```

### Características Principales

#### 1. **Navegación Semanal**

```
[◀]  Enero 8 - Enero 14, 2024  [▶]  [📅 Esta Semana]
```

| Control | Función |
|---------|---------|
| **◀ Anterior** | Va a la semana anterior |
| **▶ Siguiente** | Va a la semana siguiente |
| **📅 Esta Semana** | Vuelve a la semana actual |

#### 2. **Organización por Proyectos**

- **Headers de proyecto** con icono 📁 y código de BC
- **Tareas agrupadas** bajo cada proyecto
- **Scroll horizontal** para semanas completas

#### 3. **Códigos de Color por Estado**

Cada celda de horas tiene un color según su estado de sincronización:

| Color | Estado |
|-------|--------|
| 🟠 **Naranja claro** | No sincronizado |
| 🔵 **Azul claro** | Sincronizado |
| 🔴 **Rojo claro** | Error de sincronización |
| ⚪ **Gris claro** | Sin horas registradas |

#### 4. **Día Actual Destacado**

- **Fondo azul claro** en la columna del día actual
- **Texto azul oscuro** para mejor visibilidad

#### 5. **Totales**

- **Fila inferior**: Totales diarios (suma de todas las tareas)
- **Columna derecha**: Total semanal por tarea
- **Esquina inferior derecha**: Total general de la semana

#### 6. **Indicador de Exceso**

```
Daily Totals  │ 8 │ 8 │ 10 │ 8 │ 8 │ 0 │ 0
              │   │   │ 🔴 │   │   │   │
```

- **Rojo**: Días con más de 8 horas (alerta)

---

### Vista Responsive 🆕

#### Desktop

- **Tabla completa** con todas las columnas visibles
- **Ancho mínimo** de columnas para mejor legibilidad
- **Padding generoso** para espaciado

#### Mobile

```
┌─────────────────────────────────────┐
│  Weekly Timesheet                   │
│  [◀]  Ene 8 - Ene 14  [▶]          │
│  [📅 Esta Semana]                   │
├─────────────────────────────────────┤
│  (Tabla con scroll horizontal)      │
│  ← deslizar para ver más →         │
└─────────────────────────────────────┘
```

**Optimizaciones Mobile:**
- **Texto más pequeño** (text-xs)
- **Padding reducido** para aprovechar espacio
- **Celdas más compactas** (w-12 en lugar de w-16)
- **Botones adaptados** en vertical si es necesario
- **Headers del día abreviados** (L, M, X, J, V, S, D)

---

## Estados de Aprobación

El sistema implementa un flujo completo de aprobación de tiempo con Business Central.

### Flujo de Aprobación

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Creado    │ ───▶ │  Pendiente   │ ───▶ │  Aprobado  │
│  (usuario)  │      │   (BC sync)  │      │    (BC)    │
└─────────────┘      └──────────────┘      └────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Rechazado   │
                     │    (BC)      │
                     └──────────────┘
```

### Estados Detallados

#### 1. **No Sincronizado** (🟠 Naranja)

**Descripción:**
- La entrada existe solo localmente
- No se ha enviado a Business Central
- Estado inicial al crear una entrada

**Acciones disponibles:**
- ✅ Editar
- ✅ Eliminar
- ⏸️ No tiene estado de aprobación aún

**Apariencia:**
```
┌────────────────────────────────────────┐
│   Descripción del trabajo              │
│   Proyecto • Tarea                     │
│   09:00 - 17:00 (8.00h) [No Sincronizado] │
└────────────────────────────────────────┘
```

---

#### 2. **Pendiente** (🟡 Amarillo)

**Descripción:**
- Entrada sincronizada con Business Central
- Esperando aprobación del supervisor
- No se puede editar ni eliminar

**Acciones disponibles:**
- ❌ No editar
- ❌ No eliminar
- ⏱️ Esperar aprobación

**Apariencia:**
```
┌────────────────────────────────────────┐
│ ║ Descripción del trabajo              │
│ ║ Proyecto • Tarea                     │
│ ║ 09:00 - 17:00 (8.00h) • [Sincronizado] │
└────────────────────────────────────────┘
    Borde amarillo (4px) + punto amarillo
```

---

#### 3. **Aprobado** (🟢 Verde)

**Descripción:**
- Entrada aprobada por el supervisor en BC
- Tiempo validado y procesado
- No se puede modificar

**Acciones disponibles:**
- ❌ No editar
- ❌ No eliminar
- ✅ Registro final

**Apariencia:**
```
┌────────────────────────────────────────┐
│ ║ Descripción del trabajo              │
│ ║ Proyecto • Tarea                     │
│ ║ 09:00 - 17:00 (8.00h) • [Sincronizado] │
└────────────────────────────────────────┘
    Borde verde (4px) + punto verde
```

---

#### 4. **Rechazado** (🔴 Rojo)

**Descripción:**
- Entrada rechazada por el supervisor en BC
- Incluye motivo del rechazo
- Se puede editar o eliminar para corregir

**Acciones disponibles:**
- ✅ Editar (para corregir)
- ✅ Eliminar
- 📝 Ver motivo del rechazo

**Apariencia:**
```
┌─────────────────────────────────────────┐
│ ║ Descripción del trabajo        [✏️][🗑️]│
│ ║ Proyecto • Tarea                      │
│ ║ 09:00 - 17:00 (8.00h) • [Sincronizado] │
│ ┌───────────────────────────────────┐  │
│ │ ⚠️ Motivo del rechazo: Las horas  │  │
│ │ no corresponden al proyecto       │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
    Borde rojo (4px) + punto rojo + mensaje
```

---

### Actualización de Estados

El sistema actualiza automáticamente los estados:

1. **Al iniciar sesión**: Carga estados actuales de BC
2. **Al sincronizar**: Envía nuevas entradas y actualiza estados
3. **Al cambiar de pestaña**: Refresca estados desde BC
4. **Cada 5 minutos**: Actualización automática en segundo plano

---

## Sincronización con Business Central

### Proceso de Sincronización

La sincronización es el proceso que conecta el Time Tracker con Business Central.

#### ¿Qué se Sincroniza?

1. **Nuevas entradas de tiempo**
   - Descripción
   - Fecha y horas
   - Proyecto y tarea asignados
   - Usuario (Resource No.)

2. **Estados de aprobación**
   - Pendiente → Aprobado
   - Pendiente → Rechazado
   - Motivos de rechazo

3. **Información de proyectos y tareas**
   - Nuevos proyectos disponibles
   - Nuevas tareas asignadas
   - Cambios en descripciones

---

### Sincronización Manual

#### Cómo Sincronizar

1. Haz click en el botón **"Sincronizar"** en la esquina superior derecha
2. Espera a que aparezca el mensaje **"Sincronizando..."**
3. El botón mostrará **"Sincronizado hace X min"** cuando termine

```
[Sincronizar] → [🔄 Sincronizando...] → [✓ Sincronizado hace 2 min]
```

#### Estados del Botón

| Estado | Icono | Descripción |
|--------|-------|-------------|
| **Listo** | ⏱️ | Puedes sincronizar ahora |
| **Sincronizando** | 🔄 (girando) | En proceso, espera... |
| **Completado** | ✅ | Sincronizado hace X minutos |
| **Error** | ❌ | Error en la sincronización |

---

### Sincronización Automática

El sistema sincroniza automáticamente:

- **Al crear una nueva entrada**: Se intenta sincronizar inmediatamente
- **Cada 15 minutos**: Sincronización en segundo plano
- **Al cambiar de pestaña**: Refresca información

> **💡 Recomendación**: Sincroniza manualmente al final de tu jornada para asegurar que todas tus horas se envíen a Business Central.

---

### Logs de Sincronización

Cada sincronización genera logs que puedes revisar:

```
┌────────────────────────────────────────────────────────┐
│  Última sincronización: 15/01/2024 14:30:25           │
│  ✅ 5 entradas sincronizadas                          │
│  ⚠️ 0 errores                                         │
│  📊 Estado actualizado para 12 entradas               │
└────────────────────────────────────────────────────────┘
```

**Acceso a logs** (solo administradores):
- Panel de administración → Sync Logs

---

### Resolución de Errores de Sincronización

#### Error: "No se pudo conectar con Business Central"

**Causas:**
- Credenciales incorrectas
- Servicio BC no disponible
- Problemas de red

**Solución:**
1. Verifica tu conexión a internet
2. Cierra sesión e inicia nuevamente
3. Contacta al administrador si persiste

---

#### Error: "Tarea no encontrada en Business Central"

**Causas:**
- La tarea fue eliminada en BC
- No tienes permisos para esa tarea

**Solución:**
1. Sincroniza para actualizar tareas
2. Selecciona otra tarea disponible
3. Contacta al administrador del proyecto

---

#### Entrada con Badge "Error"

**Causas:**
- Error al enviar a BC
- Validación fallida en BC

**Solución:**
1. Edita la entrada
2. Verifica que todos los datos sean correctos
3. Guarda nuevamente
4. Sincroniza manualmente

---

## Configuración de Idioma

El sistema soporta **Español** e **Inglés**.

### Cambiar Idioma

#### Desde el Login

```
┌─────────────────────┐
│ [🇪🇸 ES ▼]         │ ← Click aquí
└─────────────────────┘
```

#### Desde la Aplicación

**Desktop:**
- Click en el selector de idioma en el header superior
- Aparece en el lado derecho, junto al usuario

**Mobile:**
- El selector está en la segunda fila del header
- Visible en todas las pantallas

### Idiomas Disponibles

| Código | Idioma | Bandera |
|--------|--------|---------|
| **ES** | Español | 🇪🇸 |
| **EN** | English | 🇬🇧 |

### Traducción de Elementos

Todos los elementos de la interfaz están traducidos:

- ✅ Títulos y etiquetas
- ✅ Botones y acciones
- ✅ Mensajes de éxito y error
- ✅ Estados de aprobación
- ✅ Validaciones de formularios
- ✅ Tooltips y ayudas

> **💾 Persistencia**: El idioma seleccionado se guarda localmente y se mantiene entre sesiones.

---

## Preguntas Frecuentes

### ❓ ¿Puedo editar una entrada ya sincronizada?

**Respuesta:**
- **No** si está aprobada o pendiente
- **Sí** si fue rechazada
- **Sí** si aún no se ha sincronizado

Las entradas aprobadas no se pueden modificar para mantener la integridad de los registros.

---

### ❓ ¿Qué pasa si me olvido de parar el timer?

**Respuesta:**
El timer seguirá contando hasta que lo detengas manualmente. No hay límite de tiempo, pero recuerda que las entradas de más de 24 horas no son válidas y serán rechazadas.

**Recomendación:** Usa el modo manual para registrar el tiempo correcto.

---

### ❓ ¿Puedo registrar tiempo de días anteriores?

**Respuesta:**
Sí, usando el **Modo Manual**. Puedes seleccionar cualquier fecha en el campo "Fecha" y registrar las horas correspondientes.

---

### ❓ ¿Con qué frecuencia se actualizan los estados de aprobación?

**Respuesta:**
Los estados se actualizan:
- Al iniciar sesión
- Al sincronizar manualmente
- Al cambiar de pestaña (Tracker ↔ Week)
- Automáticamente cada 15 minutos

---

### ❓ ¿Puedo eliminar una entrada aprobada?

**Respuesta:**
No. Una vez que una entrada está aprobada en Business Central, no puede ser eliminada desde el Time Tracker. Contacta a tu supervisor si necesitas hacer cambios.

---

### ❓ ¿Qué significa el punto de color junto a cada entrada?

**Respuesta:**
El punto de color indica el estado de aprobación:
- 🟡 **Amarillo**: Pendiente de aprobación
- 🟢 **Verde**: Aprobado
- 🔴 **Rojo**: Rechazado

Es parte del sistema visual de triple indicador (borde + punto + hover).

---

### ❓ ¿Cómo colapso las entradas de un día específico?

**Respuesta:**
Haz click en el **header del día** (donde aparece la fecha y el total de horas). Verás que el icono cambia de ▼ a ▶, indicando que está colapsado. Click nuevamente para expandir.

---

### ❓ ¿La aplicación funciona sin conexión a internet?

**Respuesta:**
No completamente. Necesitas conexión a internet para:
- Iniciar sesión
- Sincronizar con Business Central
- Actualizar estados de aprobación

Sin embargo, el formulario de registro seguirá funcionando localmente y las entradas se sincronizarán cuando recuperes la conexión.

---

### ❓ ¿Puedo usar la aplicación en mi teléfono móvil?

**Respuesta:**
Sí, la aplicación es **completamente responsive** y está optimizada para dispositivos móviles:
- ✅ Layouts adaptados para pantallas pequeñas
- ✅ Botones táctiles más grandes
- ✅ Texto legible sin zoom
- ✅ Navegación simplificada

---

### ❓ ¿Qué hago si veo "approval_status.legend" en lugar del texto?

**Respuesta:**
Esto indica que las traducciones no se cargaron correctamente. Intenta:

1. **Hard Refresh**: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. **Limpiar caché del navegador**
3. **Cambiar de idioma** y volver al original
4. Contacta al administrador si persiste

---

### ❓ ¿Cómo sé si mis horas fueron aprobadas?

**Respuesta:**
Observa el indicador visual en la entrada:
- **Borde verde** en el lado izquierdo
- **Punto verde** junto a la información
- Sin botones de edición/eliminación disponibles

También puedes verificar en Business Central directamente.

---

### ❓ ¿Qué significa "No se puede editar (ya sincronizado)"?

**Respuesta:**
Significa que la entrada ya fue enviada a Business Central y está pendiente de aprobación o fue aprobada. Solo puedes editar entradas que:
- No se han sincronizado aún, o
- Fueron rechazadas

---

### ❓ ¿Puedo cambiar la tarea de una entrada después de crearla?

**Respuesta:**
Sí, pero solo si la entrada:
- No está sincronizada, o
- Fue rechazada

Si está pendiente o aprobada, no puedes cambiar la tarea.

---

### ❓ ¿El sistema valida que no trabaje más de 8 horas al día?

**Respuesta:**
El sistema **no bloquea** entradas con más de 8 horas, pero:
- En la hoja de tiempo semanal, los días con más de 8 horas aparecen en **rojo**
- Business Central puede rechazar entradas con horas excesivas
- Tu supervisor revisará los totales

---

### ❓ ¿Cómo reporto un problema técnico?

**Respuesta:**
1. Toma una captura de pantalla del problema
2. Anota qué estabas haciendo cuando ocurrió
3. Contacta al equipo de soporte técnico:
   - Email: soporte@atpdynamicssolutions.com
   - Incluye tu nombre de usuario y compañía

---

## Soporte Técnico

### Información de Contacto

**ATP Dynamics Solutions**
- 🌐 Website: https://atpdynamicssolutions.com
- 📧 Email: soporte@atpdynamicssolutions.com
- 📱 Teléfono: +XX XXX XXX XXXX

### Horario de Soporte

- Lunes a Viernes: 9:00 AM - 6:00 PM
- Sábados: 9:00 AM - 1:00 PM
- Domingos y festivos: Cerrado

---

## Apéndice: Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Tab` | Navegar entre campos |
| `Enter` | Confirmar formulario |
| `Esc` | Cancelar edición |
| `Ctrl + Shift + R` | Hard refresh (limpiar caché) |

---

## Changelog - Versión Actual

### 🆕 Nuevas Características

- ✅ **Modo Manual por defecto**: El sistema inicia en modo manual
- ✅ **Colapso/Expansión por día**: Click en headers para colapsar entradas
- ✅ **Responsive completo**: Optimizado para móviles y tablets
- ✅ **Estados de aprobación visuales**: Triple indicador (borde + punto + hover)
- ✅ **Leyenda de estados**: Explicación clara de colores
- ✅ **Layout mobile optimizado**: Dos filas para mejor legibilidad
- ✅ **Traducciones completas**: Todos los textos en ES/EN

### 🔧 Mejoras

- ⚡ **Performance**: Build optimizado para carga rápida
- 🎨 **UI/UX**: Diseño más limpio sin emojis innecesarios
- 📱 **Mobile**: Layouts específicos para pantallas pequeñas
- 🌐 **i18n**: Sistema de traducciones mejorado

### 🐛 Correcciones

- ✅ Selector de idiomas duplicado corregido
- ✅ Caché de traducciones solucionado
- ✅ Responsive del login mejorado
- ✅ Weekly timesheet adaptado a móvil

---

## Glosario

| Término | Definición |
|---------|------------|
| **BC** | Business Central (Microsoft Dynamics 365) |
| **Resource No.** | Número de identificación del empleado en BC |
| **Time Entry** | Registro de tiempo/entrada de horas |
| **Sync** | Sincronización con Business Central |
| **Approval Status** | Estado de aprobación (Pending/Approved/Rejected) |
| **Job** | Proyecto en Business Central |
| **Task** | Tarea dentro de un proyecto |
| **Timer Mode** | Modo cronómetro para registro en tiempo real |
| **Manual Mode** | Modo de entrada manual retrospectiva |
| **Collapse/Expand** | Colapsar/Expandir secciones |

---

**Versión del Manual:** 2.0
**Fecha:** Diciembre 2024
**© ATP Dynamics Solutions 2024**
