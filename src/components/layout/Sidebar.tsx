import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/enums';

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const items: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/equipment', label: 'Equipment' },
  { to: '/locations', label: 'Locations' },
  { to: '/meters', label: 'Meters' },
  { to: '/defects', label: 'Defects' },
  { to: '/spare-parts', label: 'Spare parts' },
  { to: '/materials', label: 'Materials' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/users', label: 'Users', adminOnly: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const visibleItems = items.filter((item) => !item.adminOnly || user?.role === Role.ADMIN);

  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-4">
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
