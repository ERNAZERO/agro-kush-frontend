import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateEquipment, useEquipment, useUpdateEquipment } from '@/api/equipment';
import { useLocationList } from '@/api/locations';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { Loader } from '@/components/common/Loader';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_VALUES, type EquipmentStatus } from '@/types/enums';
import { toApiError } from '@/utils/apiError';
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '@/utils/format';

const statusOptions = EQUIPMENT_STATUS_VALUES.map((v) => ({ value: v, label: EQUIPMENT_STATUS_LABELS[v] }));

interface FormState {
  equipmentName: string;
  model: string;
  manufacturer: string;
  installationDate: string;
  equipmentStatus: EquipmentStatus | '';
  locationId: string;
}

const emptyForm: FormState = {
  equipmentName: '',
  model: '',
  manufacturer: '',
  installationDate: '',
  equipmentStatus: '',
  locationId: '',
};

export function EquipmentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const equipmentId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const existing = useEquipment(equipmentId);
  const locations = useLocationList({ size: 100 });
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setForm({
        equipmentName: existing.data.equipmentName,
        model: existing.data.model ?? '',
        manufacturer: existing.data.manufacturer ?? '',
        installationDate: toDateTimeLocalValue(existing.data.installationDate),
        equipmentStatus: existing.data.equipmentStatus ?? '',
        locationId: existing.data.locationId ? String(existing.data.locationId) : '',
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <Loader />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      equipmentName: form.equipmentName,
      model: form.model || null,
      manufacturer: form.manufacturer || null,
      installationDate: fromDateTimeLocalValue(form.installationDate) ?? null,
      equipmentStatus: form.equipmentStatus || null,
      locationId: form.locationId ? Number(form.locationId) : null,
    };

    try {
      if (isEdit && existing.data) {
        const updated = await updateMutation.mutateAsync({
          ...existing.data,
          ...payload,
        });
        navigate(`/equipment/${updated.id}`);
      } else {
        const created = await createMutation.mutateAsync({
          ...payload,
          taskIds: [],
          sparePartIds: [],
          defectIds: [],
          meterIds: [],
          techPassportId: null,
        });
        navigate(`/equipment/${created.id}`);
      }
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={isEdit ? 'Edit equipment' : 'New equipment'} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <InlineError message={error} />}
          <Input
            label="Equipment name"
            required
            value={form.equipmentName}
            onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Model"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            />
            <Input
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              placeholder="Not set"
              options={statusOptions}
              value={form.equipmentStatus}
              onChange={(e) => setForm((f) => ({ ...f, equipmentStatus: e.target.value as EquipmentStatus | '' }))}
            />
            <Input
              label="Installation date"
              type="datetime-local"
              value={form.installationDate}
              onChange={(e) => setForm((f) => ({ ...f, installationDate: e.target.value }))}
            />
          </div>
          <Select
            label="Location"
            placeholder="No location"
            options={(locations.data?.content ?? []).map((loc) => ({ value: String(loc.id), label: loc.name }))}
            value={form.locationId}
            onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
          />

          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create equipment'}
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
