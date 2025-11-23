# Portal de Administrador - Quick Start

## ✅ ¿Qué se ha creado?

### Backend (API Routes en `/api/admin/`)
1. ✅ **Gestión de Tenants** - CRUD completo
2. ✅ **Gestión de Companies** - CRUD completo
3. ✅ **Visualización de Time Entries** - Vista global con filtros
4. ✅ **Dashboard de Estadísticas** - Métricas del sistema

### Frontend (Componentes React)
1. ✅ **AdminLayout** - Layout con sidebar de navegación
2. ✅ **AdminDashboard** - Dashboard con estadísticas
3. ✅ **TenantsManager** - Gestión de tenants
4. ✅ **CompaniesManager** - Gestión de empresas
5. ✅ **TimeEntriesViewer** - Visualización de time entries

### Servicios
1. ✅ **adminApi.ts** - Servicio con todos los métodos de API

---

## 🚀 Cómo Probar (3 Pasos Rápidos)

### Paso 1: Agregar Rutas a tu App

Abre `frontend/src/App.tsx` y agrega:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar componentes de admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import TenantsManager from './components/admin/TenantsManager';
import CompaniesManager from './components/admin/CompaniesManager';
import TimeEntriesViewer from './components/admin/TimeEntriesViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tus rutas existentes */}
        {/* ... */}

        {/* AGREGAR ESTAS RUTAS */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantsManager />} />
          <Route path="companies" element={<CompaniesManager />} />
          <Route path="time-entries" element={<TimeEntriesViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Paso 2: Iniciar Backend y Frontend

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Paso 3: Abrir en el Navegador

```
http://localhost:3001/admin
```

(Ajusta el puerto según tu configuración)

---

## 📸 Lo que Verás

### Dashboard (`/admin`)
- **4 Tarjetas de estadísticas**: Tenants, Companies, Users, Time Entries
- **Distribución de sync status**: Local, Draft, Posted, Error, Modified
- **Actividad reciente**: Syncs exitosos y fallidos (24h)
- **Quick Links** a todas las secciones

### Tenants (`/admin/tenants`)
- Tabla de todos los tenants
- Búsqueda por nombre/slug
- Botón "New Tenant" - Modal de creación
- Botones de editar/eliminar por tenant
- Estados: Active/Inactive, OAuth Enabled/Disabled

### Companies (`/admin/companies`)
- Tabla de todas las empresas
- Filtro por tenant
- Búsqueda por nombre
- Botón "New Company" - Modal de creación
- Muestra tenant name y BC Company ID

### Time Entries (`/admin/time-entries`)
- Tabla global de time entries
- Filtros: Tenant, Sync Status, Rango de fechas
- Paginación
- Total de horas calculado
- Badges de colores por estado de sync

---

## 🎯 Prueba Rápida: Crear tu Primer Tenant

1. Ve a `http://localhost:3001/admin/tenants`
2. Click "New Tenant"
3. Rellena:
   ```
   Slug: mi-empresa
   Name: Mi Empresa S.A.
   BC Base URL: https://api.businesscentral.dynamics.com
   Environment: Production
   ```
4. Click "Create"
5. ✅ Deberías ver el tenant en la tabla

---

## 🎯 Prueba Rápida: Crear tu Primera Company

1. Ve a `http://localhost:3001/admin/companies`
2. Click "New Company"
3. Rellena:
   ```
   Tenant: Mi Empresa S.A. (selecciona del dropdown)
   Name: Oficina Central
   BC Company ID: CRONUS-US
   ```
4. Click "Create"
5. ✅ Deberías ver la company en la tabla

---

## 📁 Estructura de Archivos Creados

```
backend/src/app/api/admin/
├── dashboard/route.ts          # GET estadísticas
├── tenants/
│   ├── route.ts                # GET, POST tenants
│   └── [id]/route.ts           # GET, PATCH, DELETE tenant
├── companies/route.ts          # GET, POST companies
└── time-entries/route.ts       # GET time entries

frontend/src/
├── components/admin/
│   ├── AdminLayout.tsx         # Layout con sidebar
│   ├── AdminDashboard.tsx      # Dashboard principal
│   ├── TenantsManager.tsx      # Gestión de tenants
│   ├── CompaniesManager.tsx    # Gestión de companies
│   └── TimeEntriesViewer.tsx   # Visualización de entries
├── services/
│   └── adminApi.ts             # Servicio API
└── types/index.ts              # Tipos TypeScript (actualizados)
```

---

## 🔧 Configuración Necesaria

### Variables de Entorno

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Dependencias NPM

Si falta alguna dependencia:

```bash
cd frontend
npm install react-router-dom axios react-hot-toast lucide-react
```

---

## 🛠️ Troubleshooting

### ❌ Error: "Failed to fetch tenants"

**Causa**: Backend no está corriendo o hay error de conexión.

**Solución**:
1. Verifica que el backend está corriendo en `http://localhost:3000`
2. Revisa la consola del navegador (F12 → Console)
3. Revisa los logs del backend

### ❌ Error: CORS

**Solución**: Asegúrate de que el frontend y backend están en localhost.

### ❌ Error: "Cannot find module 'AdminLayout'"

**Causa**: Ruta de importación incorrecta.

**Solución**: Verifica que la ruta de importación sea correcta:
```tsx
import AdminLayout from './components/admin/AdminLayout';
// Si usas alias @:
import AdminLayout from '@/components/admin/AdminLayout';
```

### ❌ No se ven los estilos (Tailwind)

**Solución**: Verifica que Tailwind CSS está configurado en `tailwind.config.js` y que en tu `index.css` tienes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔒 Nota Importante: Seguridad

**⚠️ ACTUALMENTE NO HAY AUTENTICACIÓN ⚠️**

Las rutas de admin están **desprotegidas** para facilitar el desarrollo y testing.

**ANTES DE PRODUCCIÓN**, debes:
1. Implementar autenticación de administrador
2. Proteger las rutas backend con middleware
3. Verificar roles de usuario

¿Quieres que te ayude a implementar la autenticación?

---

## 📚 Documentación Completa

- **ADMIN_PORTAL_README.md** - Documentación técnica completa
- **ADMIN_PORTAL_TESTING.md** - Guía detallada de pruebas
- **SYNC_LOGS_README.md** - Sistema de logs de sincronización

---

## ✨ Features Implementados

### Tenants
- ✅ Listar con búsqueda y paginación
- ✅ Crear con configuración de BC completa
- ✅ Editar todos los campos
- ✅ Eliminar (con validación de dependencias)
- ✅ Estados visual: Active/Inactive, OAuth On/Off

### Companies
- ✅ Listar con filtro por tenant
- ✅ Crear vinculada a un tenant
- ✅ Búsqueda por nombre
- ✅ Muestra tenant name en la tabla

### Time Entries
- ✅ Vista global de todas las entries
- ✅ Filtros: Tenant, Company, Sync Status, Fechas
- ✅ Paginación
- ✅ Cálculo de total de horas
- ✅ Badges de colores por estado

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Métricas: Tenants, Companies, Users, Entries
- ✅ Distribución de estados de sync
- ✅ Actividad de sync reciente (24h)
- ✅ Quick links de navegación

---

## 🎨 UI/UX Features

- ✅ **Responsive design** - Funciona en desktop y tablet
- ✅ **Loading states** - Spinners durante carga
- ✅ **Empty states** - Mensajes cuando no hay datos
- ✅ **Toast notifications** - Feedback de acciones (éxito/error)
- ✅ **Color-coded badges** - Estados visuales claros
- ✅ **Search & filters** - Búsqueda rápida y filtros
- ✅ **Pagination** - Para grandes volúmenes de datos
- ✅ **Modal forms** - Creación/edición en modales

---

## 📊 API Endpoints Disponibles

```
Dashboard:
GET  /api/admin/dashboard

Tenants:
GET    /api/admin/tenants
POST   /api/admin/tenants
GET    /api/admin/tenants/:id
PATCH  /api/admin/tenants/:id
DELETE /api/admin/tenants/:id

Companies:
GET    /api/admin/companies
POST   /api/admin/companies

Time Entries:
GET    /api/admin/time-entries
```

---

## 🚀 Próximas Mejoras Sugeridas

1. **Autenticación de Admin** ⚠️ PRIORITARIO
2. **Edición de Companies** (actualmente solo lectura)
3. **Exportación a CSV/Excel**
4. **Logs de Auditoría** (quién hizo qué)
5. **Configuración de OAuth por Tenant** (wizard)
6. **Bulk Operations** (activar/desactivar múltiples)
7. **Gráficos de Tendencias** (Chart.js/Recharts)

---

## ✅ Checklist de Verificación

Antes de considerar esto "listo para producción":

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] Puedes ver el dashboard
- [ ] Puedes crear un tenant
- [ ] Puedes crear una company
- [ ] Puedes ver time entries (aunque esté vacío)
- [ ] **IMPLEMENTAR AUTENTICACIÓN** ⚠️
- [ ] Configurar variables de entorno de producción
- [ ] Deploy del backend
- [ ] Deploy del frontend

---

## 💡 Tips

1. **Usa datos reales de BC** cuando configures OAuth en los tenants
2. **Prueba primero sin OAuth** (oauth_enabled: false) para verificar que todo funciona
3. **Revisa los logs del backend** para debuggear errores de API
4. **Usa la consola del navegador** para ver errores de frontend

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa **ADMIN_PORTAL_TESTING.md** - Tiene troubleshooting detallado
2. Revisa los **logs del backend** (terminal donde corre npm run dev)
3. Revisa la **consola del navegador** (F12 → Console)
4. Revisa la **pestaña Network** (F12 → Network) para ver peticiones

---

## 🎉 ¡Listo!

Ya tienes un portal de administrador completo y funcional.

**URLs de Acceso:**
- Dashboard: `http://localhost:3001/admin`
- Tenants: `http://localhost:3001/admin/tenants`
- Companies: `http://localhost:3001/admin/companies`
- Time Entries: `http://localhost:3001/admin/time-entries`

**¡Disfruta administrando tu Time Tracker!** 🚀
