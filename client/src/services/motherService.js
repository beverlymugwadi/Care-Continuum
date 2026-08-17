import api from './api';

export async function getMothers() {
  const { data } = await api.get('/mothers');
  return data;
}

export async function getMotherById(id) {
  const { data } = await api.get(`/mothers/${id}`);
  return data;
}

export async function createMother(payload) {
  const { data } = await api.post('/mothers', payload);
  return data;
}

export async function updateMother(id, payload) {
  const { data } = await api.put(`/mothers/${id}`, payload);
  return data;
}

export async function recordBirth(motherId, payload) {
  const { data } = await api.post(`/mothers/${motherId}/birth`, payload);
  return data;
}
