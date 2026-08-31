import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateDefect, useDefect, useUpdateDefect } from '@/api/defects';
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
  defectName: string;
  description: string;
  equipmentId: string;
}

const emptyForm: FormState = { defectName: '', description: '', equipmentId: '' };

export function DefectFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const defectId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const existing = useDefect(defectId);
  const equipmentList = useEquipmentList({ size: 100 });
  const createMutation = useCreateDefect();
  const updateMutation = useUpdateDefect();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setForm({
        defectName: existing.data.defectName,
        description: existing.data.description ?? '',
        equipmentId: existing.data.equipmentId ? String(existing.data.equipmentId) : '',
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <Loader />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      defectName: form.defectName,
      description: form.description || null,
      equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
    };

    try {
      if (isEdit && existing.data) {
        const updated = await updateMutation.mutateAsync({ ...existing.data, ...payload });
        navigate(`/defects/${updated.id}`);
      } else {
        const created = await createMutation.mutateAsync({ ...payload, imageIds: [] });
        navigate(`/defects/${created.id}`);
      }
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={isEdit ? 'Edit defect' : 'Report defect'} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <InlineError message={error} />}
          <Input
            label="Defect name"
            required
            value={form.defectName}
            onChange={(e) => setForm((f) => ({ ...f, defectName: e.target.value }))}
          />
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
              {isEdit ? 'Save changes' : 'Report defect'}
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
