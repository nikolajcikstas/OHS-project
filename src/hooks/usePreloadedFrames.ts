import { useEffect, useRef, useState } from 'react';

import type { Frame } from '@/types';

export function usePreloadedFrames(frames: Frame[]) {
  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    cacheRef.current.clear();
    setReady(false);
    setProgress(0);

    if (!frames.length) return;

    let cancelled = false;
    let loaded = 0;

    const loaders = frames.map(
      (frame, index) =>
        new Promise<void>((resolve) => {
          if (!frame.frame_url) {
            resolve();
            return;
          }

          const img = new Image();
          img.decoding = 'async';
          img.onload = () => {
            if (!cancelled) {
              cacheRef.current.set(index, img);
            }
            loaded += 1;
            setProgress(Math.round((loaded / frames.length) * 100));
            resolve();
          };
          img.onerror = () => {
            loaded += 1;
            setProgress(Math.round((loaded / frames.length) * 100));
            resolve();
          };
          img.src = frame.frame_url;
        }),
    );

    Promise.all(loaders).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [frames]);

  return { ready, progress, cacheRef };
}
