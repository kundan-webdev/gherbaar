import { axiosClient } from '../../lib/axiosClient.js';

export async function getCollectionSummary(params = {}) {
  const { data } = await axiosClient.get('/reports/collection-summary', { params });
  return data;
}

export async function getExpenseSummary(params = {}) {
  const { data } = await axiosClient.get('/reports/expense-summary', { params });
  return data;
}

export async function getOccupancy(params = {}) {
  const { data } = await axiosClient.get('/reports/occupancy', { params });
  return data;
}

export async function getDashboardSummary() {
  const { data } = await axiosClient.get('/reports/dashboard');
  return data;
}

export async function getFinancialSummary(params = {}) {
  const { data } = await axiosClient.get('/reports/financials', { params });
  return data;
}
