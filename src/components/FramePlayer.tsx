import { useCallback, useEffect, useState } from 'react';
import type { DetectionItem, DetectionRecord, Frame } from '@/types';
import { formatDateTime } from '@/utils/format';

interface Props {
  frames: Frame[];
  keyFrameIndex: number;
  detectionsMap: Record<string, DetectionRecord[]>;
  sidePanel?: React.ReactNode;
}

export function FramePlayer({ frames, keyFrameIndex, detectionsMap, sidePanel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(keyFrameIndex);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    setCurrentIndex(keyFrameIndex);
  }, [keyFrameIndex, frames]);

  const current = frames[currentIndex];
  const detections = getFlatDetections(detectionsMap[current?.id] ?? []);

  const step = useCallback((dir: number) => {
    setPlaying(false);
    setCurrentIndex((i) => Math.max(0, Math.min(frames.length - 1, i + dir)));
  }, [frames.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => {
        const next = i + direction;
        if (next < 0 || next >= frames.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [playing, direction, frames.length]);

  const progress = frames.length > 1 ? ((currentIndex + 1) / frames.length) * 100 : 100;
  const keyProgress = frames.length > 1 ? ((keyFrameIndex + 1) / frames.length) * 100 : 50;

  return (
    <div className="player-layout">
      <div className="player-main">
        <div className="frame-wrapper">
          <div className="time-display">
            <div><i className="bi bi-camera-video" /> {formatDateTime(current?.recorded_at)}</div>
            <div><i className="bi bi-database" /> {formatDateTime(current?.received_at)}</div>
          </div>
          <div className="frame-placeholder">
            {current?.frame_url ? (
              <img src={current.frame_url} alt="Кадр" className="frame-img" />
            ) : (
              <span>Превью кадра (frame_url с бэкенда)</span>
            )}
          </div>
        </div>

        <div className="player-footer">
          <div className="player-controls">
            <button type="button" onClick={() => { setDirection(-1); setPlaying((p) => !p || direction !== -1); }} title="Назад">
              <i className="bi bi-skip-backward-fill" />
            </button>
            <button type="button" onClick={() => step(-1)} title="-1 кадр">
              <i className="bi bi-caret-left-fill" />
            </button>
            <button type="button" onClick={() => setPlaying(false)} title="Стоп">
              <i className="bi bi-stop-fill" />
            </button>
            <button type="button" onClick={() => step(1)} title="+1 кадр">
              <i className="bi bi-caret-right-fill" />
            </button>
            <button type="button" onClick={() => { setDirection(1); setPlaying((p) => !p || direction !== 1); }} title="Вперёд">
              <i className="bi bi-skip-forward-fill" />
            </button>
            <button type="button" onClick={() => { setPlaying(false); setCurrentIndex(keyFrameIndex); }} title="Ключевой кадр">
              <i className={`bi bi-star${currentIndex === keyFrameIndex ? '-fill text-warning' : ''}`} />
            </button>
          </div>
          <div
            className="progress-bar-custom"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setPlaying(false);
              setCurrentIndex(Math.min(frames.length - 1, Math.floor(pct * frames.length)));
            }}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="key-frame-marker" style={{ left: `${keyProgress}%` }} />
          </div>
          <span className="frame-counter">{currentIndex + 1} / {frames.length}</span>
        </div>

        {detections.length > 0 && (
          <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>
            Детекций на кадре: {detections.length}
          </p>
        )}
      </div>

      {sidePanel && <div className="player-side">{sidePanel}</div>}
    </div>
  );
}

function getFlatDetections(records: DetectionRecord[]): DetectionItem[] {
  const items: DetectionItem[] = [];
  for (const r of records) {
    for (const d of r.detection_log?.detections ?? []) {
      items.push(d);
    }
  }
  return items;
}
