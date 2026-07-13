import { axiosClient } from '../../lib/axiosClient.js';

export async function registerRequest(payload) {
  const { data } = await axiosClient.post('/auth/register', payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await axiosClient.post('/auth/login', payload);
  return data;
}

export async function meRequest() {
  const { data } = await axiosClient.get('/auth/me');
  return data;
}

export async function changePasswordRequest(payload) {
  const { data } = await axiosClient.post('/auth/change-password', payload);
  return data;
}
