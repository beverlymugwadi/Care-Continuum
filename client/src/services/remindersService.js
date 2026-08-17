import api from './api';

export async function getReminders() {
  const { data } = await api.get('/reminders');
  return data;
}
