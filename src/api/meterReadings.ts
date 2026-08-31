import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { MeterReadingDto } from '@/types/dto';
import type { Page, PageParams } from '@/types/api';
import { buildPageParams } from '@/utils/pageParams';

const base = (meterId: number) => `/meter/${meterId}/readings`;

export interface ReadingFilters extends PageParams {
  from?: string; // ISO LocalDateTime — only applied when both from and to are set
  to?: string;
}

export const meterReadingKeys = {
  all: ['meterReadings'] as const,
  list: (meterId: number, filters: ReadingFilters) => [...meterReadingKeys.all, 'list', meterId, filters] as const,
  latest: (meterId: number) => [...meterReadingKeys.all, 'latest', meterId] as const,
  total: (meterId: number, from: string, to: string) =>
    [...meterReadingKeys.all, 'total', meterId, from, to] as const,
};

async function fetchList(meterId: number, filters: ReadingFilters): Promise<Page<MeterReadingDto>> {
  const { data } = await api.get<Page<MeterReadingDto>>(base(meterId), { params: buildPageParams(filters) });
  return data;
}

async function fetchLatest(meterId: number): Promise<MeterReadingDto> {
  const { data } = await api.get<MeterReadingDto>(`${base(meterId)}/latest`);
  return data;
}

async function fetchTotal(meterId: number, from: string, to: string): Promise<number> {
  const { data } = await api.get<number>(`${base(meterId)}/total`, { params: { from, to } });
  return data;
}

async function addReading(meterId: number, dto: Omit<MeterReadingDto, 'id' | 'meterId'>): Promise<MeterReadingDto> {
  const { data } = await api.post<MeterReadingDto>(base(meterId), dto);
  return data;
}

async function removeReading(meterId: number, id: number): Promise<void> {
  await api.delete(`${base(meterId)}/${id}`);
}

export function useMeterReadings(meterId: number | undefined, filters: ReadingFilters) {
  return useQuery({
    queryKey: meterReadingKeys.list(meterId ?? -1, filters),
    queryFn: () => fetchList(meterId as number, filters),
    enabled: meterId !== undefined,
  });
}

export function useLatestReading(meterId: number | undefined) {
  return useQuery({
    queryKey: meterReadingKeys.latest(meterId ?? -1),
    queryFn: () => fetchLatest(meterId as number),
    enabled: meterId !== undefined,
    retry: false,
  });
}

export function useReadingsTotal(meterId: number | undefined, from: string, to: string) {
  return useQuery({
    queryKey: meterReadingKeys.total(meterId ?? -1, from, to),
    queryFn: () => fetchTotal(meterId as number, from, to),
    enabled: meterId !== undefined && !!from && !!to,
  });
}

export function useAddReading(meterId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<MeterReadingDto, 'id' | 'meterId'>) => addReading(meterId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: meterReadingKeys.all });
      qc.invalidateQueries({ queryKey: ['meters', 'detail', meterId] });
    },
  });
}

export function useDeleteReading(meterId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeReading(meterId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: meterReadingKeys.all }),
  });
}
