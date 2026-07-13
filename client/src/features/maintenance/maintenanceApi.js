import { axiosClient } from '../../lib/axiosClient.js';

export async function listTickets(params = {}) {
  const { data } = await axiosClient.get('/maintenance', { params });
  return data;
}

export async function createTicket(payload) {
  const { data } = await axiosClient.post('/maintenance', payload);
  return data.ticket;
}

export async function getTicket(id) {
  const { data } = await axiosClient.get(`/maintenance/${id}`);
  return data.ticket;
}

export async function addComment(id, text) {
  const { data } = await axiosClient.post(`/maintenance/${id}/comments`, { text });
  return data.ticket;
}

export async function updateTicket(id, payload) {
  const { data } = await axiosClient.patch(`/maintenance/${id}`, payload);
  return data.ticket;
}

export async function uploadPhotos(id, files) {
  const formData = new FormData();
  for (const file of files) formData.append('photos', file);
  const { data } = await axiosClient.post(`/maintenance/${id}/photos`, formData);
  return data.ticket;
}
