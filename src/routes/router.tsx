import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ProfilePage } from '@/pages/auth/ProfilePage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EquipmentListPage } from '@/pages/equipment/EquipmentListPage';
import { EquipmentDetailPage } from '@/pages/equipment/EquipmentDetailPage';
import { EquipmentFormPage } from '@/pages/equipment/EquipmentFormPage';
import { LocationListPage } from '@/pages/locations/LocationListPage';
import { LocationFormPage } from '@/pages/locations/LocationFormPage';
import { MeterListPage } from '@/pages/meters/MeterListPage';
import { MeterDetailPage } from '@/pages/meters/MeterDetailPage';
import { MeterFormPage } from '@/pages/meters/MeterFormPage';
import { SparePartListPage } from '@/pages/spareParts/SparePartListPage';
import { MaterialListPage } from '@/pages/materials/MaterialListPage';
import { TaskListPage } from '@/pages/tasks/TaskListPage';
import { TaskFormPage } from '@/pages/tasks/TaskFormPage';
import { DefectListPage } from '@/pages/defects/DefectListPage';
import { DefectDetailPage } from '@/pages/defects/DefectDetailPage';
import { DefectFormPage } from '@/pages/defects/DefectFormPage';
import { UserListPage } from '@/pages/users/UserListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },

          { path: '/equipment', element: <EquipmentListPage /> },
          { path: '/equipment/new', element: <EquipmentFormPage /> },
          { path: '/equipment/:id', element: <EquipmentDetailPage /> },
          { path: '/equipment/:id/edit', element: <EquipmentFormPage /> },

          { path: '/locations', element: <LocationListPage /> },
          { path: '/locations/new', element: <LocationFormPage /> },
          { path: '/locations/:id/edit', element: <LocationFormPage /> },

          { path: '/meters', element: <MeterListPage /> },
          { path: '/meters/new', element: <MeterFormPage /> },
          { path: '/meters/:id', element: <MeterDetailPage /> },
          { path: '/meters/:id/edit', element: <MeterFormPage /> },

          { path: '/defects', element: <DefectListPage /> },
          { path: '/defects/new', element: <DefectFormPage /> },
          { path: '/defects/:id', element: <DefectDetailPage /> },
          { path: '/defects/:id/edit', element: <DefectFormPage /> },

          { path: '/spare-parts', element: <SparePartListPage /> },
          { path: '/materials', element: <MaterialListPage /> },

          { path: '/tasks', element: <TaskListPage /> },
          { path: '/tasks/new', element: <TaskFormPage /> },
          { path: '/tasks/:id/edit', element: <TaskFormPage /> },

          { path: '/users', element: <UserListPage /> },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
