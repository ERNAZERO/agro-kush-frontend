import { useState } from 'react';
import { useMaterialList } from '@/api/materials';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { Modal } from '@/components/common/Modal';
import { MaterialForm } from './MaterialForm';
import { toApiError } from '@/utils/apiError';
import type { MaterialDto } from '@/types/dto';

export function MaterialListPage() {
  const [fileName, setFileName] = useState('');
  const [page, setPage] = useState(0);
  const debounced = useDebouncedValue(fileName);
  const [editing, setEditing] = useState<MaterialDto | 'new' | null>(null);

  const query = useMaterialList({ fileName: debounced || undefined, page, size: 20 });

  const columns: Column<MaterialDto>[] = [
    { header: 'File name', cell: (row) => <span className="font-medium text-ink-900">{row.fileName}</span> },
    { header: 'Content type', cell: (row) => row.contentType },
    { header: 'Size', cell: (row) => (row.sizeBytes != null ? `${row.sizeBytes} B` : '—') },
    { header: 'Defect', cell: (row) => (row.defectId ? `#${row.defectId}` : '—') },
    { header: 'Equipment', cell: (row) => (row.equipmentId ? `#${row.equipmentId}` : '—') },
  ];

  return (
    <div>
      <PageHeader
        title="Materials"
        description="File metadata attached to defects and tech passports."
        action={<Button onClick={() => setEditing('new')}>+ New material</Button>}
      />
      <p className="mb-4 text-xs text-ink-400">
        The backend stores file bytes on the Material entity but never exposes an upload/download endpoint — see
        README &quot;Backend issues&quot;. This page manages metadata only.
      </p>

      <div className="mb-4">
        <Input
          placeholder="Search by file name..."
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
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
        emptyTitle="No materials found"
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

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'New material' : 'Edit material'}>
        {editing && <MaterialForm initial={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
