import { useState } from 'react';
import { useSparePartList } from '@/api/spareParts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { Modal } from '@/components/common/Modal';
import { SparePartForm } from './SparePartForm';
import { toApiError } from '@/utils/apiError';
import type { SparePartDto } from '@/types/dto';

export function SparePartListPage() {
  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);
  const [editing, setEditing] = useState<SparePartDto | 'new' | null>(null);

  const query = useSparePartList({ name: debouncedName || undefined, page, size: 20 });

  const columns: Column<SparePartDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.name}</span> },
    { header: 'Quantity', cell: (row) => row.quantity ?? 0 },
    { header: 'Used on', cell: (row) => (row.equipmentNames.length ? row.equipmentNames.join(', ') : '—') },
  ];

  return (
    <div>
      <PageHeader
        title="Spare parts"
        description="Inventory of replacement parts and where they're used."
        action={<Button onClick={() => setEditing('new')}>+ New spare part</Button>}
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
        emptyTitle="No spare parts found"
      >
        {query.data && (
          <>
            <Table columns={columns} rows={query.data.content} rowKey={(row) => row.id} onRowClick={setEditing} />
            <Pagination
              page={query.data.number}
              totalPages={query.data.totalPages}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
            />
          </>
        )}
      </QueryState>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New spare part' : 'Edit spare part'}
      >
        {editing && (
          <SparePartForm
            initial={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
