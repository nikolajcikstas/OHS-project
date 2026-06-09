export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU');
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU');
}

export function violationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    New: 'Необходима верификация',
    Verified: 'Подтверждено',
    Rejected: 'Ложное срабатывание',
  };
  return map[status] ?? status;
}

export function violationStatusBadge(status: string): string {
  const map: Record<string, string> = {
    New: 'bg-primary',
    Verified: 'bg-success',
    Rejected: 'bg-secondary',
  };
  return map[status] ?? 'bg-secondary';
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} час(ов) назад`;
  return `${Math.floor(diffMins / 1440)} дн(ей) назад`;
}

export function formatFutureTime(value?: string | null): string {
  if (!value) return '—';
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins <= 0) return 'Скоро';
  if (diffMins < 60) return `через ${diffMins} мин`;
  if (diffMins < 1440) return `через ${Math.floor(diffMins / 60)} час(ов)`;
  return `через ${Math.floor(diffMins / 1440)} дн(ей)`;
}
