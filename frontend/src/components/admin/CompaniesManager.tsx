import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Building2, Plus, Edit2, Trash2, X } from 'lucide-react';
import adminApiService from '../../services/adminApi';
import { CompanyFull, TenantFull, CreateCompanyData } from '../../types';
import toast from 'react-hot-toast';

// Company Form Modal Component
const CompanyFormModal: React.FC<{
  company: CompanyFull | null;
  tenants: TenantFull[];
  onClose: () => void;
  onSubmit: (data: CreateCompanyData) => void;
  onUpdate: (id: string, data: Partial<CreateCompanyData>) => void;
}> = ({ company, tenants, onClose, onSubmit, onUpdate }) => {
  const [formData, setFormData] = useState<CreateCompanyData>({
    tenant_id: company?.tenant_id || '',
    bc_company_id: company?.bc_company_id || '',
    name: company?.name || '',
    bc_web_service_url: company?.bc_web_service_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      // Editing - don't send tenant_id or bc_company_id
      const { tenant_id, bc_company_id, ...updateData } = formData;
      onUpdate(company.id, updateData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{company ? 'Edit Company' : 'Create Company'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant Select - Only for creating */}
          {!company && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant *
              </label>
              <select
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* BC Company ID - Only for creating */}
          {!company && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BC Company ID *
              </label>
              <input
                type="text"
                value={formData.bc_company_id}
                onChange={(e) => setFormData({ ...formData, bc_company_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., CRONUS USA Inc."
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must match exactly the company name in Business Central</p>
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., CRONUS USA Inc."
              required
            />
          </div>

          {/* BC Web Service URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BC Web Service URL (Optional)
            </label>
            <input
              type="text"
              value={formData.bc_web_service_url}
              onChange={(e) => setFormData({ ...formData, bc_web_service_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://api.businesscentral.dynamics.com/..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {company ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompaniesManager: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [tenants, setTenants] = useState<TenantFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyFull | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [search, selectedTenant]);

  const loadTenants = async () => {
    try {
      const data = await adminApiService.getTenants({ limit: 1000 });
      setTenants(data.tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getCompanies({
        tenant_id: selectedTenant || undefined,
        search,
        limit: 100
      });
      setCompanies(data.companies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCompanyData) => {
    try {
      await adminApiService.createCompany(data);
      toast.success('Company created successfully');
      setShowModal(false);
      loadCompanies();
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast.error(error.response?.data?.error || 'Failed to create company');
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateCompanyData>) => {
    try {
      await adminApiService.updateCompany(id, data);
      toast.success('Company updated successfully');
      setShowModal(false);
      setEditingCompany(null);
      loadCompanies();
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error(error.response?.data?.error || 'Failed to update company');
    }
  };

  const handleDelete = async (company: CompanyFull) => {
    if (!window.confirm(`Are you sure you want to delete company "${company.name}"?`)) {
      return;
    }

    try {
      await adminApiService.deleteCompany(company.id);
      toast.success('Company deleted successfully');
      loadCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast.error(error.response?.data?.error || 'Failed to delete company');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage companies for each tenant
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCompany(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Company
          </button>
          <button
            onClick={loadCompanies}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Tenants</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name} ({tenant.slug})
            </option>
          ))}
        </select>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BC Company ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{company.tenant_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{company.bc_company_id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCompany(company);
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit company"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(company)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {companies.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No companies found. Create one to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CompanyFormModal
          company={editingCompany}
          tenants={tenants}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
          onSubmit={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default CompaniesManager;
