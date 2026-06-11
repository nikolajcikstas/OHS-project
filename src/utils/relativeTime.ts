/** BNDesign: «Сейчас = меньше минуты назад», огонёк первые ~5 минут */
export function formatViolationRelative(iso?: string | null, now = Date.now()): string {
  if (!iso) return '—';
  const diffMs = now - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Сейчас 🔥';
  if (diffMins < 5) return `${diffMins} минуты назад 🔥`;
  if (diffMins < 60) return `${diffMins} минуты назад`;
  if (diffMins < 1440) {
    const h = Math.floor(diffMins / 60);
    return h === 1 ? '1 час назад' : `${h} часа назад`;
  }
  const d = Math.floor(diffMins / 1440);
  return d === 1 ? '1 день назад' : `${d} дня назад`;
}
