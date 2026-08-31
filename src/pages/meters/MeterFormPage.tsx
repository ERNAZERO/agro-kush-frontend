import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateMeter, useMeter, useUpdateMeter } from '@/api/meters';
import { useEquipmentList } from '@/api/equipment';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/TextArea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { Loader } from '@/components/common/Loader';
import { toApiError } from '@/utils/apiError';

interface FormState {
  counterName: string;
  description: string;
  currentValue: string;
  readingInterval: string;
  equipmentId: string;
}

const emptyForm: FormState = {
  counterName: '',
  description: '',
  currentValue: '0',
  readingInterval: '1',
  equipmentId: '',
};

export function MeterFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const meterId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const existing = useMeter(meterId);
  const equipmentList = useEquipmentList({ size: 100 });
  const createMutation = useCreateMeter();
  const updateMutation = useUpdateMeter();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setForm({
        counterName: existing.data.counterName,
        description: existing.data.description ?? '',
        currentValue: String(existing.data.currentValue),
        readingInterval: String(existing.data.readingInterval),
        equipmentId: existing.data.equipmentId ? String(existing.data.equipmentId) : '',
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <Loader />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      counterName: form.counterName,
      description: form.description || null,
      currentValue: Number(form.currentValue) || 0,
      readingInterval: Number(form.readingInterval) || 1,
      equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
    };

    try {
      if (isEdit && existing.data) {
        const updated = await updateMutation.mutateAsync({ ...existing.data, ...payload });
        navigate(`/meters/${updated.id}`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        navigate(`/meters/${created.id}`);
      }
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={isEdit ? 'Edit meter' : 'New meter'} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <InlineError message={error} />}
          <Input
            label="Counter name"
            required
            value={form.counterName}
            onChange={(e) => setForm((f) => ({ ...f, counterName: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current value"
              type="number"
              step="any"
              min={0}
              value={form.currentValue}
              onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
            />
            <Input
              label="Reading interval"
              type="number"
              min={1}
              value={form.readingInterval}
              onChange={(e) => setForm((f) => ({ ...f, readingInterval: e.target.value }))}
            />
          </div>
          <Select
            label="Equipment"
            placeholder="No equipment"
            options={(equipmentList.data?.content ?? []).map((eq) => ({
              value: String(eq.id),
              label: eq.equipmentName,
            }))}
            value={form.equipmentId}
            onChange={(e) => setForm((f) => ({ ...f, equipmentId: e.target.value }))}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create meter'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
