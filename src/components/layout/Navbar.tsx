import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-ink-600 hover:bg-ink-50 md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            AK
          </span>
          <span className="text-sm font-semibold text-ink-900">AgroKush</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <Link to="/profile" className="hidden text-right sm:block">
            <p className="text-sm font-medium text-ink-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-ink-400">{user.email}</p>
          </Link>
        )}
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
