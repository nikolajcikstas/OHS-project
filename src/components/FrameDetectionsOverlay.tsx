import type { DetectionItem } from '@/types';

const CLASS_COLORS: Record<string, string> = {
  no_helmet: '#ff4d5a',
  no_vest: '#ff8c42',
  person: '#2154d4',
};

interface Props {
  detections: DetectionItem[];
  sourceWidth?: number;
  sourceHeight?: number;
  visible?: boolean;
}

export function FrameDetectionsOverlay({
  detections,
  sourceWidth = 1168,
  sourceHeight = 654,
  visible = true,
}: Props) {
  if (!visible || detections.length === 0) return null;

  return (
    <div className="frame-detections-overlay" aria-hidden>
      {detections.map((d, i) => {
        const [x, y, w, h] = d.bbox;
        const color = CLASS_COLORS[d.class] ?? '#ff4d5a';
        return (
          <div
            key={`${d.class}-${i}`}
            className="frame-detection-box"
            style={{
              left: `${(x / sourceWidth) * 100}%`,
              top: `${(y / sourceHeight) * 100}%`,
              width: `${(w / sourceWidth) * 100}%`,
              height: `${(h / sourceHeight) * 100}%`,
              borderColor: color,
              background: `${color}22`,
            }}
          >
            <span className="frame-detection-box__label" style={{ background: color }}>
              {d.class} {Math.round(d.confidence * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
