import { axiosClient } from '../../lib/axiosClient.js';

export async function listTenants(params = {}) {
  const { data } = await axiosClient.get('/tenants', { params });
  return data;
}

export async function getTenant(id) {
  const { data } = await axiosClient.get(`/tenants/${id}`);
  return data.tenant;
}

export async function createTenant(payload) {
  const { data } = await axiosClient.post('/tenants', payload);
  return data;
}

export async function updateTenant(id, payload) {
  const { data } = await axiosClient.patch(`/tenants/${id}`, payload);
  return data.tenant;
}

export async function uploadTenantDocuments(id, files) {
  const formData = new FormData();
  for (const file of files) formData.append('documents', file);
  const { data } = await axiosClient.post(`/tenants/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.tenant;
}

export async function uploadTenantPhoto(id, file) {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await axiosClient.post(`/tenants/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.tenant;
}

export async function removeTenantPhoto(id) {
  const { data } = await axiosClient.delete(`/tenants/${id}/photo`);
  return data.tenant;
}
