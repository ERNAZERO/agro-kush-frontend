import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteMeter, useMeter } from '@/api/meters';
import {
  useAddReading,
  useDeleteReading,
  useLatestReading,
  useMeterReadings,
  useReadingsTotal,
} from '@/api/meterReadings';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/TextArea';
import { QueryState } from '@/components/common/QueryState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InlineError } from '@/components/common/ErrorMessage';
import { toApiError } from '@/utils/apiError';
import { formatDateTime, fromDateTimeLocalValue } from '@/utils/format';

export function MeterDetailPage() {
  const { id } = useParams();
  const meterId = Number(id);
  const navigate = useNavigate();

  const meter = useMeter(meterId);
  const deleteMutation = useDeleteMeter();
  const latest = useLatestReading(meterId);
  const readings = useMeterReadings(meterId, { size: 10, sort: 'recordedAt,desc' });
  const addReading = useAddReading(meterId);
  const deleteReading = useDeleteReading(meterId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readingValue, setReadingValue] = useState('');
  const [readingNotes, setReadingNotes] = useState('');
  const [readingAt, setReadingAt] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const total = useReadingsTotal(
    meterId,
    fromDateTimeLocalValue(periodFrom) ?? '',
    fromDateTimeLocalValue(periodTo) ?? '',
  );

  const handleAddReading = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    try {
      await addReading.mutateAsync({
        value: Number(readingValue),
        recordedAt: fromDateTimeLocalValue(readingAt) ?? null,
        notes: readingNotes || null,
      });
      setReadingValue('');
      setReadingNotes('');
      setReadingAt('');
    } catch (err) {
      setAddError(toApiError(err).message);
    }
  };

  const handleDeleteMeter = async () => {
    await deleteMutation.mutateAsync(meterId);
    navigate('/meters');
  };

  return (
    <QueryState isLoading={meter.isLoading} isError={meter.isError} onRetry={() => meter.refetch()}>
      {meter.data && (
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title={meter.data.counterName}
            description={meter.data.equipmentId ? `Attached to equipment #${meter.data.equipmentId}` : undefined}
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigate(`/meters/${meterId}/edit`)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              </div>
            }
          />

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs text-ink-400">Current value</p>
              <p className="mt-1 text-2xl font-semibold text-ink-900">{meter.data.currentValue}</p>
            </Card>
            <Card>
              <p className="text-xs text-ink-400">Reading interval</p>
              <p className="mt-1 text-2xl font-semibold text-ink-900">{meter.data.readingInterval}</p>
            </Card>
            <Card>
              <p className="text-xs text-ink-400">Latest reading</p>
              {latest.data ? (
                <>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">{latest.data.value}</p>
                  <p className="text-xs text-ink-400">{formatDateTime(latest.data.recordedAt)}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-ink-400">No readings yet</p>
              )}
            </Card>
          </div>

          <Card className="mb-4">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Total consumption over a period</h2>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                label="From"
                type="datetime-local"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              />
              <Input label="To" type="datetime-local" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
              {total.data !== undefined && periodFrom && periodTo && (
                <p className="pb-2 text-sm font-medium text-ink-800">Total: {total.data}</p>
              )}
            </div>
          </Card>

          <Card className="mb-4">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Add reading</h2>
            <form onSubmit={handleAddReading} className="flex flex-wrap items-end gap-3">
              {addError && (
                <div className="w-full">
                  <InlineError message={addError} />
                </div>
              )}
              <Input
                label="Value"
                type="number"
                step="any"
                required
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                className="w-32"
              />
              <Input
                label="Recorded at"
                type="datetime-local"
                value={readingAt}
                onChange={(e) => setReadingAt(e.target.value)}
                hint="Defaults to now"
              />
              <div className="min-w-[10rem] flex-1">
                <TextArea
                  label="Notes"
                  rows={1}
                  value={readingNotes}
                  onChange={(e) => setReadingNotes(e.target.value)}
                />
              </div>
              <Button type="submit" isLoading={addReading.isPending}>
                Add
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Reading history</h2>
            <QueryState
              isLoading={readings.isLoading}
              isError={readings.isError}
              isEmpty={readings.data?.content.length === 0}
              emptyTitle="No readings recorded"
            >
              <ul className="flex flex-col divide-y divide-ink-50">
                {readings.data?.content.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-ink-800">{r.value}</p>
                      <p className="text-xs text-ink-400">
                        {formatDateTime(r.recordedAt)}
                        {r.notes ? ` · ${r.notes}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteReading.mutate(r.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </QueryState>
          </Card>

          <ConfirmDialog
            open={confirmOpen}
            title="Delete meter"
            message={`Are you sure you want to delete "${meter.data.counterName}"? This cannot be undone.`}
            isLoading={deleteMutation.isPending}
            onConfirm={handleDeleteMeter}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </QueryState>
  );
}
