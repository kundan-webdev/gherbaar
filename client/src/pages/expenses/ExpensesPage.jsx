import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { listExpenses, createExpense } from '../../features/expenses/expensesApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';

const emptyForm = { property: '', category: 'maintenance', amount: '', date: '', description: '' };

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: expenses, isLoading } = useQuery({ queryKey: ['expenses'], queryFn: () => listExpenses() });
  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setForm(emptyForm);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: Number(form.amount) });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Expenses</h1>
      </div>

      <form onSubmit={handleSubmit} className="card form-grid" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label>Property</label>
          <select required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })}>
            <option value="">Select property</option>
            {properties?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="tax">Tax</option>
            <option value="insurance">Insurance</option>
            <option value="utility">Utility</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn" type="submit" disabled={createMutation.isPending} style={{ alignSelf: 'end' }}>
          <Plus size={15} /> Add Expense
        </button>
      </form>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {expenses?.items.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{expense.category}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td>{expense.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No expenses logged yet.</p>}
        </div>
      )}
    </div>
  );
}
