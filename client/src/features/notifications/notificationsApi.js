import { axiosClient } from '../../lib/axiosClient.js';

export async function listNotifications(params = {}) {
  const { data } = await axiosClient.get('/notifications', { params });
  return data;
}

export async function getUnreadCount() {
  const { data } = await axiosClient.get('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id) {
  const { data } = await axiosClient.patch(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead() {
  const { data } = await axiosClient.patch('/notifications/read-all');
  return data;
}
