import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskList } from '@/api/tasks';
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
import { formatDateTime } from '@/utils/format';
import { TASK_STATUS_LABELS, TASK_STATUS_VALUES, type TaskStatus } from '@/types/enums';
import type { TaskDto } from '@/types/dto';

const statusOptions = TASK_STATUS_VALUES.map((v) => ({ value: v, label: TASK_STATUS_LABELS[v] }));

export function TaskListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);

  const query = useTaskList({ name: debouncedName || undefined, status: status || undefined, page, size: 20 });

  const columns: Column<TaskDto>[] = [
    { header: 'Name', cell: (row) => <span className="font-medium text-ink-900">{row.name}</span> },
    {
      header: 'Status',
      cell: (row) => (row.taskStatus ? <Badge tone="brand">{TASK_STATUS_LABELS[row.taskStatus]}</Badge> : '—'),
    },
    { header: 'Start', cell: (row) => formatDateTime(row.startTime) },
    { header: 'End', cell: (row) => formatDateTime(row.endTime) },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Maintenance and repair work scheduled across equipment."
        action={<Button onClick={() => navigate('/tasks/new')}>+ New task</Button>}
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
            setStatus(e.target.value as TaskStatus | '');
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
        emptyTitle="No tasks found"
      >
        {query.data && (
          <>
            <Table
              columns={columns}
              rows={query.data.content}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/tasks/${row.id}/edit`)}
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
