import { apiRequest, clearAuthToken, getAuthToken, setAuthToken } from './apiClient';

export interface AdminUser {
  id: string;
  email: string;
}

export async function requestAdminGate(accessCode: string) {
  const response = await apiRequest<{ gateToken: string }>('/api/auth/gate', {
    method: 'POST',
    body: JSON.stringify({ accessCode }),
  });

  return response.gateToken;
}

export async function login(email: string, password: string, gateToken: string) {
  const response = await apiRequest<{ token: string; user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    headers: {
      'X-Admin-Gate-Token': gateToken,
    },
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(response.token);
  return response.user;
}

export async function getCurrentUser() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiRequest<{ user: AdminUser }>('/api/auth/me', { auth: true });
    return response.user;
  } catch {
    clearAuthToken();
    return null;
  }
}

export function logout() {
  clearAuthToken();
}
