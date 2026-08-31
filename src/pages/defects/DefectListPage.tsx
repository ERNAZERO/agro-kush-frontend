import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDefectList } from '@/api/defects';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { toApiError } from '@/utils/apiError';
import { DEFECT_STATUS_LABELS, DEFECT_STATUS_VALUES, type DefectStatus } from '@/types/enums';
import type { DefectDto } from '@/types/dto';

const statusOptions = DEFECT_STATUS_VALUES.map((v) => ({ value: v, label: DEFECT_STATUS_LABELS[v] }));

export function DefectListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<DefectStatus | ''>('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);

  const query = useDefectList({
    name: debouncedName || undefined,
    defectStatus: status || undefined,
    page,
    size: 20,
  });

  const columns: Column<DefectDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.defectName}</span> },
    { header: 'Description', cell: (row) => row.description || '—' },
    { header: 'Equipment', cell: (row) => (row.equipmentId ? `#${row.equipmentId}` : '—') },
  ];

  return (
    <div>
      <PageHeader
        title="Defects"
        description="Reported issues with equipment."
        action={<Button onClick={() => navigate('/defects/new')}>+ Report defect</Button>}
      />

      <div className="mb-1 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(0);
          }}
          className="sm:max-w-xs"
        />
        <Select
          options={statusOptions}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as DefectStatus | '');
            setPage(0);
          }}
          className="sm:max-w-xs"
        />
      </div>
      <p className="mb-4 text-xs text-ink-400">
        Status filter narrows results server-side, but current status can&apos;t be shown per row — see README
        &quot;Backend issues&quot;.
      </p>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        errorMessage={query.error ? toApiError(query.error).message : undefined}
        onRetry={() => query.refetch()}
        isEmpty={query.data?.content.length === 0}
        emptyTitle="No defects found"
      >
        {query.data && (
          <>
            <Table
              columns={columns}
              rows={query.data.content}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/defects/${row.id}`)}
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
