import type { PageParams } from '@/types/api';

// Spring's Pageable resolver expects page (0-based), size and sort=field,dir.
// This strips undefined/empty values so unset filters don't get sent as e.g. name=.
export function buildPageParams<T extends PageParams>(filters: T): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value;
  }
  if (params.page === undefined) params.page = 0;
  if (params.size === undefined) params.size = 20;
  return params;
}
