import type { Discovery } from '@/types/discovery';

/** Формат локации на главной: «Цех №1 • Cam005 • Камера у входа» */
export function formatHomeLocationLine(item: Discovery): string {
  if (item.locationLine) return item.locationLine;
  const cam = item.cameraId.replace(/^CAM/i, 'Cam');
  return `${item.zone} • ${cam} • ${item.cameraName}`;
}

export function isUrgentRelative(text: string): boolean {
  return text.includes('🔥');
}
