import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../../features/tenants/tenantsApi.js';

export default function ManagerTenantsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['tenants'], queryFn: () => listTenants() });

  return (
    <div>
      <div className="page-header">
        <h1>Tenants</h1>
      </div>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((tenant) => (
                <tr key={tenant._id}>
                  <td>{tenant.name}</td>
                  <td>{tenant.phone}</td>
                  <td>{tenant.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No tenants on your assigned properties yet.</p>}
        </div>
      )}
    </div>
  );
}
