# Guía de Prueba del Portal de Administrador

Esta guía te muestra cómo configurar y probar el portal de administrador paso a paso.

## Paso 1: Configurar las Rutas en tu Aplicación

### Opción A: Si usas React Router v6

Abre tu archivo de rutas (normalmente `App.tsx` o `routes.tsx`) y agrega:

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
        {/* ... tus rutas existentes ... */}

        {/* Rutas de Admin */}
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

### Opción B: Si NO usas React Router

Crea un archivo simple para acceder directamente:

```tsx
// src/pages/AdminPage.tsx
import React, { useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import TenantsManager from '../components/admin/TenantsManager';
import CompaniesManager from '../components/admin/CompaniesManager';
import TimeEntriesViewer from '../components/admin/TimeEntriesViewer';

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen">
      {/* Sidebar Simple */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Portal</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left px-4 py-2 rounded ${
              currentView === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('tenants')}
            className={`w-full text-left px-4 py-2 rounded ${
              currentView === 'tenants' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Tenants
          </button>
          <button
            onClick={() => setCurrentView('companies')}
            className={`w-full text-left px-4 py-2 rounded ${
              currentView === 'companies' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Companies
          </button>
          <button
            onClick={() => setCurrentView('entries')}
            className={`w-full text-left px-4 py-2 rounded ${
              currentView === 'entries' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Time Entries
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        {currentView === 'dashboard' && <AdminDashboard />}
        {currentView === 'tenants' && <TenantsManager />}
        {currentView === 'companies' && <CompaniesManager />}
        {currentView === 'entries' && <TimeEntriesViewer />}
      </main>
    </div>
  );
}
```

Luego usa este componente en tu `App.tsx`:

```tsx
import AdminPage from './pages/AdminPage';

function App() {
  return <AdminPage />;
}
```

## Paso 2: Verificar Dependencias

Asegúrate de que tienes instaladas estas dependencias:

```bash
npm install react-router-dom axios react-hot-toast lucide-react
```

Si falta alguna, instálala:

```bash
cd frontend
npm install
```

## Paso 3: Iniciar el Backend

```bash
cd backend
npm run dev
# o
npm start
```

El backend debería estar corriendo en `http://localhost:3000`

## Paso 4: Iniciar el Frontend

```bash
cd frontend
npm run dev
# o
npm start
```

El frontend debería estar corriendo en `http://localhost:3001` (o el puerto que uses)

## Paso 5: Acceder al Portal de Admin

Abre tu navegador y ve a:

```
http://localhost:3001/admin
```

(Ajusta el puerto si usas otro)

## Paso 6: Probar las Funcionalidades

### 6.1 Dashboard

Al entrar, deberías ver:

✅ **Tarjetas de estadísticas**:
- Total Tenants
- Total Companies
- Total Users (Resources)
- Total Time Entries

✅ **Gráficos**:
- Distribución de estados de sincronización
- Actividad de sync reciente (últimas 24h)

✅ **Quick Links** para navegar

**Nota**: Si no hay datos, todas las métricas mostrarán 0, lo cual es normal.

### 6.2 Gestión de Tenants

1. Click en "Tenants" en el sidebar (o navegación)

2. **Crear un Tenant de Prueba**:
   - Click en "New Tenant"
   - Rellena el formulario:
     ```
     Slug: test-company
     Name: Test Company Inc.
     BC Base URL: https://api.businesscentral.dynamics.com
     Environment: Production
     BC Tenant ID: (opcional por ahora)
     BC Client ID: (opcional por ahora)
     BC Client Secret: (opcional por ahora)
     OAuth Enabled: ☐ (desmarcado por ahora)
     ```
   - Click "Create"

3. **Verificar**:
   - Deberías ver el tenant en la tabla
   - Status: Active
   - OAuth: Disabled

4. **Buscar**:
   - Escribe "test" en el buscador
   - Deberías ver filtrado el tenant

5. **Editar** (opcional):
   - Click en el ícono de editar (lápiz)
   - Cambia el nombre
   - Click "Update"

### 6.3 Gestión de Companies

1. Click en "Companies" en el sidebar

2. **Crear una Company de Prueba**:
   - Click en "New Company"
   - Rellena el formulario:
     ```
     Tenant: Test Company Inc. (selecciona el tenant que creaste)
     Name: ATP Dynamics HQ
     BC Company ID: CRONUS-US
     BC Web Service URL: (opcional)
     ```
   - Click "Create"

3. **Verificar**:
   - Deberías ver la company en la tabla
   - Tenant: Test Company Inc.
   - Status: Active

4. **Filtrar por Tenant**:
   - Usa el dropdown de tenants
   - Selecciona el tenant
   - Deberías ver solo companies de ese tenant

### 6.4 Visualización de Time Entries

1. Click en "Time Entries" en el sidebar

2. **Ver Entradas**:
   - Si no hay time entries, verás "No time entries found"
   - Esto es normal si es una instalación nueva

3. **Probar Filtros**:
   - Click en el ícono de filtro
   - Selecciona un tenant
   - Selecciona un sync status
   - Selecciona un rango de fechas
   - Click "Clear Filters" para limpiar

## Paso 7: Verificar Conexión con la Base de Datos

Si ves errores de conexión, verifica:

### 7.1 Variables de Entorno del Backend

Archivo: `backend/.env`

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 7.2 Verificar que las Tablas Existen en Supabase

1. Abre Supabase Dashboard
2. Ve a "Table Editor"
3. Verifica que existen estas tablas:
   - `tenants`
   - `companies`
   - `resources`
   - `time_entries`

Si faltan tablas, es posible que necesites ejecutar las migraciones.

## Troubleshooting

### Error: "Network Error" o 404 en las peticiones

**Causa**: El backend no está corriendo o está en un puerto diferente.

**Solución**:
1. Verifica que el backend está corriendo
2. Verifica el puerto en la consola del backend
3. Ajusta `REACT_APP_API_URL` en `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

### Error: "Failed to fetch tenants"

**Causa**: Error de autenticación o base de datos.

**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Intenta la operación de nuevo
4. Click en la petición fallida
5. Revisa el "Response" para ver el error exacto

Errores comunes:
- **401 Unauthorized**: Necesitas implementar autenticación (ver siguiente sección)
- **500 Server Error**: Error en el backend, revisa los logs del servidor

### Error: CORS

**Causa**: El frontend y backend están en diferentes orígenes.

**Solución**: Agrega CORS al backend.

En `backend/src/app/api/[ruta]/route.ts`, puedes agregar headers CORS:

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ... });

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
```

### No se cargan los estilos (Tailwind CSS)

**Causa**: Tailwind no está configurado.

**Solución**:
1. Verifica que existe `tailwind.config.js` en el frontend
2. Verifica que en `src/index.css` o `src/App.css` tienes:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Modo de Prueba Sin Autenticación

**⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN**

Para probar el portal sin implementar autenticación primero:

### Opción 1: Comentar verificación de auth en el backend

En cada archivo de ruta (`backend/src/app/api/admin/*/route.ts`), las funciones ya NO tienen verificación de auth, así que deberían funcionar directamente.

### Opción 2: Mock token en el frontend

En `src/App.tsx` o donde inicialices la app:

```tsx
import { useEffect } from 'react';
import adminApiService from './services/adminApi';

function App() {
  useEffect(() => {
    // Mock token solo para desarrollo
    adminApiService.setAuthToken('dev-mock-token');
  }, []);

  return (
    // ... tus componentes
  );
}
```

## Próximos Pasos: Implementar Autenticación Real

Una vez que hayas probado que todo funciona, deberías:

1. **Crear un sistema de admin users** en Supabase
2. **Implementar login de admin**
3. **Proteger las rutas backend** con middleware
4. **Proteger las rutas frontend** con guards

¿Quieres que te ayude a implementar esto?

## Datos de Prueba Rápida

### Crear Tenant de Prueba con SQL (Supabase)

```sql
INSERT INTO tenants (slug, name, bc_base_url, bc_environment, oauth_enabled, is_active)
VALUES
  ('test-tenant', 'Test Tenant', 'https://api.businesscentral.dynamics.com', 'Production', false, true);
```

### Crear Company de Prueba con SQL

```sql
-- Primero obtén el ID del tenant
SELECT id FROM tenants WHERE slug = 'test-tenant';

-- Luego inserta la company (reemplaza 'tenant-id-aqui')
INSERT INTO companies (tenant_id, bc_company_id, name, is_active)
VALUES
  ('tenant-id-aqui', 'CRONUS-US', 'Test Company', true);
```

## Resumen de URLs

- **Dashboard**: `http://localhost:3001/admin`
- **Tenants**: `http://localhost:3001/admin/tenants`
- **Companies**: `http://localhost:3001/admin/companies`
- **Time Entries**: `http://localhost:3001/admin/time-entries`

## API Endpoints que Puedes Probar con Postman/Insomnia

```
GET    http://localhost:3000/api/admin/dashboard
GET    http://localhost:3000/api/admin/tenants
POST   http://localhost:3000/api/admin/tenants
GET    http://localhost:3000/api/admin/companies
POST   http://localhost:3000/api/admin/companies
GET    http://localhost:3000/api/admin/time-entries
```

Ejemplo de POST para crear tenant:

```json
POST http://localhost:3000/api/admin/tenants
Content-Type: application/json

{
  "slug": "my-company",
  "name": "My Company Inc.",
  "bc_base_url": "https://api.businesscentral.dynamics.com",
  "bc_environment": "Production",
  "oauth_enabled": false
}
```

## ¿Necesitas Ayuda?

Si encuentras algún problema:

1. **Revisa los logs del backend** en la terminal donde corre `npm run dev`
2. **Revisa la consola del navegador** (F12 → Console)
3. **Revisa la pestaña Network** (F12 → Network) para ver qué peticiones fallan

Si nada funciona, házmelo saber y te ayudo a debuggear!
