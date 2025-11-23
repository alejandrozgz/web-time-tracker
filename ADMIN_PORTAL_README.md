# Admin Portal - Time Tracker

Portal de administración completo para gestionar tenants, empresas, usuarios y visualizar time entries globales.

## Descripción

El portal de administrador permite:

1. **Gestión de Tenants**: Crear, editar y configurar tenants (clientes/organizaciones)
2. **Gestión de Empresas**: Administrar empresas por tenant
3. **Gestión de Usuarios**: Administrar recursos (usuarios) por tenant y empresa
4. **Visualización de Time Entries**: Ver todas las entradas de tiempo con filtros avanzados
5. **Dashboard de Estadísticas**: Métricas globales del sistema

## Archivos Creados

### Backend - API Routes

#### 1. Tenants Management
**`backend/src/app/api/admin/tenants/route.ts`**
- `GET /api/admin/tenants` - Listar todos los tenants
  - Filtros: `is_active`, `search`, `limit`, `offset`
- `POST /api/admin/tenants` - Crear nuevo tenant

**`backend/src/app/api/admin/tenants/[id]/route.ts`**
- `GET /api/admin/tenants/[id]` - Obtener un tenant específico
- `PATCH /api/admin/tenants/[id]` - Actualizar tenant
- `DELETE /api/admin/tenants/[id]` - Eliminar tenant

#### 2. Companies Management
**`backend/src/app/api/admin/companies/route.ts`**
- `GET /api/admin/companies` - Listar empresas
  - Filtros: `tenant_id`, `is_active`, `search`, `limit`, `offset`
- `POST /api/admin/companies` - Crear empresa

#### 3. Resources (Users) Management
**`backend/src/app/api/admin/resources/route.ts`**
- `GET /api/admin/resources` - Listar usuarios
  - Filtros: `tenant_id`, `company_id`, `is_active`, `search`, `limit`, `offset`
- `POST /api/admin/resources` - Crear usuario
  - Incluye hash de contraseña con bcrypt

#### 4. Time Entries
**`backend/src/app/api/admin/time-entries/route.ts`**
- `GET /api/admin/time-entries` - Ver todas las entradas de tiempo
  - Filtros: `tenant_id`, `company_id`, `resource_no`, `bc_sync_status`, `date_from`, `date_to`, `limit`, `offset`
  - Incluye joins con tenants, companies y resources

#### 5. Dashboard
**`backend/src/app/api/admin/dashboard/route.ts`**
- `GET /api/admin/dashboard` - Estadísticas globales del sistema

### Frontend

#### 1. Tipos TypeScript
**`frontend/src/types/index.ts`**

Nuevos tipos agregados:
```typescript
interface TenantFull
interface CreateTenantData
interface UpdateTenantData
interface CompanyFull
interface CreateCompanyData
interface UpdateCompanyData
interface ResourceFull
interface CreateResourceData
interface UpdateResourceData
interface TimeEntryAdmin
interface AdminDashboardStats
interface AdminTimeEntryFilters
interface AdminResourceFilters
interface AdminCompanyFilters
```

#### 2. Servicio API
**`frontend/src/services/adminApi.ts`**

Clase `AdminApiService` con métodos:
```typescript
// Tenants
getTenants(filters?)
getTenant(id)
createTenant(data)
updateTenant(id, data)
deleteTenant(id)

// Companies
getCompanies(filters?)
createCompany(data)

// Resources (Users)
getResources(filters?)
createResource(data)

// Time Entries
getTimeEntries(filters?)

// Dashboard
getDashboardStats()
```

#### 3. Componentes React

**`frontend/src/components/admin/AdminDashboard.tsx`**
- Dashboard principal con tarjetas de estadísticas
- Gráficos de distribución de estados de sync
- Actividad de sincronización reciente
- Links rápidos a secciones

