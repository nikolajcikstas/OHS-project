import type { DetectionItem, DetectionRecord, Frame, FrameDetailResponse } from '@/types';

export const DISCOVERY_FRAME_BEFORE = 30;
export const DISCOVERY_FRAME_AFTER = 30;
export const DISCOVERY_FRAME_TOTAL = DISCOVERY_FRAME_BEFORE + 1 + DISCOVERY_FRAME_AFTER;

const SOURCE_W = 1168;
const SOURCE_H = 654;

/** Индексы кадров с детекцией (плато на таймлайне) */
const EVENT_START_OFFSET = -2;
const EVENT_END_OFFSET = 8;

/** Заглушка: URL кадра в пакете (позже бэкенд отдаст свои URL) */
export function discoveryFrameUrl(index: number): string {
  return `/assets/frames/discovery/frame-${String(index).padStart(3, '0')}.jpg`;
}

function frameId(discoveryId: string, index: number) {
  return `${discoveryId}-f${String(index).padStart(3, '0')}`;
}

function shiftTime(iso: string, seconds: number): string {
  const d = new Date(iso);
  d.setSeconds(d.getSeconds() + seconds);
  return d.toISOString();
}

function formatOverlayTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Заглушка координат рамок — позже заменится ответом бэкенда (bbox: [x, y, w, h]).
 * На кадрах события может быть несколько рамок.
 */
function stubDetectionBoxes(frameIndex: number, keyIndex: number): DetectionItem[] {
  const eventStart = keyIndex + EVENT_START_OFFSET;
  const eventEnd = keyIndex + EVENT_END_OFFSET;
  if (frameIndex < eventStart || frameIndex > eventEnd) return [];

  const offset = frameIndex - keyIndex;
  const boxes: DetectionItem[] = [
    {
      class: 'no_helmet',
      confidence: Math.min(0.97, 0.9 + Math.abs(offset) * 0.008),
      bbox: [372 + offset * 14, 148 + offset * 3, 112, 268],
    },
  ];

  if (frameIndex >= keyIndex && frameIndex <= keyIndex + 6) {
    boxes.push({
      class: 'person',
      confidence: 0.83,
      bbox: [512 + offset * 10, 188, 98, 232],
    });
  }

  if (frameIndex === keyIndex + 1 || frameIndex === keyIndex + 4) {
    boxes.push({
      class: 'no_vest',
      confidence: 0.71,
      bbox: [388 + offset * 12, 292, 88, 132],
    });
  }

  return boxes;
}

export function buildDiscoveryFrameDetail(
  discoveryId: string,
  cameraId: string,
  cameraName: string,
  objectName: string,
  keyRecordedAt: string,
): FrameDetailResponse | undefined {
  const keyTime = new Date(keyRecordedAt);
  const keyIso = Number.isNaN(keyTime.getTime())
    ? '2027-03-13T07:53:35.000Z'
    : keyTime.toISOString();

  const allFrames: Frame[] = Array.from({ length: DISCOVERY_FRAME_TOTAL }, (_, i) => {
    const offsetSec = i - DISCOVERY_FRAME_BEFORE;
    const recorded = shiftTime(keyIso, offsetSec);
    const stubBoxes = stubDetectionBoxes(i, DISCOVERY_FRAME_BEFORE);
    return {
      id: frameId(discoveryId, i),
      camera: 1,
      camera_name: cameraName,
      object_name: objectName,
      frame_url: discoveryFrameUrl(i),
      received_at: recorded,
      recorded_at: recorded,
      is_important: i === DISCOVERY_FRAME_BEFORE,
      detections_count: stubBoxes.length,
    };
  });

  const keyFrame = allFrames[DISCOVERY_FRAME_BEFORE];
  const neighbors = [
    ...allFrames.slice(0, DISCOVERY_FRAME_BEFORE),
    ...allFrames.slice(DISCOVERY_FRAME_BEFORE + 1),
  ];

  return {
    frame: keyFrame,
    neighbors,
    neighbors_info: {
      total: neighbors.length,
      expected: DISCOVERY_FRAME_BEFORE + DISCOVERY_FRAME_AFTER,
      before: DISCOVERY_FRAME_BEFORE,
      after: DISCOVERY_FRAME_AFTER,
      is_complete: true,
    },
  };
}

export function buildDiscoveryDetectionsMap(frames: Frame[], keyIndex: number): Record<string, DetectionRecord[]> {
  const map: Record<string, DetectionRecord[]> = {};

  frames.forEach((frame, idx) => {
    const boxes = stubDetectionBoxes(idx, keyIndex);
    if (boxes.length === 0) return;

    map[frame.id] = [
      {
        id: `det-${frame.id}`,
        received_frame: frame.id,
        ml_model_name: 'PPE_312_yolo12_l',
        detection_log: { detections: boxes },
        detected_at: frame.received_at,
      },
    ];
  });

  return map;
}

export function getDiscoveryEventRange(keyIndex: number) {
  return {
    start: keyIndex + EVENT_START_OFFSET,
    end: keyIndex + EVENT_END_OFFSET,
  };
}

export function formatFrameTimestamp(iso?: string | null): string {
  if (!iso) return '—';
  return formatOverlayTime(iso);
}

export const DISCOVERY_FRAME_SOURCE = { width: SOURCE_W, height: SOURCE_H };
