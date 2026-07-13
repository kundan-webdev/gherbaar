import { axiosClient } from '../../lib/axiosClient.js';

export async function listLeases(params = {}) {
  const { data } = await axiosClient.get('/leases', { params });
  return data;
}

export async function createLease(payload) {
  const { data } = await axiosClient.post('/leases', payload);
  return data.lease;
}
