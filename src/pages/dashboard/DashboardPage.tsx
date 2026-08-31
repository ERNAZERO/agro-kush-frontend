import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEquipmentList } from '@/api/equipment';
import { useLocationList } from '@/api/locations';
import { useMeterList } from '@/api/meters';
import { useDefectList } from '@/api/defects';
import { useSparePartList } from '@/api/spareParts';
import { useTaskList } from '@/api/tasks';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { InlineLoader } from '@/components/common/Loader';

interface SummaryTile {
  label: string;
  to: string;
  totalElements?: number;
  isLoading: boolean;
  isError: boolean;
}

export function DashboardPage() {
  const { user } = useAuth();

  const equipment = useEquipmentList({ page: 0, size: 1 });
  const locations = useLocationList({ page: 0, size: 1 });
  const meters = useMeterList({ page: 0, size: 1 });
  const defects = useDefectList({ page: 0, size: 1 });
  const spareParts = useSparePartList({ page: 0, size: 1 });
  const tasks = useTaskList({ page: 0, size: 1 });

  const tiles: SummaryTile[] = [
    { label: 'Equipment', to: '/equipment', totalElements: equipment.data?.totalElements, isLoading: equipment.isLoading, isError: equipment.isError },
    { label: 'Locations', to: '/locations', totalElements: locations.data?.totalElements, isLoading: locations.isLoading, isError: locations.isError },
    { label: 'Meters', to: '/meters', totalElements: meters.data?.totalElements, isLoading: meters.isLoading, isError: meters.isError },
    { label: 'Open defects', to: '/defects', totalElements: defects.data?.totalElements, isLoading: defects.isLoading, isError: defects.isError },
    { label: 'Spare parts', to: '/spare-parts', totalElements: spareParts.data?.totalElements, isLoading: spareParts.isLoading, isError: spareParts.isError },
    { label: 'Tasks', to: '/tasks', totalElements: tasks.data?.totalElements, isLoading: tasks.isLoading, isError: tasks.isError },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back${user ? `, ${user.firstName}` : ''}`}
        description="Here's an overview of what's happening in AgroKush."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to}>
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{tile.label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">
                {tile.isLoading ? <InlineLoader /> : tile.isError ? '—' : tile.totalElements}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