**`frontend/src/components/admin/TenantsManager.tsx`**
- Lista de tenants con búsqueda
- Modal de creación/edición de tenant
- Acciones de editar/eliminar
- Tabla responsive con estados visuales

## Estructura de la Base de Datos

### Tabla: tenants

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  bc_base_url VARCHAR NOT NULL,
  bc_environment VARCHAR DEFAULT 'Production',
  bc_tenant_id VARCHAR,
  bc_client_id VARCHAR,
  bc_client_secret VARCHAR,
  oauth_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: companies

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  bc_company_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  bc_web_service_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: resources

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  company_id UUID REFERENCES companies(id),
  resource_no VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  web_username VARCHAR,
  web_password_hash VARCHAR,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Uso del Portal de Administrador

### 1. Integración en la Aplicación

#### Rutas de React Router

```tsx
import AdminDashboard from '@/components/admin/AdminDashboard';
import TenantsManager from '@/components/admin/TenantsManager';

const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />
  },
  {
    path: '/admin/tenants',
    element: <TenantsManager />
  },
  // Agregar más rutas según necesidad
];
```

#### Layout de Admin

```tsx
import { Link, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin Portal</h2>
        </div>
        <nav className="mt-8">
          <Link to="/admin" className="block px-4 py-2 hover:bg-gray-700">
            Dashboard
          </Link>
          <Link to="/admin/tenants" className="block px-4 py-2 hover:bg-gray-700">
            Tenants
          </Link>
          <Link to="/admin/companies" className="block px-4 py-2 hover:bg-gray-700">
            Companies
          </Link>
          <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700">
            Users
          </Link>
          <Link to="/admin/time-entries" className="block px-4 py-2 hover:bg-gray-700">
            Time Entries
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
```

### 2. Autenticación del Admin

Para proteger las rutas de admin, implementar middleware de autenticación:

```typescript
// backend/src/middleware/adminAuth.ts
export function requireAdmin(request: NextRequest) {
  // Verificar token JWT
  // Verificar rol de administrador
  // Retornar error si no es admin
}
```

Aplicar en las rutas:

```typescript
export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if (adminCheck.error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... resto del código
}
```

### 3. Inicializar el Servicio API

En tu archivo de inicialización de la app:

```tsx
import adminApiService from './services/adminApi';

// Después del login del admin
const adminToken = 'jwt_token_here';
adminApiService.setAuthToken(adminToken);
```

## Ejemplos de Uso

### Crear un Nuevo Tenant

```typescript
import adminApiService from '@/services/adminApi';

const newTenant = await adminApiService.createTenant({
  slug: 'acme-corp',
  name: 'ACME Corporation',
  bc_base_url: 'https://api.businesscentral.dynamics.com',
  bc_environment: 'Production',
  bc_tenant_id: '12345678-1234-1234-1234-123456789012',
  bc_client_id: 'client-id-here',
  bc_client_secret: 'secret-here',
  oauth_enabled: true
});
```

### Listar Empresas de un Tenant

```typescript
const { companies } = await adminApiService.getCompanies({
  tenant_id: 'tenant-uuid-here',
  is_active: true,
  limit: 50
});
```

### Ver Time Entries con Filtros

```typescript
const { entries } = await adminApiService.getTimeEntries({
  tenant_id: 'tenant-uuid',
  bc_sync_status: 'error',
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  limit: 100
});
```

### Obtener Estadísticas del Dashboard

```typescript
const stats = await adminApiService.getDashboardStats();

console.log(`Total Tenants: ${stats.total_tenants}`);
console.log(`Active Users: ${stats.active_users}`);
console.log(`Failed Syncs: ${stats.failed_syncs}`);
```

## API Responses

### GET /api/admin/tenants

