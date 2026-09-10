import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function fetchSprints() {
  return api.get('/sprints');
}

/** Server-side search/filter via HTTP QUERY (Lab 1 endpoint). */
export function searchSprints({ search, status } = {}) {
  const body = {};
  if (search !== undefined && search !== '') body.search = search;
  if (status !== undefined && status !== 'all') body.status = status;
  return api.request({ method: 'QUERY', url: '/sprints', data: body });
}

export function addSprint(item) {
  return api.post('/sprints', item);
}

export function updateSprint(id, updated) {
  return api.put(`/sprints/${id}`, updated);
}

export function deleteSprint(id) {
  return api.delete(`/sprints/${id}`);
}

export function getErrorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Request failed';
}

export default api;
