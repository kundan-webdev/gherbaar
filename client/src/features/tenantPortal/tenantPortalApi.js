import { axiosClient } from '../../lib/axiosClient.js';

export async function getMyProfile() {
  const { data } = await axiosClient.get('/me/profile');
  return data.tenant;
}

export async function listMyLeases() {
  const { data } = await axiosClient.get('/me/leases');
  return data.items;
}

export async function listMyInvoices(params = {}) {
  const { data } = await axiosClient.get('/me/invoices', { params });
  return data;
}

export async function getMyInvoice(id) {
  const { data } = await axiosClient.get(`/me/invoices/${id}`);
  return data.invoice;
}

export async function listMyInvoicePayments(invoiceId) {
  const { data } = await axiosClient.get(`/me/invoices/${invoiceId}/payments`);
  return data.items;
}

export async function getMyInvoicePayment(invoiceId, paymentId) {
  const { data } = await axiosClient.get(`/me/invoices/${invoiceId}/payments/${paymentId}`);
  return data.payment;
}
