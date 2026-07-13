import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listProperties } from '../../features/properties/propertiesApi.js';

export default function ManagerPropertiesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties() });

  return (
    <div>
      <div className="page-header">
        <h1>My Properties</h1>
      </div>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {data?.items.map((property) => (
            <div key={property._id} className="card">
              <h3 style={{ marginBottom: 4 }}>{property.name}</h3>
              <p className="muted" style={{ marginBottom: 12 }}>
                {property.addressLine}, {property.city}
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Unit No</th>
                      <th>Default Rent</th>
                      <th>Occupied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.units.map((unit) => (
                      <tr key={unit._id}>
                        <td>{unit.unitNo}</td>
                        <td>{unit.defaultRent ?? '-'}</td>
                        <td>
                          <span className={`badge badge-${unit.isOccupied ? 'success' : 'neutral'}`}>
                            {unit.isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {data?.items.length === 0 && <p className="muted">No properties assigned to you yet.</p>}
        </div>
      )}
    </div>
  );
}
