/** BNDesign: разное отображение для одного и нескольких нарушителей */
export function formatViolatorsDisplay(raw: string): string {
  const value = raw?.trim();
  if (!value || value === '—') return '—';

  const parts = value.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return value;

  return parts.join(', ');
}

export function isMultipleViolators(raw: string): boolean {
  const value = raw?.trim();
  if (!value || value === '—') return false;
  return /[,;]/.test(value) || /\s+и\s+/i.test(value);
}
