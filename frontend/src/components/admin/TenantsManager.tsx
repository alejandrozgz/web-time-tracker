import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Search, Server } from 'lucide-react';
import adminApiService from '../../services/adminApi';
import { TenantFull, CreateTenantData } from '../../types';
import toast from 'react-hot-toast';

const TenantsManager: React.FC = () => {
  const [tenants, setTenants] = useState<TenantFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantFull | null>(null);

  useEffect(() => {
    loadTenants();
  }, [search]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getTenants({ search, limit: 100 });
      setTenants(data.tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: CreateTenantData) => {
    try {
      await adminApiService.createTenant(formData);
      toast.success('Tenant created successfully');
      setShowCreateModal(false);
      loadTenants();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast.error(error.response?.data?.error || 'Failed to create tenant');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await adminApiService.deleteTenant(id);
      toast.success('Tenant deleted');
      loadTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete tenant');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTenants}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            New Tenant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OAuth</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{tenant.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{tenant.bc_environment}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${tenant.oauth_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {tenant.oauth_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingTenant(tenant)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tenants.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No tenants found
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTenant) && (
        <TenantFormModal
          tenant={editingTenant}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTenant(null);
          }}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

// Simple Form Modal Component
const TenantFormModal: React.FC<{
  tenant: TenantFull | null;
  onClose: () => void;
  onSubmit: (data: CreateTenantData) => void;
}> = ({ tenant, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateTenantData>({
    slug: tenant?.slug || '',
    name: tenant?.name || '',
    bc_base_url: tenant?.bc_base_url || '',
    bc_environment: tenant?.bc_environment || 'Production',
    bc_tenant_id: tenant?.bc_tenant_id || '',
    bc_client_id: tenant?.bc_client_id || '',
    bc_client_secret: tenant?.bc_client_secret || '',
    oauth_enabled: tenant?.oauth_enabled || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{tenant ? 'Edit Tenant' : 'Create Tenant'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!!tenant}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">BC Base URL *</label>
            <input
              type="url"
              required
              value={formData.bc_base_url}
              onChange={(e) => setFormData({ ...formData, bc_base_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Environment</label>
              <input
                type="text"
                value={formData.bc_environment}
                onChange={(e) => setFormData({ ...formData, bc_environment: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">BC Tenant ID</label>
              <input
                type="text"
                value={formData.bc_tenant_id}
                onChange={(e) => setFormData({ ...formData, bc_tenant_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">BC Client ID</label>
              <input
                type="text"
                value={formData.bc_client_id}
                onChange={(e) => setFormData({ ...formData, bc_client_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">BC Client Secret</label>
              <input
                type="password"
                value={formData.bc_client_secret}
                onChange={(e) => setFormData({ ...formData, bc_client_secret: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="oauth_enabled"
              checked={formData.oauth_enabled}
              onChange={(e) => setFormData({ ...formData, oauth_enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="oauth_enabled" className="text-sm font-medium">Enable OAuth/BC Sync</label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {tenant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantsManager;
