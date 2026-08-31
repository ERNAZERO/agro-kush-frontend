import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { EquipmentDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import type { EquipmentStatus } from '@/types/enums';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/api/v1/equipment';

export interface EquipmentFilters extends PageParams {
  name?: string;
  status?: EquipmentStatus;
}

export const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filters: EquipmentFilters) => [...equipmentKeys.lists(), filters] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...equipmentKeys.details(), id] as const,
};

async function fetchList(filters: EquipmentFilters): Promise<Page<EquipmentDto>> {
  const { data } = await api.get<Page<EquipmentDto>>(BASE, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<EquipmentDto> {
  const { data } = await api.get<EquipmentDto>(`${BASE}/${id}`);
  return data;
}

async function create(dto: Omit<EquipmentDto, 'id'>): Promise<EquipmentDto> {
  const { data } = await api.post<EquipmentDto>(BASE, dto);
  return data;
}

async function update(dto: EquipmentDto): Promise<EquipmentDto> {
  const { data } = await api.put<EquipmentDto>(`${BASE}/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export function useEquipmentList(filters: EquipmentFilters) {
  return useQuery({ queryKey: equipmentKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useEquipment(id: number | undefined) {
  return useQuery({
    queryKey: equipmentKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: equipmentKeys.lists() }),
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: equipmentKeys.lists() });
      qc.setQueryData(equipmentKeys.detail(data.id), data);
    },
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: equipmentKeys.lists() }),
  });
}
