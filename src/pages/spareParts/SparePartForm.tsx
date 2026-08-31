import { useState, type FormEvent } from 'react';
import { useCreateSparePart, useDeleteSparePart, useUpdateSparePart } from '@/api/spareParts';
import { useEquipmentList } from '@/api/equipment';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { toApiError } from '@/utils/apiError';
import type { SparePartDto } from '@/types/dto';

export function SparePartForm({ initial, onDone }: { initial?: SparePartDto; onDone: () => void }) {
  const isEdit = !!initial;
  const equipmentList = useEquipmentList({ size: 100 });
  const createMutation = useCreateSparePart();
  const updateMutation = useUpdateSparePart();
  const deleteMutation = useDeleteSparePart();

  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 0));
  const [equipmentIds, setEquipmentIds] = useState<number[]>(initial?.equipmentIds ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggleEquipment = (id: number) => {
    setEquipmentIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && initial) {
        await updateMutation.mutateAsync({
          id: initial.id,
          name,
          quantity: Number(quantity) || 0,
          equipmentIds,
        });
      } else {
        await createMutation.mutateAsync({ name, quantity: Number(quantity) || 0, equipmentIds });
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
      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-700">Used on equipment</p>
        <div className="max-h-40 overflow-y-auto rounded-md border border-ink-200 p-2">
          {(equipmentList.data?.content ?? []).map((eq) => (
            <label key={eq.id} className="flex items-center gap-2 py-1 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={equipmentIds.includes(eq.id)}
                onChange={() => toggleEquipment(eq.id)}
                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              {eq.equipmentName}
            </label>
          ))}
          {equipmentList.data?.content.length === 0 && <p className="py-1 text-sm text-ink-400">No equipment yet</p>}
        </div>
      </div>

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
