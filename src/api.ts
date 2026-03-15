import { useAuthStore } from './store';

const API_URL = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let errorMsg = 'API Error';
    try {
      const errorJson = JSON.parse(text);
      errorMsg = errorJson.error || errorMsg;
    } catch (e) {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid JSON response from server');
  }
}

export const api = {
  test: () => fetchWithAuth('/test'),
  login: (data: any) => fetchWithAuth('/login', { method: 'POST', body: JSON.stringify(data) }),
  getTasks: () => fetchWithAuth('/tasks'),
  getTask: (id: number) => fetchWithAuth(`/tasks/${id}`),
  createTask: (data: any) => fetchWithAuth('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: any) => fetchWithAuth(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: number) => fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' }),
  getDashboard: () => fetchWithAuth('/dashboard'),
  getNotifications: () => fetchWithAuth('/notifications'),
  readNotification: (id: number) => fetchWithAuth(`/notifications/${id}/read`, { method: 'POST' }),
  getLogs: () => fetchWithAuth('/logs'),
  getHeaderInfo: () => fetchWithAuth('/settings/headerInfo'),
  updateHeaderInfo: (value: string) => fetchWithAuth('/settings/headerInfo', { method: 'POST', body: JSON.stringify({ value }) }),
  getConfig: () => fetchWithAuth('/settings/config'),
  updateConfig: (config: { workstreams?: string[], departments?: string[], owners?: string[] }) => fetchWithAuth('/settings/config', { method: 'POST', body: JSON.stringify(config) }),
};
