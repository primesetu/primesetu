import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import './CompanySelector.css';

export default function CompanySelector() {
  const [companies, setCompanies] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', invoice_prefix: '', gstin: '', owner_mobile: '' });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Temporary bypass for axios to hit new unauthenticated endpoint during setup
      const res = await fetch('http://localhost:8000/api/v1/companies');
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (dbName: string) => {
    localStorage.setItem('X-Company-Db', dbName);
    // Refresh api headers
    apiClient.defaults.headers.common['X-Company-Db'] = dbName;
    navigate('/dashboard');
    window.location.reload();
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/companies/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Company Database Created Successfully!');
        setShowWizard(false);
        fetchCompanies();
      } else {
        const errData = await response.json();
        alert(`Failed: ${errData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error provisioning database');
    } finally {
      setProvisioning(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: (info: any) => (
          <div className="company-info-cell">
            <span className="company-name-txt">{info.getValue()}</span>
            <span className="company-id-sub">Catalog: {info.row.original.db_name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'db_size',
        header: 'Storage Size',
        cell: (info: any) => {
          const mb = info.getValue();
          return <span>{mb ? `${mb.toFixed(2)} MB` : 'Calculating...'}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'System Status',
        cell: (info: any) => {
          const status = info.getValue();
          const isOk = status === 'ACTIVE';
          return (
            <span className={`status-pill ${isOk ? 'status-active' : 'status-offline'}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Operational Control',
        cell: (info: any) => (
          <button
            onClick={() => handleSelectCompany(info.row.original.db_name)}
            className="action-btn-primary"
          >
            Launch POS Console →
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: companies,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="company-selector-bg min-h-screen text-white flex items-center justify-center p-6">
      {!showWizard ? (
        <div className="company-selector-card w-full max-w-4xl rounded-xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-cyan-400">Smriti Retail OS <span className="text-slate-400 text-lg">| Select Company</span></h2>
            <button 
              onClick={() => setShowWizard(true)}
              className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-center font-bold hover:scale-105 transition shadow-lg"
            >
              + Provision New Company
            </button>
          </div>

          <div className="tanstack-table-container">
            <div className="table-search-wrapper">
              <input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="🔍 Search company name or database catalog..."
                className="table-search-input"
              />
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Scanning local sovereign databases...</div>
            ) : (
              <table className="custom-premium-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="table-header-cell"
                        >
                          <div className="header-cell-content">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span className="sort-icon-indicator">
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽',
                              }[header.column.getIsSorted() as string] ?? ' ↕️'}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="table-body-row">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="table-body-cell">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No company databases found. Provision one to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="company-selector-card w-full max-w-md rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Company Creation Wizard</h2>
          <form onSubmit={handleCreateCompany} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Company Name (e.g., Aitdl Retailers)</label>
              <input 
                type="text" 
                required 
                onChange={e => setFormData({...formData, company_name: e.target.value})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invoice Prefix (No spaces, lowercase)</label>
              <input 
                type="text" 
                required 
                value={formData.invoice_prefix}
                placeholder="e.g. aitdl"
                onChange={e => setFormData({...formData, invoice_prefix: e.target.value.toLowerCase().replace(/ /g, '_')})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">GSTIN (Optional)</label>
              <input 
                type="text" 
                onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Owner Mobile (Optional)</label>
              <input 
                type="text" 
                onChange={e => setFormData({...formData, owner_mobile: e.target.value})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition" 
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                disabled={provisioning}
                className="flex-1 py-3 bg-cyan-500 rounded-lg font-bold hover:bg-cyan-600 transition disabled:opacity-50"
              >
                {provisioning ? 'Provisioning...' : 'Build Database'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowWizard(false)}
                disabled={provisioning}
                className="flex-1 py-3 bg-slate-700 rounded-lg font-bold hover:bg-slate-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
