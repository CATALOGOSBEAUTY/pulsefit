import { apiRequest } from './apiClient';

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
  const response = await apiRequest<{ user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    headers: {
      'X-Admin-Gate-Token': gateToken,
    },
    body: JSON.stringify({ email, password }),
  });

  return response.user;
}

export async function getCurrentUser() {
  try {
    const response = await apiRequest<{ user: AdminUser }>('/api/auth/me', { auth: true });
    return response.user;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await apiRequest<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
      auth: true,
    });
  } catch {
    // Local state is cleared even if the server-side cookie has already expired.
  }
}
