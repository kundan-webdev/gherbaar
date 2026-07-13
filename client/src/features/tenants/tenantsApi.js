import { axiosClient } from '../../lib/axiosClient.js';

export async function listTenants(params = {}) {
  const { data } = await axiosClient.get('/tenants', { params });
  return data;
}

export async function createTenant(payload) {
  const { data } = await axiosClient.post('/tenants', payload);
  return data;
}
