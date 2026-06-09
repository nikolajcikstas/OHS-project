import type { DetectionItem, DetectionRecord } from '@/types';

export function flattenDetections(records: DetectionRecord[]): DetectionItem[] {
  const items: DetectionItem[] = [];
  for (const r of records) {
    for (const d of r.detection_log?.detections ?? []) {
      items.push(d);
    }
  }
  return items;
}
