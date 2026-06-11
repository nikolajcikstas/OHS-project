import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Двойной буфер как в ohs_project/detection_details:
 * следующий кадр подгружается скрыто, показ — только после onLoad.
 */
export function BufferedFrameImage({ src, alt, className }: Props) {
  const activeRef = useRef(0);
  const layersRef = useRef<[string, string]>([src, src]);
  const [, setRevision] = useState(0);

  useEffect(() => {
    const shown = layersRef.current[activeRef.current];
    if (!src || src === shown) return;

    const inactive = activeRef.current === 0 ? 1 : 0;
    const loader = new Image();
    loader.decoding = 'async';
    loader.onload = () => {
      const next: [string, string] = [layersRef.current[0], layersRef.current[1]];
      next[inactive] = src;
      layersRef.current = next;
      activeRef.current = inactive;
      setRevision((n) => n + 1);
    };
    loader.src = src;
  }, [src]);

  const active = activeRef.current;
  const layers = layersRef.current;

  return (
    <>
      <img
        src={layers[0]}
        alt={active === 0 ? alt : ''}
        className={className}
        draggable={false}
        aria-hidden={active !== 0}
        style={{ opacity: active === 0 ? 1 : 0 }}
      />
      <img
        src={layers[1]}
        alt={active === 1 ? alt : ''}
        className={`${className ?? ''} figma-player__video--buffer`}
        draggable={false}
        aria-hidden={active !== 1}
        style={{ opacity: active === 1 ? 1 : 0 }}
      />
    </>
  );
}
