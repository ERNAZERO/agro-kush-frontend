import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { DefectDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import type { DefectStatus } from '@/types/enums';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/defect';

export interface DefectFilters extends PageParams {
  name?: string;
  equipmentId?: number;
  defectStatus?: DefectStatus;
}

export const defectKeys = {
  all: ['defects'] as const,
  lists: () => [...defectKeys.all, 'list'] as const,
  list: (filters: DefectFilters) => [...defectKeys.lists(), filters] as const,
  byEquipment: (equipmentId: number) => [...defectKeys.all, 'byEquipment', equipmentId] as const,
  details: () => [...defectKeys.all, 'detail'] as const,
  detail: (id: number) => [...defectKeys.details(), id] as const,
};

async function fetchList(filters: DefectFilters): Promise<Page<DefectDto>> {
  const { data } = await api.get<Page<DefectDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<DefectDto> {
  const { data } = await api.get<DefectDto>(`${BASE}/find/${id}`);
  return data;
}

async function fetchByEquipment(equipmentId: number): Promise<DefectDto[]> {
  const { data } = await api.get<DefectDto[]>(`${BASE}/findByEquipment/${equipmentId}`);
  return data;
}

async function create(dto: Omit<DefectDto, 'id'>): Promise<DefectDto> {
  const { data } = await api.post<DefectDto>(`${BASE}/save`, dto);
  return data;
}

async function update(dto: DefectDto): Promise<DefectDto> {
  const { data } = await api.put<DefectDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function updateStatus(id: number, status: DefectStatus): Promise<DefectDto> {
  const { data } = await api.patch<DefectDto>(`${BASE}/${id}/status`, null, { params: { status } });
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useDefectList(filters: DefectFilters) {
  return useQuery({ queryKey: defectKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useDefect(id: number | undefined) {
  return useQuery({
    queryKey: defectKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useDefectsByEquipment(equipmentId: number | undefined) {
  return useQuery({
    queryKey: defectKeys.byEquipment(equipmentId ?? -1),
    queryFn: () => fetchByEquipment(equipmentId as number),
    enabled: equipmentId !== undefined,
  });
}

export function useCreateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: defectKeys.all }),
  });
}

export function useUpdateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: defectKeys.all });
      qc.setQueryData(defectKeys.detail(data.id), data);
    },
  });
}

export function useUpdateDefectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DefectStatus }) => updateStatus(id, status),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: defectKeys.all });
      qc.setQueryData(defectKeys.detail(data.id), data);
    },
  });
}

export function useDeleteDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: defectKeys.all }),
  });
}
