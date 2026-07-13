import { axiosClient } from '../../lib/axiosClient.js';

export async function listInvoices(params = {}) {
  const { data } = await axiosClient.get('/invoices', { params });
  return data;
}

export async function getInvoice(id) {
  const { data } = await axiosClient.get(`/invoices/${id}`);
  return data.invoice;
}

export async function createInvoice(payload) {
  const { data } = await axiosClient.post('/invoices', payload);
  return data.invoice;
}

export async function updateInvoiceStatus(id, payload) {
  const { data } = await axiosClient.patch(`/invoices/${id}/status`, payload);
  return data.invoice;
}

export async function recordPayment(invoiceId, payload) {
  const { data } = await axiosClient.post(`/invoices/${invoiceId}/payments`, payload);
  return data;
}

export async function listPayments(invoiceId) {
  const { data } = await axiosClient.get(`/invoices/${invoiceId}/payments`);
  return data.items;
}

export async function getPayment(invoiceId, paymentId) {
  const { data } = await axiosClient.get(`/invoices/${invoiceId}/payments/${paymentId}`);
  return data.payment;
}
