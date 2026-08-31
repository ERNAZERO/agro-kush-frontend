import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { UserDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/user';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: PageParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

async function fetchMe(): Promise<UserDto> {
  const { data } = await api.get<UserDto>(`${BASE}/me`);
  return data;
}

async function fetchUserList(filters: PageParams): Promise<Page<UserDto>> {
  const { data } = await api.get<Page<UserDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchUserById(id: number): Promise<UserDto> {
  const { data } = await api.get<UserDto>(`${BASE}/find/${id}`);
  return data;
}

// Path {id} is unused by UserController#update — the backend reads dto.getId() instead.
async function updateUser(dto: UserDto): Promise<UserDto> {
  const { data } = await api.put<UserDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function deleteUser(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useMe(enabled = true) {
  return useQuery({ queryKey: userKeys.me(), queryFn: fetchMe, enabled, retry: false });
}

export function useUserList(filters: PageParams) {
  return useQuery({ queryKey: userKeys.list(filters), queryFn: () => fetchUserList(filters) });
}

export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? -1),
    queryFn: () => fetchUserById(id as number),
    enabled: id !== undefined,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.setQueryData(userKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