```json
{
  "tenants": [
    {
      "id": "uuid",
      "slug": "acme-corp",
      "name": "ACME Corporation",
      "bc_base_url": "https://api.businesscentral.dynamics.com",
      "bc_environment": "Production",
      "oauth_enabled": true,
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

### GET /api/admin/dashboard

```json
{
  "total_tenants": 5,
  "active_tenants": 4,
  "total_companies": 12,
  "total_users": 45,
  "active_users": 42,
  "total_time_entries": 1250,
  "total_hours_tracked": 9876.50,
  "entries_by_status": {
    "local": 15,
    "draft": 30,
    "posted": 1180,
    "error": 5,
    "modified": 20
  },
  "recent_syncs": 48,
  "failed_syncs": 2
}
```

### GET /api/admin/time-entries

```json
{
  "entries": [
    {
      "id": "uuid",
      "bc_job_id": "JOB-001",
      "bc_task_id": "TASK-001",
      "resource_no": "EMP-001",
      "date": "2025-01-15",
      "hours": 8,
      "description": "Development work",
      "bc_sync_status": "posted",
      "company_id": "uuid",
      "company_name": "ACME Corp",
      "tenant_id": "uuid",
      "tenant_name": "ACME Corporation",
      "resource_display_name": "John Doe"
    }
  ],
  "count": 1,
  "limit": 100,
  "offset": 0
}
```

## Seguridad

### 1. Autenticación Requerida

Todas las rutas de admin deben requerir autenticación:

```typescript
// Middleware de ejemplo
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Roles y Permisos

Implementar sistema de roles:

```typescript
interface UserPermissions {
  is_admin: boolean;
  can_manage_tenants: boolean;
  can_manage_users: boolean;
  can_view_all_entries: boolean;
}
```

### 3. Protección de Datos Sensibles

- Nunca devolver `web_password_hash` en las respuestas
- Ofuscar secretos de BC en las respuestas GET
- Implementar rate limiting
- Logs de auditoría para acciones administrativas

### 4. Row Level Security (RLS)

Las tablas ya tienen RLS, pero para admin necesitas políticas especiales:

```sql
-- Policy para admins
CREATE POLICY "Admins have full access"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM resources
      WHERE resource_no = auth.jwt() ->> 'resource_no'
      AND permissions->>'is_admin' = 'true'
    )
  );
```

## Componentes Adicionales Sugeridos

### 1. CompaniesManager.tsx
Similar a TenantsManager, para gestionar empresas.

### 2. UsersManager.tsx
Gestión de recursos/usuarios con búsqueda y filtros.

### 3. TimeEntriesViewer.tsx
Vista de tabla con filtros avanzados para time entries.

### 4. AdminLayout.tsx
Layout con sidebar de navegación.

### 5. AuditLog.tsx
Vista de logs de auditoría para acciones administrativas.

## Próximas Mejoras

1. **Logs de Auditoría**
   - Registrar todas las acciones administrativas
   - Vista de historial de cambios

2. **Exportación de Datos**
   - Exportar tenants a CSV/Excel
   - Exportar time entries con filtros

3. **Configuración Masiva**
   - Actualizar múltiples tenants a la vez
   - Operaciones batch

4. **Gráficos y Reportes**
   - Gráficos de tendencias
   - Reportes personalizados

5. **Notificaciones**
   - Alertas de errores de sincronización
   - Notificaciones de creación de tenants

## Troubleshooting

### Error: "Tenant with this slug already exists"
**Causa:** El slug debe ser único.
**Solución:** Usar un slug diferente.

### Error: "Cannot delete tenant with existing companies"
**Causa:** El tenant tiene empresas asociadas.
**Solución:** Eliminar primero todas las empresas del tenant.

### Los stats no se actualizan
**Causa:** Caché o datos no refrescados.
**Solución:** Hacer click en el botón "Refresh" del dashboard.

### Error 401 en las rutas de admin
**Causa:** Falta autenticación o token inválido.
**Solución:** Verificar que `adminApiService.setAuthToken()` fue llamado correctamente.

## Soporte

Para preguntas o problemas con el portal de administrador, contactar al equipo de desarrollo de ATP Dynamics Solutions.
