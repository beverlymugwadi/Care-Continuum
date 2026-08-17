import api from './api';

export async function register({ name, email, password, role }) {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}
