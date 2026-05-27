const API_BASE = 'https://bizbook-backend.onrender.com';
const DEFAULT_TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'elite-barbers';

const AUTH_CHANGE_EVENT = 'bizbook-auth-change';

export const subscribeAuth = (handler) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
};

const emitAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

export const parseJwtPayload = (token) => {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return Date.now() < payload.exp * 1000;
};

export const getTenantSlug = () => localStorage.getItem('tenantSlug') || DEFAULT_TENANT_SLUG;

export const setTenantSlug = (slug) => localStorage.setItem('tenantSlug', slug);

export const getToken = () => localStorage.getItem('token');

export const setAuth = ({ token, user }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  emitAuthChange();
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  emitAuthChange();
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const buildHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': getTenantSlug(),
  };

  if (includeAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const api = {
  get: async (path, auth = true) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },

  post: async (path, body, auth = true) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  patch: async (path, body, auth = true) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};

export const authApi = {
  register: (payload) => api.post('/auth/register', payload, false),
  login: (payload) => api.post('/auth/login', payload, false),
  me: () => api.get('/auth/me'),
};

export const appointmentApi = {
  getBranches: () => api.get('/appointments/branches', false),
  getMasters: (branchId) => api.get(`/appointments/masters/${branchId}`, false),
  getSlots: (branchId, masterId, date) =>
    api.get(
      `/appointments/slots?branchId=${branchId}&masterId=${masterId}&date=${date}`,
      false
    ),
  create: (payload) => api.post('/appointments', payload),
  my: () => api.get('/appointments/my'),
  updateStatus: (id, status) => api.patch(`/appointments/${id}`, { status }),
};

export const staffApi = {
  schedule: () => api.get('/staff/schedule'),
};

export const adminApi = {
  analytics: () => api.get('/admin/analytics'),
  tenant: () => api.get('/admin/tenant', false),
};
