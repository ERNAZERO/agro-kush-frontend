import { api } from './client';
import type { AuthenticateRequest, AuthenticationResponse, RegisterRequest } from '@/types/dto';

// Auth is the one pair of endpoints that is not a REST resource, so it keeps its
// verb-shaped paths directly under /api/v1 rather than sitting under a collection.
export async function login(request: AuthenticateRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/api/v1/authenticate', request);
  return data;
}

export async function register(request: RegisterRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/api/v1/register', request);
  return data;
}
