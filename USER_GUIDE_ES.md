# Time Tracker - Guía de Usuario

**Versión:** 2.0
**Última Actualización:** Diciembre 2024
**© ATP Dynamics Solutions**

---

## Índice

1. [Primeros Pasos](#primeros-pasos)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Vista General del Dashboard](#vista-general-del-dashboard)
4. [Registro de Tiempo](#registro-de-tiempo)
5. [Entradas Recientes](#entradas-recientes)
6. [Hoja de Tiempo Semanal](#hoja-de-tiempo-semanal)
7. [Estado de Aprobación](#estado-de-aprobación)
8. [Sincronización](#sincronización)
9. [Configuración de Idioma](#configuración-de-idioma)
10. [Uso en Móvil](#uso-en-móvil)

---

## Primeros Pasos

El **Time Tracker** es una aplicación web que te permite registrar horas de trabajo y sincronizarlas con Microsoft Dynamics 365 Business Central (BC). Todas las entradas de tiempo se envían a BC para la aprobación del supervisor.

### Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet
- Credenciales válidas de Business Central
- Compañía asignada y número de recurso

### Acceso

Navega a: `https://time-tracker.atpdynamicssolutions.com/{tenant-slug}`

Tu organización te proporcionará la URL específica del tenant.

---

## Inicio de Sesión

### Página de Login

Cuando accedas a la aplicación, verás la página de inicio de sesión con tres campos obligatorios:

1. **Company (Compañía)** - Selecciona tu compañía del menú desplegable
2. **Username (Usuario)** - Ingresa tu usuario de Business Central (Resource No.)
3. **Password (Contraseña)** - Ingresa tu contraseña de Business Central

### Pasos para Iniciar Sesión

1. Haz clic en el menú **Company** y selecciona tu organización
2. Escribe tu **nombre de usuario** en el campo Username
3. Escribe tu **contraseña** en el campo Password
4. Haz clic en el botón **"Iniciar Sesión"**

> **Selección de Idioma**: El selector de idioma está disponible en la esquina superior derecha de la página de login.

### Solución de Problemas de Inicio de Sesión

**Credenciales inválidas:**
- Verifica tu nombre de usuario y contraseña
- Comprueba que seleccionaste la compañía correcta
- Contacta a tu administrador del sistema si los problemas persisten

**Compañía no aparece en la lista:**
- Contacta a tu administrador para verificar la configuración de tu compañía en el sistema

---

## Vista General del Dashboard

Después de iniciar sesión, verás el dashboard principal con dos pestañas:

### Barra Superior

El header muestra:
- **Nombre de la compañía** e información del tenant
- **Nombre de usuario** y número de recurso
- **Selector de idioma** (🇺🇸 EN / 🇪🇸 ES)
- **Botón Sincronizar** - Sincronizar manualmente con Business Central
- **Botón Cerrar sesión** - Salir de la aplicación

### Pestañas Principales

**⏱️ Pestaña Time Tracker**
- Registrar nuevas entradas de tiempo
- Ver entradas recientes
- Editar o eliminar entradas (cuando esté permitido)

**📅 Pestaña Week**
- Ver hoja de tiempo semanal
- Ver horas por proyecto y tarea
- Revisar totales diarios y semanales

---

## Registro de Tiempo

El Time Tracker ofrece dos modos para registrar tiempo:

### Selección de Modo

En la parte superior del tracker, verás dos botones:
- **Timer** - Registrar tiempo en tiempo real
- **Manual** - Ingresar tiempo después del hecho

> **Modo Predeterminado**: La aplicación abre en **modo Manual** por defecto.

---

### Modo Manual (Predeterminado)

Usa este modo para ingresar tiempo de trabajo que ya completaste.

#### Campos

1. **Descripción** (obligatorio)
   - Describe en qué trabajaste
   - Ejemplo: "Desarrollo de funcionalidad del portal de clientes"

2. **Selección de Tarea** (obligatorio)
   - Haz clic en **"Seleccionar tarea..."** para abrir el menú desplegable
   - Las tareas están agrupadas por proyecto
   - Haz clic en una tarea para seleccionarla

3. **Fecha**
   - Selecciona la fecha en que se realizó el trabajo
   - Por defecto muestra la fecha actual

4. **Hora de Inicio**
   - Ingresa la hora de inicio en formato 24 horas (HH:MM)
   - Ejemplo: 09:00

5. **Hora de Fin**
   - Ingresa la hora de fin en formato 24 horas (HH:MM)
   - Ejemplo: 17:00

6. **Horas Calculadas**
   - Se muestra automáticamente basado en las horas de inicio y fin
   - Se actualiza en tiempo real mientras escribes

#### Agregar una Entrada Manual

1. Escribe una descripción de tu trabajo
2. Haz clic en "Seleccionar tarea..." y elige un proyecto/tarea
3. Selecciona la fecha
4. Ingresa la hora de inicio (ej. 09:00)
5. Ingresa la hora de fin (ej. 17:00)
6. Verifica las horas calculadas
7. Haz clic en **"Agregar tiempo manual"**

#### Validaciones

- La hora de fin debe ser posterior a la hora de inicio
- Duración mínima: 36 segundos
- Duración máxima: 24 horas
- La descripción es obligatoria
- La selección de tarea es obligatoria

---

### Modo Timer

Usa este modo para rastrear tiempo mientras trabajas.

#### Cómo Usar el Timer

1. **Ingresa una descripción** de lo que estás trabajando
2. **Selecciona una tarea** del menú desplegable
3. Haz clic en **"Iniciar"** para comenzar a cronometrar
4. El timer muestra el tiempo transcurrido en formato HH:MM:SS
5. Haz clic en **"Pausar"** para detener temporalmente (puedes reanudar después)
6. Haz clic en **"Parar"** para finalizar y guardar la entrada

#### Estados del Timer

- **Iniciar** (▶️) - Comienza a cronometrar
- **Pausar** (⏸️) - Detiene temporalmente el timer
- **Reanudar** (▶️) - Continúa un timer pausado
- **Parar** (⏹️) - Finaliza el cronometraje y guarda la entrada

> **Importante**: No puedes iniciar el timer sin ingresar una descripción y seleccionar una tarea.

---

### Selector de Tareas

El selector de tareas muestra todos los proyectos y tareas disponibles:

#### Estructura

```
📁 PROYECTO-001 - Nombre del Proyecto
   • Tarea 1 - Descripción de la Tarea
   • Tarea 2 - Descripción de la Tarea

📁 PROYECTO-002 - Otro Proyecto
   • Tarea 3 - Descripción de la Tarea
   • Tarea 4 - Descripción de la Tarea
```

#### Uso del Selector

1. Haz clic en **"Seleccionar tarea..."**
2. Navega por la lista de proyectos
3. Haz clic en la tarea deseada
4. El selector se cierra automáticamente
5. La tarea seleccionada aparece en el campo

---

## Entradas Recientes

La sección **Entradas Recientes** muestra todos tus registros de tiempo, organizados por fecha.

### Vista General

**Encabezado:**
- Título: "Entradas recientes"
- Leyenda de estados de aprobación con indicadores de color

**Entradas:**
- Agrupadas por fecha (más reciente primero)
- Expandibles/colapsables por día
- Cada entrada muestra descripción, proyecto, tarea, tiempo y estado

---

### Colapsar/Expandir Días

**Para colapsar un día:**
1. Haz clic en cualquier parte del encabezado de la fecha
2. Las entradas se ocultan, mostrando solo la fecha y las horas totales
3. El icono cambia a ▶

**Para expandir un día:**
1. Haz clic en el encabezado de fecha colapsado
2. Todas las entradas de ese día aparecen
3. El icono cambia a ▼

> **Consejo**: Esto ayuda a organizar tu vista cuando tienes muchos días de entradas.

---

### Información de Entrada (Vista Desktop)

Cada entrada muestra:

**Lado izquierdo:**
- **Descripción** - En qué trabajaste
- **Proyecto • Tarea** - Detalles de la asignación

**Lado derecho:**
- **Rango de tiempo** - Horas de inicio y fin (HH:MM - HH:MM)
- **Horas totales** - Horas entre paréntesis (X.XXh)
- **Punto de estado** - Indicador de color (si está sincronizado)
- **Badge de sincronización** - Estado de sincronización
- **Botones de acción** - Editar (✏️) y Eliminar (🗑️)

---

### Información de Entrada (Vista Móvil)

En dispositivos móviles, las entradas usan un diseño de dos filas:

**Fila superior:**
- Descripción y proyecto/tarea (izquierda)
- Botones de acción (derecha)

**Fila inferior:**
- Rango de tiempo y horas (izquierda)
- Punto de estado y badge de sincronización (derecha)

---

### Indicadores de Estado de Aprobación

Cada entrada tiene indicadores visuales que muestran su estado de aprobación:

#### Sistema de Colores

**Color del Borde:**
- **🟡 Borde amarillo grueso (lado izquierdo)** - Pendiente de aprobación
- **🟢 Borde verde grueso (lado izquierdo)** - Aprobado
- **🔴 Borde rojo grueso (lado izquierdo)** - Rechazado

**Punto de Estado:**
- **• Punto pequeño de color** aparece junto al tiempo (coincide con el color del borde)

**Efecto Hover:**
- Aparece un color de fondo sutil cuando pasas el mouse sobre una entrada

#### Leyenda

En la parte superior de Entradas Recientes, verás:

```
Estado de aprobación: • Pendiente • Aprobado • Rechazado
```

Esta leyenda explica el sistema de codificación de colores.

---

### Badges de Estado de Sincronización

Cada entrada muestra su estado de sincronización:

| Badge | Color | Significado |
|-------|-------|-------------|
| **No Sincronizado** | 🟠 Naranja | Entrada creada localmente, no enviada a BC aún |
| **Sincronizado** | 🔵 Azul | Enviada exitosamente a Business Central |
| **Error** | 🔴 Rojo | Falló la sincronización |

---

### Editar Entradas

#### ¿Cuándo Puedes Editar?

Puedes editar una entrada si:
- ✅ Está **No Sincronizada** (badge naranja)
- ✅ Está **Rechazada** (borde rojo)

No puedes editar si:
- ❌ Está **Sincronizada y Pendiente** de aprobación
- ❌ Está **Aprobada** (borde verde)

#### Cómo Editar

1. Haz clic en el **botón Editar** (✏️)
2. La entrada se vuelve editable con campos de formulario
3. Modifica la descripción, tarea, hora de inicio o hora de fin
4. Haz clic en **Guardar** (✓) para confirmar
5. Haz clic en **Cancelar** (✕) para descartar cambios

---

### Eliminar Entradas

#### ¿Cuándo Puedes Eliminar?

Mismas reglas que para editar:
- ✅ Entradas No Sincronizadas
- ✅ Entradas Rechazadas
- ❌ Entradas Pendientes o Aprobadas

#### Cómo Eliminar

1. Haz clic en el **botón Eliminar** (🗑️)
2. Confirma en el diálogo emergente
3. La entrada se elimina permanentemente

> **Advertencia**: Esta acción no se puede deshacer.

---

### Entradas Rechazadas

Cuando un supervisor rechaza una entrada en Business Central:

**Indicadores visuales:**
- Borde rojo a la izquierda
- Punto de estado rojo

**Mensaje de rechazo:**
- Aparece debajo de la entrada
- Muestra la razón proporcionada por el supervisor
- Ejemplo: "⚠️ Motivo del rechazo: Las horas no coinciden con los registros del proyecto"

**Qué hacer:**
1. Lee el motivo del rechazo
2. Edita la entrada para corregir el problema
3. Guarda los cambios
4. La entrada se re-sincronizará automáticamente
5. Espera la aprobación

---

### Cargar Más

Si tienes más de 20 entradas, aparece un botón **"Cargar más"** en la parte inferior.

Haz clic en él para cargar las siguientes 20 entradas. Esto continúa hasta que todas las entradas estén cargadas.

---

## Hoja de Tiempo Semanal

La pestaña **Week** proporciona una vista consolidada de todas tus horas organizadas por proyecto, tarea y día.

### Navegación

**Selector de semana:**
```
[◀] 8 de enero - 14 de enero, 2024 [▶]  [📅 Esta Semana]
```

- **◀ Anterior** - Ir a la semana anterior
- **▶ Siguiente** - Ir a la semana siguiente
- **📅 Esta Semana** - Volver a la semana actual

---

### Estructura de la Tabla

#### Columnas

1. **Proyecto / Tarea** - Muestra nombres de trabajos y tareas
2. **Lunes a Domingo** - 7 columnas de días
3. **Total** - Total semanal para cada tarea

#### Filas

- **Encabezados de proyecto** (📁) - Agrupan tareas por proyecto
- **Filas de tareas** - Muestran horas por día
- **Totales Diarios** - Suma de todas las tareas por día
- **Total Semanal** - Gran total (esquina inferior derecha)

---

### Leer la Hoja de Tiempo

#### Celdas de Horas

Cada celda muestra:
- **Número** - Horas trabajadas (ej. 8.0)
- **"-"** - No hay horas registradas
- **Color** - Indicador de estado de sincronización

#### Colores de Celdas

| Color | Significado |
|-------|-------------|
| 🟠 Fondo naranja | No sincronizado |
| 🔵 Fondo azul | Sincronizado |
| 🔴 Fondo rojo | Error de sincronización |
| ⚪ Fondo gris | Sin horas |

#### Día Actual

La columna del día actual tiene un **fondo azul claro** para fácil identificación.

#### Advertencia de Sobre-horas

Si un día tiene más de 8 horas, el total aparece en **rojo** como advertencia.

---

### Ejemplo de Hoja de Tiempo

```
┌──────────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────────┐
│ Proyecto/Tarea   │  L  │  M  │  X  │  J  │  V  │  S  │  D  │ Total  │
├──────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────────┤
│ 📁 PROYECTO-001                                                      │
│   Desarrollo     │ 8.0 │ 7.0 │ 8.0 │ 8.0 │ 6.0 │  -  │  -  │ 37.0h  │
│   Pruebas        │  -  │ 1.0 │  -  │  -  │ 2.0 │  -  │  -  │  3.0h  │
├──────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────────┤
│ Totales Diarios  │ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 0.0 │ 0.0 │ 40.0h  │
└──────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────────┘
```

---

## Estado de Aprobación

### Flujo de Aprobación

```
Creado (Local)
    ↓
Pendiente (Sincronizado a BC)
    ↓
Aprobado ✓  o  Rechazado ✗
```

---

### Detalles de Estados

#### 1. No Sincronizado (Local)

**Descripción:**
- La entrada existe solo en el Time Tracker
- No se ha enviado a Business Central todavía

**Visual:**
- Sin borde de color
- Badge naranja "No Sincronizado"

**Acciones disponibles:**
- ✅ Editar
- ✅ Eliminar

---

#### 2. Pendiente de Aprobación

**Descripción:**
- Entrada sincronizada exitosamente a Business Central
- Esperando aprobación del supervisor

**Visual:**
- 🟡 Borde izquierdo amarillo (4px de grosor)
- 🟡 Punto de estado amarillo
- Badge azul "Sincronizado"

**Acciones disponibles:**
- ❌ No se puede editar
- ❌ No se puede eliminar

---

#### 3. Aprobado

**Descripción:**
- El supervisor aprobó la entrada en BC
- El tiempo está validado y procesado

**Visual:**
- 🟢 Borde izquierdo verde (4px de grosor)
- 🟢 Punto de estado verde
- Badge azul "Sincronizado"

**Acciones disponibles:**
- ❌ No se puede editar
- ❌ No se puede eliminar

---

#### 4. Rechazado

**Descripción:**
- El supervisor rechazó la entrada en BC
- Incluye un motivo de rechazo

**Visual:**
- 🔴 Borde izquierdo rojo (4px de grosor)
- 🔴 Punto de estado rojo
- Mensaje de rechazo debajo de la entrada
- Badge azul "Sincronizado"

**Acciones disponibles:**
- ✅ Editar (para corregir)
- ✅ Eliminar

---

### Verificar Estado de Aprobación

**Método 1: Indicadores visuales**
- Observa el color del borde de las entradas en Entradas Recientes
- Amarillo = Pendiente
- Verde = Aprobado
- Rojo = Rechazado

**Método 2: Leyenda**
- Consulta la leyenda de estado de aprobación en la parte superior de Entradas Recientes

**Método 3: Business Central**
- También puedes verificar directamente en Business Central

---

## Sincronización

### ¿Qué es la Sincronización?

La sincronización es el proceso de enviar entradas de tiempo del Time Tracker a Business Central y recibir actualizaciones de estado de aprobación.

### ¿Qué se Sincroniza?

**Hacia Business Central:**
- Nuevas entradas de tiempo
- Descripción, fecha, horas
- Asignaciones de proyecto y tarea
- Información de tu usuario/recurso

**Desde Business Central:**
- Cambios de estado de aprobación
- Motivos de rechazo
- Proyectos y tareas disponibles
- Información de la compañía

---

### Sincronización Manual

#### Cómo Sincronizar

1. Haz clic en el botón **"Sincronizar"** en la esquina superior derecha
2. Espera a que el proceso se complete
3. El botón mostrará "Sincronizado hace X min" cuando termine

#### Estados del Botón de Sincronización

| Pantalla | Significado |
|----------|-------------|
| **"Sincronizar"** | Listo para sincronizar |
| **"Sincronizando..."** (icono giratorio) | En progreso |
| **"Sincronizado hace 2 min"** | Tiempo de última sincronización |

---

### Sincronización Automática

El sistema sincroniza automáticamente:
- Cuando creas una nueva entrada
- Cada 15 minutos (segundo plano)
- Al cambiar entre pestañas

> **Mejor Práctica**: Sincroniza manualmente al final de tu jornada laboral para asegurar que todas las entradas se envíen a Business Central.

---

### Errores de Sincronización

**Badge de error en entrada:**
- La entrada muestra un badge rojo de "Error"
- Falló la sincronización a Business Central

**Cómo resolver:**
1. Verifica tu conexión a Internet
2. Edita la entrada para verificar que toda la información sea correcta
3. Guarda la entrada
4. Haz clic en el botón Sincronizar
5. Contacta a tu administrador si el error persiste

---

## Configuración de Idioma

El Time Tracker soporta **Inglés** y **Español**.

### Cambiar Idioma

#### Desde la Página de Login

Haz clic en el selector de idioma en la esquina superior derecha:
- 🇺🇸 **EN** - English
- 🇪🇸 **ES** - Español

#### Desde el Dashboard

**Desktop:**
- El selector de idioma aparece en el header (lado derecho)

**Móvil:**
- El selector de idioma aparece en la segunda fila del header

### Persistencia del Idioma

Tu preferencia de idioma se guarda localmente y persiste entre sesiones.

---

## Uso en Móvil

El Time Tracker es completamente responsive y está optimizado para dispositivos móviles.

### Características Móviles

#### Diseños Optimizados

- **Entradas Recientes**: Diseño de dos filas para mejor legibilidad
- **Hoja de Tiempo**: Scroll horizontal para vista de semana completa
- **Formularios**: Objetivos táctiles más grandes e inputs simplificados

#### Navegación

- **Header**: Compacto con información esencial
- **Pestañas**: Cambio fácil entre Tracker y Week
- **Botones**: Tamaños táctiles amigables

#### Mejores Prácticas

1. **Modo retrato** recomendado para Entradas Recientes
2. **Modo paisaje** mejor para Hoja de Tiempo Semanal
3. **Pull to refresh** no soportado - usa el botón Sincronizar
4. **Wi-Fi recomendado** para sincronización más rápida

---

## Preguntas Frecuentes

### ¿Puedo editar una entrada después de sincronizarla?

No, a menos que haya sido rechazada por tu supervisor. Las entradas aprobadas y pendientes no se pueden modificar para mantener la integridad de los registros.

### ¿Puedo registrar tiempo de días anteriores?

Sí, usa el modo Manual y selecciona cualquier fecha en el campo Fecha.

### ¿Qué pasa si olvido parar el timer?

El timer seguirá corriendo. Detenlo manualmente y usa el modo Manual para ingresar las horas correctas si es necesario.

### ¿Con qué frecuencia se actualizan los estados de aprobación?

- Al iniciar sesión
- Cuando sincronizas manualmente
- Al cambiar de pestañas
- Automáticamente cada 15 minutos

### ¿Puedo eliminar una entrada aprobada?

No. Una vez aprobada en Business Central, las entradas no se pueden eliminar desde el Time Tracker. Contacta a tu supervisor para cualquier cambio.

### ¿La aplicación funciona sin conexión?

No. Se requiere conexión a Internet para:
- Iniciar sesión
- Sincronización
- Actualizaciones de estado de aprobación

Sin embargo, puedes seguir llenando el formulario sin conexión, y las entradas se sincronizarán cuando te reconectes.

### ¿Qué significa el punto de color?

El punto indica el estado de aprobación:
- 🟡 Amarillo - Pendiente de aprobación
- 🟢 Verde - Aprobado
- 🔴 Rojo - Rechazado

### ¿Por qué veo "approval_status.legend" en lugar de texto?

Esto significa que las traducciones no se cargaron. Intenta:
1. Hard refresh: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. Limpiar caché del navegador
3. Cambiar de idioma y volver a cambiar

---

## Soporte

### Soporte Técnico

**ATP Dynamics Solutions**
- 🌐 Sitio Web: https://atpdynamicssolutions.com
- 📧 Email: soporte@atpdynamicssolutions.com

### Horario de Soporte

- Lunes - Viernes: 9:00 AM - 6:00 PM
- Sábado: 9:00 AM - 1:00 PM
- Domingo y Festivos: Cerrado

---

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Tab` | Navegar entre campos |
| `Enter` | Enviar formulario |
| `Esc` | Cancelar edición |
| `Ctrl + Shift + R` | Hard refresh (limpiar caché) |

---

## Glosario

| Término | Definición |
|---------|------------|
| **BC** | Business Central (Microsoft Dynamics 365) |
| **Resource No.** | Tu ID de empleado en Business Central |
| **Entrada de Tiempo** | Un registro de horas trabajadas |
| **Sync** | Sincronización con Business Central |
| **Job** | Proyecto en Business Central |
| **Task** | Tarea específica dentro de un proyecto |

---

**Fin de la Guía de Usuario**

Para las últimas actualizaciones e información detallada, consulta la documentación en línea o contacta a soporte.
