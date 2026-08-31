import type { ReactNode } from 'react';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

// Central place implementing the loading / error / empty / success states the
// prompt requires for every GET-backed view.
export function QueryState({
  isLoading,
  isError,
  errorMessage = 'Failed to load data.',
  onRetry,
  isEmpty,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  children,
}: QueryStateProps) {
  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage message={errorMessage} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  return <>{children}</>;
}
