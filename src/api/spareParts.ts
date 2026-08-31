import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { SparePartDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/sparePart';

export interface SparePartFilters extends PageParams {
  name?: string;
}

export const sparePartKeys = {
  all: ['spareParts'] as const,
  lists: () => [...sparePartKeys.all, 'list'] as const,
  list: (filters: SparePartFilters) => [...sparePartKeys.lists(), filters] as const,
  details: () => [...sparePartKeys.all, 'detail'] as const,
  detail: (id: number) => [...sparePartKeys.details(), id] as const,
};

async function fetchList(filters: SparePartFilters): Promise<Page<SparePartDto>> {
  const { data } = await api.get<Page<SparePartDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<SparePartDto> {
  const { data } = await api.get<SparePartDto>(`${BASE}/find/${id}`);
  return data;
}

async function create(dto: Omit<SparePartDto, 'id' | 'equipmentNames'>): Promise<SparePartDto> {
  const { data } = await api.post<SparePartDto>(`${BASE}/save`, dto);
  return data;
}

async function update(dto: Omit<SparePartDto, 'equipmentNames'>): Promise<SparePartDto> {
  const { data } = await api.put<SparePartDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useSparePartList(filters: SparePartFilters) {
  return useQuery({ queryKey: sparePartKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useSparePart(id: number | undefined) {
  return useQuery({
    queryKey: sparePartKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateSparePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: sparePartKeys.lists() }),
  });
}

export function useUpdateSparePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: sparePartKeys.lists() });
      qc.setQueryData(sparePartKeys.detail(data.id), data);
    },
  });
}

export function useDeleteSparePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: sparePartKeys.lists() }),
  });
}
