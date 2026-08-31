import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateTask, useDeleteTask, useTask, useUpdateTask } from '@/api/tasks';
import { useEquipmentList } from '@/api/equipment';
import { useLocationList } from '@/api/locations';
import { useUserList } from '@/api/users';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/TextArea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { InlineError } from '@/components/common/ErrorMessage';
import { Loader } from '@/components/common/Loader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toApiError } from '@/utils/apiError';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/format';
import { TASK_STATUS_LABELS, TASK_STATUS_VALUES, type TaskStatus } from '@/types/enums';

const statusOptions = TASK_STATUS_VALUES.map((v) => ({ value: v, label: TASK_STATUS_LABELS[v] }));

interface FormState {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  taskStatus: TaskStatus | '';
  userId: string;
  locationId: string;
  equipmentIds: number[];
}

const emptyForm: FormState = {
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  taskStatus: '',
  userId: '',
  locationId: '',
  equipmentIds: [],
};

export function TaskFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const taskId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const existing = useTask(taskId);
  const equipmentList = useEquipmentList({ size: 100 });
  const locationList = useLocationList({ size: 100 });
  const userList = useUserList({ size: 100 });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setForm({
        name: existing.data.name,
        description: existing.data.description ?? '',
        startTime: toDateTimeLocalValue(existing.data.startTime),
        endTime: toDateTimeLocalValue(existing.data.endTime),
        taskStatus: existing.data.taskStatus ?? '',
        userId: existing.data.userId ? String(existing.data.userId) : '',
        locationId: existing.data.locationId ? String(existing.data.locationId) : '',
        equipmentIds: existing.data.equipmentIds ?? [],
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <Loader />;

  const toggleEquipment = (eqId: number) => {
    setForm((f) => ({
      ...f,
      equipmentIds: f.equipmentIds.includes(eqId)
        ? f.equipmentIds.filter((x) => x !== eqId)
        : [...f.equipmentIds, eqId],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      startTime: fromDateTimeLocalValue(form.startTime) ?? null,
      endTime: fromDateTimeLocalValue(form.endTime) ?? null,
      taskStatus: form.taskStatus || null,
      userId: form.userId ? Number(form.userId) : null,
      locationId: form.locationId ? Number(form.locationId) : null,
      equipmentIds: form.equipmentIds,
    };

    try {
      if (isEdit && existing.data) {
        await updateMutation.mutateAsync({ ...existing.data, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/tasks');
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    await deleteMutation.mutateAsync(taskId);
    navigate('/tasks');
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={isEdit ? 'Edit task' : 'New task'}
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
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <Input
              label="End"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              placeholder="Not set"
              options={statusOptions}
              value={form.taskStatus}
              onChange={(e) => setForm((f) => ({ ...f, taskStatus: e.target.value as TaskStatus | '' }))}
            />
            <Select
              label="Assigned to"
              placeholder="Unassigned"
              options={(userList.data?.content ?? []).map((u) => ({
                value: String(u.id),
                label: `${u.firstName} ${u.lastName}`,
              }))}
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            />
          </div>
          <Select
            label="Location"
            placeholder="No location"
            options={(locationList.data?.content ?? []).map((loc) => ({ value: String(loc.id), label: loc.name }))}
            value={form.locationId}
            onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Equipment</p>
            <div className="max-h-40 overflow-y-auto rounded-md border border-ink-200 p-2">
              {(equipmentList.data?.content ?? []).map((eq) => (
                <label key={eq.id} className="flex items-center gap-2 py-1 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={form.equipmentIds.includes(eq.id)}
                    onChange={() => toggleEquipment(eq.id)}
                    className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  {eq.equipmentName}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/tasks')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message={`Are you sure you want to delete "${form.name}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
