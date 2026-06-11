import { useCallback, useEffect, useMemo, useState } from 'react';

import { figmaAssets } from '@/assets/figma';

import {
  DISCOVERY_FRAME_SOURCE,
  formatFrameTimestamp,
  getDiscoveryEventRange,
} from '@/api/stubs/discoveryFrames';
import { BufferedFrameImage } from '@/components/BufferedFrameImage';
import { FrameDetectionsOverlay } from '@/components/FrameDetectionsOverlay';
import { usePreloadedFrames } from '@/hooks/usePreloadedFrames';
import { flattenDetections } from '@/utils/detections';

import type { DetectionRecord, Frame } from '@/types';

/** Как в ohs_project/detection_details.html */
const PLAYBACK_FPS = 5;
const PLAYBACK_INTERVAL_MS = 1000 / PLAYBACK_FPS;

interface VideoPlayerProps {
  frames: Frame[];
  keyFrameIndex: number;
  detectionsMap: Record<string, DetectionRecord[]>;
  fallbackTimestamp?: string;
}

function formatTimelineLabel(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function VideoPlayer({
  frames,
  keyFrameIndex,
  detectionsMap,
  fallbackTimestamp = '02/01/2025 02:52:35',
}: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(keyFrameIndex);
  const [playing, setPlaying] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  const { ready: framesReady, progress: preloadProgress } = usePreloadedFrames(frames);

  useEffect(() => {
    setCurrentIndex(keyFrameIndex);
    setPlaying(false);
  }, [keyFrameIndex, frames]);

  const current = frames[currentIndex];
  const detections = useMemo(
    () => flattenDetections(detectionsMap[current?.id] ?? []),
    [current?.id, detectionsMap],
  );

  const eventRange = useMemo(() => getDiscoveryEventRange(keyFrameIndex), [keyFrameIndex]);

  const step = useCallback(
    (dir: number) => {
      setPlaying(false);
      setCurrentIndex((i) => Math.max(0, Math.min(frames.length - 1, i + dir)));
    },
    [frames.length],
  );

  useEffect(() => {
    if (!playing || frames.length < 2 || !framesReady) return;

    const timer = setInterval(() => {
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= frames.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, PLAYBACK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [playing, frames.length, framesReady]);

  const progressPct = frames.length > 1 ? (currentIndex / (frames.length - 1)) * 100 : 0;
  const plateauLeft = frames.length > 1 ? (eventRange.start / (frames.length - 1)) * 100 : 0;
  const plateauWidth =
    frames.length > 1 ? ((eventRange.end - eventRange.start + 1) / (frames.length - 1)) * 100 : 0;

  const startLabel = frames[0]?.recorded_at ? formatTimelineLabel(frames[0].recorded_at) : '';
  const midLabel = frames[keyFrameIndex]?.recorded_at
    ? formatTimelineLabel(frames[keyFrameIndex].recorded_at)
    : '';
  const endLabel = frames[frames.length - 1]?.recorded_at
    ? formatTimelineLabel(frames[frames.length - 1].recorded_at)
    : '';

  const timestamp = current?.recorded_at
    ? formatFrameTimestamp(current.recorded_at)
    : fallbackTimestamp;

  const seek = (pct: number) => {
    setPlaying(false);
    setCurrentIndex(Math.min(frames.length - 1, Math.round(pct * (frames.length - 1))));
  };

  if (!frames.length) {
    return (
      <div className="figma-player">
        <div className="figma-player__card figma-player__card--loading">
          <div className="figma-player__loading">Загрузка кадров…</div>
        </div>
      </div>
    );
  }

  const frameSrc = current?.frame_url ?? figmaAssets.videoFrame;

  return (
    <div className="figma-player">
      <div className="figma-player__card">
        <div className="figma-player__video-wrap">
          {!framesReady ? (
            <div className="figma-player__loading figma-player__loading--overlay">
              Загрузка кадров… {preloadProgress}%
            </div>
          ) : (
            <BufferedFrameImage
              src={frameSrc}
              alt={`Кадр ${currentIndex + 1}`}
              className="figma-player__video"
            />
          )}

          {framesReady && (
            <FrameDetectionsOverlay
              detections={detections}
              sourceWidth={DISCOVERY_FRAME_SOURCE.width}
              sourceHeight={DISCOVERY_FRAME_SOURCE.height}
              visible={showBoxes}
            />
          )}

          <span className="figma-player__timestamp">{timestamp}</span>

          <div className="figma-player__side-tools">
            <button
              type="button"
              className={`figma-player__tool${showBoxes ? ' figma-player__tool--active' : ''}`}
              aria-label="Показать рамки детекции"
              aria-pressed={showBoxes}
              onClick={() => setShowBoxes((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
            <button type="button" className="figma-player__tool" aria-label="Увеличить">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className="figma-player__tool" aria-label="Уменьшить">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="figma-player__bar">
          <div className="figma-player__transport">
            <button
              type="button"
              className="figma-player__transport-btn"
              aria-label="В начало"
              onClick={() => {
                setPlaying(false);
                setCurrentIndex(0);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 3v10M11 3l-5 5 5 5V3Z" />
              </svg>
            </button>
            <button
              type="button"
              className="figma-player__transport-btn"
              aria-label="Предыдущий кадр"
              onClick={() => step(-1)}
              disabled={!framesReady}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11 3l-5 5 5 5V3Z" />
              </svg>
            </button>
            <button
              type="button"
              className={`figma-player__transport-btn figma-player__transport-btn--play${playing ? ' is-paused' : ''}`}
              aria-label={playing ? 'Пауза' : 'Воспроизведение'}
              onClick={() => framesReady && setPlaying((p) => !p)}
              disabled={!framesReady}
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M5 3h3v12H5V3Zm5 0h3v12h-3V3Z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M5 3l10 6-10 6V3Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="figma-player__transport-btn"
              aria-label="Следующий кадр"
              onClick={() => step(1)}
              disabled={!framesReady}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3l5 5-5 5V3Z" />
              </svg>
            </button>
            <button
              type="button"
              className="figma-player__transport-btn"
              aria-label="Ключевой кадр"
              onClick={() => {
                setPlaying(false);
                setCurrentIndex(keyFrameIndex);
              }}
              disabled={!framesReady}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6L8 2Z" />
              </svg>
            </button>
          </div>

          <div className="figma-player__timeline-wrap">
            <div className="figma-player__timeline-labels">
              <span>{startLabel}</span>
              <span>{midLabel}</span>
              <span>{endLabel}</span>
            </div>
            <button
              type="button"
              className="figma-player__timeline-track"
              aria-label="Перемотка по таймлайну"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
              disabled={!framesReady}
            >
              <span className="figma-player__timeline-base" />
              <span
                className="figma-player__timeline-plateau"
                style={{ left: `${plateauLeft}%`, width: `${plateauWidth}%` }}
              />
              <span className="figma-player__timeline-progress" style={{ width: `${progressPct}%` }} />
              <span className="figma-player__timeline-playhead" style={{ left: `${progressPct}%` }} />
            </button>
          </div>

          <span className="figma-player__frame-counter">
            {currentIndex + 1} / {frames.length}
          </span>

          <button type="button" className="figma-player__fullscreen" aria-label="На весь экран">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 7V2h5M11 2h5v5M16 11v5h-5M7 16H2v-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
