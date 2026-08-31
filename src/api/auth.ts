import { api } from './client';
import type { AuthenticateRequest, AuthenticationResponse, RegisterRequest } from '@/types/dto';

// AuthenticationController is mapped under /api/v1 (unlike every other controller,
// which has no shared prefix) — see README "Backend issues".
export async function login(request: AuthenticateRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/api/v1/authenticate', request);
  return data;
}

export async function register(request: RegisterRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/api/v1/register', request);
  return data;
}
