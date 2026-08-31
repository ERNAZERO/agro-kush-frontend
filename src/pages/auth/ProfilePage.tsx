import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUser } from '@/api/users';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { InlineError } from '@/components/common/ErrorMessage';
import { ROLE_LABELS } from '@/types/enums';
import { toApiError } from '@/utils/apiError';

export function ProfilePage() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateUser.mutateAsync({ ...user, firstName, lastName });
      setSaved(true);
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="My profile" description="Your account details." />
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-ink-500">{user.email}</p>
          <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <InlineError message={error} />}
          {saved && <p className="text-sm text-brand-700">Profile updated.</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Button type="submit" isLoading={updateUser.isPending} className="self-start">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
