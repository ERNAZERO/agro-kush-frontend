import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { MeterDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/meter';

export interface MeterFilters extends PageParams {
  name?: string;
  equipmentId?: number;
}

export const meterKeys = {
  all: ['meters'] as const,
  lists: () => [...meterKeys.all, 'list'] as const,
  list: (filters: MeterFilters) => [...meterKeys.lists(), filters] as const,
  byEquipment: (equipmentId: number) => [...meterKeys.all, 'byEquipment', equipmentId] as const,
  details: () => [...meterKeys.all, 'detail'] as const,
  detail: (id: number) => [...meterKeys.details(), id] as const,
};

async function fetchList(filters: MeterFilters): Promise<Page<MeterDto>> {
  const { data } = await api.get<Page<MeterDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<MeterDto> {
  const { data } = await api.get<MeterDto>(`${BASE}/find/${id}`);
  return data;
}

async function fetchByEquipment(equipmentId: number): Promise<MeterDto[]> {
  const { data } = await api.get<MeterDto[]>(`${BASE}/findByEquipment/${equipmentId}`);
  return data;
}

async function create(dto: Omit<MeterDto, 'id'>): Promise<MeterDto> {
  const { data } = await api.post<MeterDto>(`${BASE}/save`, dto);
  return data;
}

async function update(dto: MeterDto): Promise<MeterDto> {
  const { data } = await api.put<MeterDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useMeterList(filters: MeterFilters) {
  return useQuery({ queryKey: meterKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useMeter(id: number | undefined) {
  return useQuery({
    queryKey: meterKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useMetersByEquipment(equipmentId: number | undefined) {
  return useQuery({
    queryKey: meterKeys.byEquipment(equipmentId ?? -1),
    queryFn: () => fetchByEquipment(equipmentId as number),
    enabled: equipmentId !== undefined,
  });
}

export function useCreateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: meterKeys.all }),
  });
}

export function useUpdateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: meterKeys.all });
      qc.setQueryData(meterKeys.detail(data.id), data);
    },
  });
}

export function useDeleteMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: meterKeys.all }),
  });
}
