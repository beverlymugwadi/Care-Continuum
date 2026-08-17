import api from './api';

export async function getChildById(id) {
  const { data } = await api.get(`/children/${id}`);
  return data;
}

export async function logGrowthRecord(childId, payload) {
  const { data } = await api.post(`/children/${childId}/growth`, payload);
  return data;
}

export async function completeVaccination(childId, vaccineId, payload = {}) {
  const { data } = await api.post(`/children/${childId}/vaccinations/${vaccineId}/complete`, payload);
  return data;
}
