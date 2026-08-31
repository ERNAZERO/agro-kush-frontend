import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { MaterialDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/api/v1/materials';

export interface MaterialFilters extends PageParams {
  fileName?: string;
}

export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (filters: MaterialFilters) => [...materialKeys.lists(), filters] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: number) => [...materialKeys.details(), id] as const,
};

async function fetchList(filters: MaterialFilters): Promise<Page<MaterialDto>> {
  const { data } = await api.get<Page<MaterialDto>>(BASE, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<MaterialDto> {
  const { data } = await api.get<MaterialDto>(`${BASE}/${id}`);
  return data;
}

async function create(dto: Omit<MaterialDto, 'id'>): Promise<MaterialDto> {
  const { data } = await api.post<MaterialDto>(BASE, dto);
  return data;
}

async function update(dto: MaterialDto): Promise<MaterialDto> {
  const { data } = await api.put<MaterialDto>(`${BASE}/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export function useMaterialList(filters: MaterialFilters) {
  return useQuery({ queryKey: materialKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useMaterial(id: number | undefined) {
  return useQuery({
    queryKey: materialKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: materialKeys.lists() }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: materialKeys.lists() });
      qc.setQueryData(materialKeys.detail(data.id), data);
    },
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: materialKeys.lists() }),
  });
}
