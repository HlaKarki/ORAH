import { apiRequest, APIError } from './api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  fullName: string;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  return response.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.user;
}

export async function logout(): Promise<void> {
  await apiRequest<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<MeResponse>('/api/auth/me');
    return response.user;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}

export { APIError };
