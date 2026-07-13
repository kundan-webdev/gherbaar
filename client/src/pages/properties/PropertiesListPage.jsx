import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { listProperties, createProperty, addUnit } from '../../features/properties/propertiesApi.js';

const emptyForm = { name: '', addressLine: '', city: '', type: 'apartment' };

export default function PropertiesListPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [unitForms, setUnitForms] = useState({});

  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties() });

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setForm(emptyForm);
    },
  });

  const addUnitMutation = useMutation({
    mutationFn: ({ propertyId, unit }) => addUnit(propertyId, unit),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    createMutation.mutate(form);
  }

  function handleAddUnit(e, propertyId) {
    e.preventDefault();
    const unit = unitForms[propertyId] || { unitNo: '', defaultRent: '' };
    addUnitMutation.mutate({ propertyId, unit: { ...unit, defaultRent: Number(unit.defaultRent) || undefined } });
    setUnitForms({ ...unitForms, [propertyId]: { unitNo: '', defaultRent: '' } });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Properties</h1>
      </div>

      <form onSubmit={handleCreate} className="card form-grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr 1fr 1fr auto', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Address</label>
          <input required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>City</label>
          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="apartment">Apartment</option>
            <option value="independent_house">Independent House</option>
            <option value="pg">PG</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <button className="btn" type="submit" disabled={createMutation.isPending}>
          <Plus size={15} /> Add Property
        </button>
      </form>

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
              <form
                onSubmit={(e) => handleAddUnit(e, property._id)}
                style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'end' }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Unit No</label>
                  <input
                    required
                    value={unitForms[property._id]?.unitNo || ''}
                    onChange={(e) =>
                      setUnitForms({
                        ...unitForms,
                        [property._id]: { ...unitForms[property._id], unitNo: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Default Rent</label>
                  <input
                    type="number"
                    value={unitForms[property._id]?.defaultRent || ''}
                    onChange={(e) =>
                      setUnitForms({
                        ...unitForms,
                        [property._id]: { ...unitForms[property._id], defaultRent: e.target.value },
                      })
                    }
                  />
                </div>
                <button className="btn secondary" type="submit">
                  Add Unit
                </button>
              </form>
            </div>
          ))}
          {data?.items.length === 0 && <p className="muted">No properties yet. Add your first one above.</p>}
        </div>
      )}
    </div>
  );
}
