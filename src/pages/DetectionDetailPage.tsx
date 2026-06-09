import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDetectionsByFrames, getFrameDetail } from '@/api';
import { FramePlayer } from '@/components/FramePlayer';
import { formatDateTime } from '@/utils/format';
import type { DetectionRecord, Frame } from '@/types';

export function DetectionDetailPage() {
  const { id } = useParams();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [keyIndex, setKeyIndex] = useState(0);
  const [detectionsMap, setDetectionsMap] = useState<Record<string, DetectionRecord[]>>({});
  const [neighborsInfo, setNeighborsInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFrameDetail(id)
      .then(async (detail) => {
        if (!detail) return;
        const before = detail.neighbors.slice(0, detail.neighbors_info.before);
        const after = detail.neighbors.slice(detail.neighbors_info.before);
        const all = [...before, detail.frame, ...after];
        setFrames(all);
        setKeyIndex(before.length);
        if (!detail.neighbors_info.is_complete) {
          setNeighborsInfo(`Загружено ${detail.neighbors_info.total} из ${detail.neighbors_info.expected} соседних кадров`);
        }
        const ids = all.map((f) => f.id);
        const dets = await getDetectionsByFrames(ids);
        setDetectionsMap(dets);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }
  if (!frames.length) {
    return <div className="page-container text-center py-5 text-muted">Кадр не найден</div>;
  }

  const keyFrame = frames[keyIndex];

  const sidePanel = (
    <>
      <h3>Информация о кадре</h3>
      <table className="info-table">
        <tbody>
          <tr><th>ID</th><td className="mono">{keyFrame.id}</td></tr>
          <tr><th>Объект</th><td>{keyFrame.object_name ?? '—'}</td></tr>
          <tr><th>Камера</th><td>{keyFrame.camera_name ?? '—'}</td></tr>
          <tr><th>Важный</th><td>{keyFrame.is_important ? 'Да' : 'Нет'}</td></tr>
          <tr><th>Получен</th><td>{formatDateTime(keyFrame.received_at)}</td></tr>
          <tr><th>На камере</th><td>{formatDateTime(keyFrame.recorded_at)}</td></tr>
        </tbody>
      </table>
    </>
  );

  return (
    <div className="page-container-fluid">
      <Link to="/detections" className="btn btn-outline-secondary btn-sm mb-3">
        <i className="bi bi-arrow-left" /> К журналу детекций
      </Link>
      {neighborsInfo && (
        <div className="alert alert-warning py-2" style={{ fontSize: 13 }}>{neighborsInfo}</div>
      )}
      <FramePlayer
        frames={frames}
        keyFrameIndex={keyIndex}
        detectionsMap={detectionsMap}
        sidePanel={sidePanel}
      />
    </div>
  );
}
