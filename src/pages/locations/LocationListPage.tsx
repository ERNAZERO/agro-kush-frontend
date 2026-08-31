import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationList } from '@/api/locations';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { toApiError } from '@/utils/apiError';
import type { LocationDto } from '@/types/dto';

export function LocationListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);

  const query = useLocationList({ name: debouncedName || undefined, page, size: 20 });

  const columns: Column<LocationDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.name}</span> },
    { header: 'Address', cell: (row) => row.address || '—' },
    { header: 'Equipment', cell: (row) => row.equipmentsId.length },
    { header: 'Tasks', cell: (row) => row.tasksId.length },
  ];

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Sites and areas where equipment and tasks are based."
        action={<Button onClick={() => navigate('/locations/new')}>+ New location</Button>}
      />

      <div className="mb-4">
        <Input
          placeholder="Search by name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(0);
          }}
          className="sm:max-w-xs"
        />
      </div>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        errorMessage={query.error ? toApiError(query.error).message : undefined}
        onRetry={() => query.refetch()}
        isEmpty={query.data?.content.length === 0}
        emptyTitle="No locations found"
      >
        {query.data && (
          <>
            <Table
              columns={columns}
              rows={query.data.content}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/locations/${row.id}/edit`)}
            />
            <Pagination
              page={query.data.number}
              totalPages={query.data.totalPages}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
            />
          </>
        )}
      </QueryState>
    </div>
  );
}
