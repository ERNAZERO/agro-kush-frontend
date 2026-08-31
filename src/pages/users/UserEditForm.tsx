import { useState, type FormEvent } from 'react';
import { useDeleteUser, useUpdateUser } from '@/api/users';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toApiError } from '@/utils/apiError';
import { ROLE_LABELS, ROLE_VALUES, type Role } from '@/types/enums';
import type { UserDto } from '@/types/dto';

const roleOptions = ROLE_VALUES.map((v) => ({ value: v, label: ROLE_LABELS[v] }));

export function UserEditForm({ user, onDone }: { user: UserDto; onDone: () => void }) {
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [role, setRole] = useState<Role>(user.role);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateMutation.mutateAsync({ ...user, firstName, lastName, role });
      onDone();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(user.id);
      onDone();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <InlineError message={error} />}
        <p className="text-sm text-ink-400">{user.email}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Select label="Role" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value as Role)} />

        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={onDone}>
              Cancel
            </Button>
          </div>
          <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete user"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
