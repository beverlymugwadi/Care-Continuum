import api from './api';

export async function getMotherNotifications(motherId) {
  const { data } = await api.get(`/mothers/${motherId}/notifications`);
  return data;
}

export async function resendNotification(motherId, notificationId) {
  const { data } = await api.post(`/mothers/${motherId}/notifications/${notificationId}/resend`);
  return data;
}

export async function recordHealthAlert(motherId, description) {
  const { data } = await api.post(`/mothers/${motherId}/health-alert`, { description });
  return data;
}
