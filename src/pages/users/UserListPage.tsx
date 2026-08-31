import { useState } from 'react';
import { useUserList } from '@/api/users';
import { PageHeader } from '@/components/common/PageHeader';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { QueryState } from '@/components/common/QueryState';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { UserEditForm } from './UserEditForm';
import { toApiError } from '@/utils/apiError';
import { ROLE_LABELS } from '@/types/enums';
import type { UserDto } from '@/types/dto';

export function UserListPage() {
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const query = useUserList({ page, size: 20 });

  const columns: Column<UserDto>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-ink-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { header: 'Email', cell: (row) => row.email },
    { header: 'Role', cell: (row) => <Badge tone={row.role === 'ADMIN' ? 'brand' : 'neutral'}>{ROLE_LABELS[row.role]}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Everyone with access to AgroKush." />
      <p className="mb-4 text-xs text-ink-400">
        Accounts are created via registration only — there&apos;s no admin-create-user endpoint on the backend.
      </p>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        errorMessage={query.error ? toApiError(query.error).message : undefined}
        onRetry={() => query.refetch()}
        isEmpty={query.data?.content.length === 0}
        emptyTitle="No users found"
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

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit user">
        {editing && <UserEditForm user={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
