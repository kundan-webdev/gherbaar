import { axiosClient } from '../../lib/axiosClient.js';

export async function listManagers(params = {}) {
  const { data } = await axiosClient.get('/managers', { params });
  return data;
}

export async function createManager(payload) {
  const { data } = await axiosClient.post('/managers', payload);
  return data;
}

export async function updateManager(id, payload) {
  const { data } = await axiosClient.patch(`/managers/${id}`, payload);
  return data.manager;
}

export async function removeManager(id) {
  await axiosClient.delete(`/managers/${id}`);
}
