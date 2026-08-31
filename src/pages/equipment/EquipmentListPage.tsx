import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipmentList } from '@/api/equipment';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { Badge } from '@/components/common/Badge';
import { toApiError } from '@/utils/apiError';
import { formatDate } from '@/utils/format';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_VALUES, type EquipmentStatus } from '@/types/enums';
import type { EquipmentDto } from '@/types/dto';

const statusOptions = EQUIPMENT_STATUS_VALUES.map((v) => ({ value: v, label: EQUIPMENT_STATUS_LABELS[v] }));

export function EquipmentListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<EquipmentStatus | ''>('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);

  const query = useEquipmentList({
    name: debouncedName || undefined,
    status: status || undefined,
    page,
    size: 20,
  });

  const columns: Column<EquipmentDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.equipmentName}</span> },
    { header: 'Model', cell: (row) => row.model || '—' },
    { header: 'Manufacturer', cell: (row) => row.manufacturer || '—' },
    {
      header: 'Status',
      cell: (row) =>
        row.equipmentStatus ? (
          <Badge tone={row.equipmentStatus === 'OUT_OF_SERVICE' ? 'danger' : 'brand'}>
            {EQUIPMENT_STATUS_LABELS[row.equipmentStatus]}
          </Badge>
        ) : (
          '—'
        ),
    },
    { header: 'Installed', cell: (row) => formatDate(row.installationDate) },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="All machinery and equipment tracked in AgroKush."
        action={
          <Button onClick={() => navigate('/equipment/new')}>
            + New equipment
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
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
            setStatus(e.target.value as EquipmentStatus | '');
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
        emptyTitle="No equipment found"
        emptyDescription="Try adjusting your filters or add new equipment."
      >
        {query.data && (
          <>
            <Table
              columns={columns}
              rows={query.data.content}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/equipment/${row.id}`)}
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
