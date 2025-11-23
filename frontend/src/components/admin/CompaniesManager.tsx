import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Building2 } from 'lucide-react';
import adminApiService from '../../services/adminApi';
import { CompanyFull, TenantFull } from '../../types';
import toast from 'react-hot-toast';

const CompaniesManager: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [tenants, setTenants] = useState<TenantFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
            <p className="text-sm text-gray-600 mt-1">
              Companies are managed from Business Central or created directly in the database
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
              {tenant.name}
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
              </tr>
            ))}
          </tbody>
        </table>

        {companies.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No companies found
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesManager;
