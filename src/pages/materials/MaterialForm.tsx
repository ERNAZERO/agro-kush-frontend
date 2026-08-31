import { useState, type FormEvent } from 'react';
import { useCreateMaterial, useDeleteMaterial, useUpdateMaterial } from '@/api/materials';
import { useEquipmentList } from '@/api/equipment';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { toApiError } from '@/utils/apiError';
import type { MaterialDto } from '@/types/dto';

export function MaterialForm({ initial, onDone }: { initial?: MaterialDto; onDone: () => void }) {
  const isEdit = !!initial;
  const equipmentList = useEquipmentList({ size: 100 });
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const [fileName, setFileName] = useState(initial?.fileName ?? '');
  const [contentType, setContentType] = useState(initial?.contentType ?? '');
  const [sizeBytes, setSizeBytes] = useState(initial?.sizeBytes != null ? String(initial.sizeBytes) : '');
  const [equipmentId, setEquipmentId] = useState(initial?.equipmentId ? String(initial.equipmentId) : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      fileName,
      contentType,
      sizeBytes: sizeBytes ? Number(sizeBytes) : null,
      equipmentId: equipmentId ? Number(equipmentId) : null,
    };
    try {
      if (isEdit && initial) {
        await updateMutation.mutateAsync({ ...initial, ...payload });
      } else {
        await createMutation.mutateAsync({ ...payload, downloadUrl: null, defectId: null });
      }
      onDone();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync(initial.id);
      onDone();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <InlineError message={error} />}
      <Input label="File name" required value={fileName} onChange={(e) => setFileName(e.target.value)} />
      <Input
        label="Content type"
        required
        placeholder="e.g. image/png"
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
      />
      <Input label="Size (bytes)" type="number" min={0} value={sizeBytes} onChange={(e) => setSizeBytes(e.target.value)} />
      <Select
        label="Equipment (tech passport)"
        placeholder="None"
        options={(equipmentList.data?.content ?? []).map((eq) => ({ value: String(eq.id), label: eq.equipmentName }))}
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
        {isEdit && (
          <Button type="button" variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
