import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeterList } from '@/api/meters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { toApiError } from '@/utils/apiError';
import type { MeterDto } from '@/types/dto';

export function MeterListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);

  const query = useMeterList({ name: debouncedName || undefined, page, size: 20 });

  const columns: Column<MeterDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.counterName}</span> },
    { header: 'Current value', cell: (row) => row.currentValue },
    { header: 'Reading interval', cell: (row) => row.readingInterval },
    { header: 'Equipment', cell: (row) => (row.equipmentId ? `#${row.equipmentId}` : '—') },
  ];

  return (
    <div>
      <PageHeader
        title="Meters"
        description="Counters attached to equipment and their readings."
        action={<Button onClick={() => navigate('/meters/new')}>+ New meter</Button>}
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
        emptyTitle="No meters found"
      >
        {query.data && (
          <>
            <Table
              columns={columns}
              rows={query.data.content}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/meters/${row.id}`)}
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
