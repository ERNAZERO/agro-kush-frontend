import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDefect, useDeleteDefect, useUpdateDefectStatus } from '@/api/defects';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { QueryState } from '@/components/common/QueryState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InlineError } from '@/components/common/ErrorMessage';
import { toApiError } from '@/utils/apiError';
import { DEFECT_STATUS_LABELS, DEFECT_STATUS_VALUES, type DefectStatus } from '@/types/enums';

const statusOptions = DEFECT_STATUS_VALUES.map((v) => ({ value: v, label: DEFECT_STATUS_LABELS[v] }));

export function DefectDetailPage() {
  const { id } = useParams();
  const defectId = Number(id);
  const navigate = useNavigate();

  const query = useDefect(defectId);
  const deleteMutation = useDeleteDefect();
  const statusMutation = useUpdateDefectStatus();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<DefectStatus | ''>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(defectId);
      navigate('/defects');
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setStatusMessage(null);
    setError(null);
    try {
      await statusMutation.mutateAsync({ id: defectId, status: newStatus });
      setStatusMessage(`Status updated to "${DEFECT_STATUS_LABELS[newStatus]}".`);
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {query.data && (
        <div className="mx-auto max-w-2xl">
          <PageHeader
            title={query.data.defectName}
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigate(`/defects/${defectId}/edit`)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              </div>
            }
          />

          {error && (
            <div className="mb-4">
              <InlineError message={error} />
            </div>
          )}

          <Card className="mb-4">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Details</h2>
            <p className="text-sm text-ink-800">{query.data.description || 'No description provided.'}</p>
            {query.data.equipmentId && (
              <p className="mt-3 text-sm">
                Equipment:{' '}
                <Link to={`/equipment/${query.data.equipmentId}`} className="text-brand-600 hover:underline">
                  #{query.data.equipmentId}
                </Link>
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink-700">Update status</h2>
            <p className="mb-3 text-xs text-ink-400">
              The backend doesn&apos;t return the defect&apos;s current status in its DTO, so it can&apos;t be
              displayed here — you can still set a new one.
            </p>
            {statusMessage && <p className="mb-3 text-sm text-brand-700">{statusMessage}</p>}
            <div className="flex items-end gap-3">
              <div className="w-56">
                <Select
                  options={statusOptions}
                  placeholder="Choose status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as DefectStatus | '')}
                />
              </div>
              <Button onClick={handleStatusChange} isLoading={statusMutation.isPending} disabled={!newStatus}>
                Apply
              </Button>
            </div>
          </Card>

          <ConfirmDialog
            open={confirmOpen}
            title="Delete defect"
            message={`Are you sure you want to delete "${query.data.defectName}"? This cannot be undone.`}
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </QueryState>
  );
}
