import { axiosClient } from '../../lib/axiosClient.js';

export async function listProperties(params = {}) {
  const { data } = await axiosClient.get('/properties', { params });
  return data;
}

export async function getProperty(id) {
  const { data } = await axiosClient.get(`/properties/${id}`);
  return data.property;
}

export async function createProperty(payload) {
  const { data } = await axiosClient.post('/properties', payload);
  return data.property;
}

export async function addUnit(propertyId, payload) {
  const { data } = await axiosClient.post(`/properties/${propertyId}/units`, payload);
  return data.property;
}
