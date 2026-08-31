import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteEquipment, useEquipment } from '@/api/equipment';
import { useLocation } from '@/api/locations';
import { useDefectsByEquipment } from '@/api/defects';
import { useMetersByEquipment } from '@/api/meters';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { QueryState } from '@/components/common/QueryState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InlineError } from '@/components/common/ErrorMessage';
import { toApiError } from '@/utils/apiError';
import { formatDate } from '@/utils/format';
import { EQUIPMENT_STATUS_LABELS } from '@/types/enums';

export function EquipmentDetailPage() {
  const { id } = useParams();
  const equipmentId = Number(id);
  const navigate = useNavigate();

  const query = useEquipment(equipmentId);
  const location = useLocation(query.data?.locationId ?? undefined);
  const defects = useDefectsByEquipment(equipmentId);
  const meters = useMetersByEquipment(equipmentId);
  const deleteMutation = useDeleteEquipment();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(equipmentId);
      navigate('/equipment');
    } catch (err) {
      setDeleteError(toApiError(err).message);
    }
  };

  return (
    <QueryState
      isLoading={query.isLoading}
      isError={query.isError}
      errorMessage={query.error ? toApiError(query.error).message : undefined}
      onRetry={() => query.refetch()}
    >
      {query.data && (
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title={query.data.equipmentName}
            description={location.data ? `Located at ${location.data.name}` : undefined}
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigate(`/equipment/${equipmentId}/edit`)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              </div>
            }
          />

          {deleteError && (
            <div className="mb-4">
              <InlineError message={deleteError} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-ink-700">Details</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <Row label="Model" value={query.data.model || '—'} />
                <Row label="Manufacturer" value={query.data.manufacturer || '—'} />
                <Row label="Installed" value={formatDate(query.data.installationDate)} />
                <Row
                  label="Status"
                  value={
                    query.data.equipmentStatus ? (
                      <Badge tone={query.data.equipmentStatus === 'OUT_OF_SERVICE' ? 'danger' : 'brand'}>
                        {EQUIPMENT_STATUS_LABELS[query.data.equipmentStatus]}
                      </Badge>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row
                  label="Location"
                  value={
                    query.data.locationId ? (
                      <Link to={`/locations/${query.data.locationId}`} className="text-brand-600 hover:underline">
                        {location.data?.name ?? `#${query.data.locationId}`}
                      </Link>
                    ) : (
                      '—'
                    )
                  }
                />
              </dl>
            </Card>

            <Card>
              <h2 className="mb-3 text-sm font-semibold text-ink-700">Meters</h2>
              <QueryState isLoading={meters.isLoading} isError={meters.isError} isEmpty={meters.data?.length === 0} emptyTitle="No meters">
                <ul className="flex flex-col gap-2 text-sm">
                  {meters.data?.map((m) => (
                    <li key={m.id}>
                      <Link to={`/meters/${m.id}`} className="text-brand-600 hover:underline">
                        {m.counterName}
                      </Link>
                      <span className="ml-2 text-ink-400">{m.currentValue}</span>
                    </li>
                  ))}
                </ul>
              </QueryState>
            </Card>

            <Card className="sm:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-ink-700">Defects</h2>
              <QueryState
                isLoading={defects.isLoading}
                isError={defects.isError}
                isEmpty={defects.data?.length === 0}
                emptyTitle="No defects reported"
              >
                <ul className="flex flex-col gap-2 text-sm">
                  {defects.data?.map((d) => (
                    <li key={d.id}>
                      <Link to={`/defects/${d.id}`} className="text-brand-600 hover:underline">
                        {d.defectName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </QueryState>
            </Card>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            title="Delete equipment"
            message={`Are you sure you want to delete "${query.data.equipmentName}"? This cannot be undone.`}
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </QueryState>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-right text-ink-800">{value}</dd>
    </div>
  );
}
