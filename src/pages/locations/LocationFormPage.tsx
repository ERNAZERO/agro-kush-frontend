import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateLocation, useDeleteLocation, useLocation, useUpdateLocation } from '@/api/locations';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/TextArea';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { Loader } from '@/components/common/Loader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toApiError } from '@/utils/apiError';

interface FormState {
  name: string;
  description: string;
  address: string;
  coordinates: string;
}

const emptyForm: FormState = { name: '', description: '', address: '', coordinates: '' };

export function LocationFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const locationId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const existing = useLocation(locationId);
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setForm({
        name: existing.data.name,
        description: existing.data.description ?? '',
        address: existing.data.address ?? '',
        coordinates: existing.data.coordinates ?? '',
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <Loader />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      coordinates: form.coordinates || null,
    };

    try {
      if (isEdit && existing.data) {
        await updateMutation.mutateAsync({ ...existing.data, ...payload });
      } else {
        await createMutation.mutateAsync({ ...payload, equipmentsId: [], tasksId: [] });
      }
      navigate('/locations');
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const handleDelete = async () => {
    if (!locationId) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync(locationId);
      navigate('/locations');
    } catch (err) {
      setError(toApiError(err).message);
      setConfirmOpen(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={isEdit ? 'Edit location' : 'New location'}
        action={
          isEdit ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          ) : undefined
        }
      />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <InlineError message={error} />}
          <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Input
            label="Coordinates"
            placeholder="e.g. 42.8746, 74.5698"
            value={form.coordinates}
            onChange={(e) => setForm((f) => ({ ...f, coordinates: e.target.value }))}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create location'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/locations')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete location"
        message={`Are you sure you want to delete "${form.name}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
