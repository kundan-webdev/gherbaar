import { axiosClient } from '../../lib/axiosClient.js';

export async function listExpenses(params = {}) {
  const { data } = await axiosClient.get('/expenses', { params });
  return data;
}

export async function createExpense(payload) {
  const { data } = await axiosClient.post('/expenses', payload);
  return data.expense;
}
