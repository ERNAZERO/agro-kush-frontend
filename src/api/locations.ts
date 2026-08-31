import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { LocationDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/location';

export interface LocationFilters extends PageParams {
  name?: string;
}

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (filters: LocationFilters) => [...locationKeys.lists(), filters] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: number) => [...locationKeys.details(), id] as const,
};

async function fetchList(filters: LocationFilters): Promise<Page<LocationDto>> {
  const { data } = await api.get<Page<LocationDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<LocationDto> {
  const { data } = await api.get<LocationDto>(`${BASE}/find/${id}`);
  return data;
}

async function create(dto: Omit<LocationDto, 'id'>): Promise<LocationDto> {
  const { data } = await api.post<LocationDto>(`${BASE}/save`, dto);
  return data;
}

async function update(dto: LocationDto): Promise<LocationDto> {
  const { data } = await api.put<LocationDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useLocationList(filters: LocationFilters) {
  return useQuery({ queryKey: locationKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useLocation(id: number | undefined) {
  return useQuery({
    queryKey: locationKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: locationKeys.lists() }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: locationKeys.lists() });
      qc.setQueryData(locationKeys.detail(data.id), data);
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: locationKeys.lists() }),
  });
}
