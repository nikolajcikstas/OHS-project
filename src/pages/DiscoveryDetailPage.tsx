import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDiscovery, getDiscoveryFrameBundle, updateDiscoveryStatus } from '@/api/discoveries';
import { InfoPanel } from '@/components/InfoPanel';
import { StatusTimeline } from '@/components/StatusTimeline';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useToast } from '@/hooks/useToast';
import type { DiscoveryDetail } from '@/types/discovery';
import type { DetectionRecord, Frame } from '@/types';

export function DiscoveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [discovery, setDiscovery] = useState<DiscoveryDetail | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [keyFrameIndex, setKeyFrameIndex] = useState(0);
  const [detectionsMap, setDetectionsMap] = useState<Record<string, DetectionRecord[]>>({});
  const [framesLoading, setFramesLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    setFramesLoading(true);
    getDiscovery(id).then(setDiscovery);
    getDiscoveryFrameBundle(id)
      .then((bundle) => {
        if (!bundle) return;
        setFrames(bundle.frames);
        setKeyFrameIndex(bundle.keyFrameIndex);
        setDetectionsMap(bundle.detectionsMap);
      })
      .finally(() => setFramesLoading(false));
  }, [id]);

  if (!discovery || framesLoading) return <div className="page-loading">Загрузка…</div>;

  const handleSubmit = async (isViolation: boolean) => {
    await updateDiscoveryStatus(discovery.id, isViolation ? 'Нарушение' : 'Ошибка ИИ');
    showToast('Отправлено', isViolation ? 'Отмечено как нарушение' : 'Отмечено как не нарушение', 'success');
  };

  return (
    <div className="detail-page">
      <div className="detail-page__main">
        <VideoPlayer
          frames={frames}
          keyFrameIndex={keyFrameIndex}
          detectionsMap={detectionsMap}
          fallbackTimestamp={discovery.videoTimestamp}
        />
      </div>
      <div className="detail-page__side">
        <InfoPanel discovery={discovery} />
        <StatusTimeline discovery={discovery} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
