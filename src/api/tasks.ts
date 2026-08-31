import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { TaskDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import type { TaskStatus } from '@/types/enums';
import { buildPageParams } from '@/utils/pageParams';

const BASE = '/task';

export interface TaskFilters extends PageParams {
  name?: string;
  status?: TaskStatus;
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

async function fetchList(filters: TaskFilters): Promise<Page<TaskDto>> {
  const { data } = await api.get<Page<TaskDto>>(`${BASE}/findAll`, { params: buildPageParams(filters) });
  return data;
}

async function fetchById(id: number): Promise<TaskDto> {
  const { data } = await api.get<TaskDto>(`${BASE}/find/${id}`);
  return data;
}

async function create(dto: Omit<TaskDto, 'id'>): Promise<TaskDto> {
  const { data } = await api.post<TaskDto>(`${BASE}/save`, dto);
  return data;
}

async function update(dto: TaskDto): Promise<TaskDto> {
  const { data } = await api.put<TaskDto>(`${BASE}/update/${dto.id}`, dto);
  return data;
}

async function remove(id: number): Promise<void> {
  await api.delete(`${BASE}/delete/${id}`);
}

export function useTaskList(filters: TaskFilters) {
  return useQuery({ queryKey: taskKeys.list(filters), queryFn: () => fetchList(filters) });
}

export function useTask(id: number | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? -1),
    queryFn: () => fetchById(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.setQueryData(taskKeys.detail(data.id), data);
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
