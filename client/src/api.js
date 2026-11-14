import axios from 'axios';
import {
  filterSprintsLocal,
  normalizeSprint,
  normalizeSprints,
  sprintBasePath,
} from './sprintSource';

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

function withNormalizedList(response) {
  return {
    ...response,
    data: normalizeSprints(response.data),
  };
}

function withNormalizedOne(response) {
  return {
    ...response,
    data: normalizeSprint(response.data),
  };
}

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function fetchSprints(store = 'pg') {
  return api.get(sprintBasePath(store)).then(withNormalizedList);
}

/** PG: HTTP QUERY. Mongo: GET all + local filter (no QUERY on /mongo). */
export async function searchSprints({ search, status, store = 'pg' } = {}) {
  if (store === 'mongo') {
    const response = await fetchSprints('mongo');
    return {
      ...response,
      data: filterSprintsLocal(response.data, { search, status }),
    };
  }

  const body = {};
  if (search !== undefined && search !== '') body.search = search;
  if (status !== undefined && status !== 'all') body.status = status;
  const response = await api.request({ method: 'QUERY', url: '/sprints', data: body });
  return withNormalizedList(response);
}

export function addSprint(item, store = 'pg') {
  return api.post(sprintBasePath(store), item).then(withNormalizedOne);
}

export function updateSprint(id, updated, store = 'pg') {
  return api.put(`${sprintBasePath(store)}/${id}`, updated).then(withNormalizedOne);
}

export function deleteSprint(id, store = 'pg') {
  return api.delete(`${sprintBasePath(store)}/${id}`);
}

export function fetchProfile() {
  return api.get('/profile');
}

export function getErrorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Request failed';
}

export default api;
