import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getDetectionsByFrames,
  getFrameDetail,
  getViolationCase,
  getViolationCaseActions,
  updateViolationStatus,
} from '@/api';
import { FramePlayer } from '@/components/FramePlayer';
import { StubTag } from '@/components/StubTag';
import { useToast } from '@/hooks/useToast';
import { formatDateTime, violationStatusBadge, violationStatusLabel } from '@/utils/format';
import type { DetectionRecord, Frame, ViolationCase, ViolationCaseAction } from '@/types';

export function ViolationDetailPage() {
  const { showToast } = useToast();
  const { id } = useParams();
  const [violation, setViolation] = useState<ViolationCase | null>(null);
  const [actions, setActions] = useState<ViolationCaseAction[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [keyIndex, setKeyIndex] = useState(0);
  const [detectionsMap, setDetectionsMap] = useState<Record<string, DetectionRecord[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getViolationCase(id)
      .then(async (v) => {
        if (!v) return;
        setViolation(v);
        const [detail, acts] = await Promise.all([
          getFrameDetail(v.main_frame),
          getViolationCaseActions(v.id),
        ]);
        setActions(acts);
        if (detail) {
          const before = detail.neighbors.slice(0, detail.neighbors_info.before);
          const after = detail.neighbors.slice(detail.neighbors_info.before);
          const all = [...before, detail.frame, ...after];
          setFrames(all);
          setKeyIndex(before.length);
          const dets = await getDetectionsByFrames(all.map((f) => f.id));
          setDetectionsMap(dets);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function changeStatus(status: ViolationCase['case_status']) {
    if (!violation) return;
    const updated = await updateViolationStatus(violation.id, status);
    setViolation(updated);
    showToast('Статус обновлён', violationStatusLabel(status), 'success');
  }

  if (loading) {
    return (
      <div className="page-container text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }
  if (!violation) {
    return <div className="page-container text-center py-5 text-muted">Нарушение не найдено</div>;
  }

  const sidePanel = (
    <>
      <h3>Информация о нарушении</h3>
      <table className="info-table">
        <tbody>
          <tr><th>ID</th><td className="mono">{violation.id}</td></tr>
          <tr><th>Код</th><td>{violation.violation_type_code}</td></tr>
          <tr><th>Тип</th><td>{violation.violation_type_name}</td></tr>
          <tr><th>Группа</th><td>{violation.violation_type_group ?? '—'}</td></tr>
          <tr><th>Объект</th><td>{violation.object_name ?? '—'}</td></tr>
          <tr><th>Камера</th><td>{violation.camera_name ?? '—'}</td></tr>
          <tr><th>Создано</th><td>{formatDateTime(violation.created_at)}</td></tr>
          <tr>
            <th>Статус</th>
            <td>
              <span className={`badge ${violationStatusBadge(violation.case_status)}`}>
                {violationStatusLabel(violation.case_status)}
              </span>
            </td>
          </tr>
          <tr><th>Людей</th><td>{violation.metadata?.affected_people ?? '—'}</td></tr>
          <tr><th>Кадров подряд</th><td>{violation.metadata?.consecutive_frames ?? '—'}</td></tr>
          <tr><th>Ключевой кадр</th><td className="mono">{violation.main_frame}</td></tr>
        </tbody>
      </table>

      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-success btn-sm" onClick={() => changeStatus('Verified')}>
          <i className="bi bi-check2" /> Подтвердить
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => changeStatus('Rejected')}>
          Ложное
        </button>
      </div>

      <h3 className="mt-4">Действия пользователей <StubTag /></h3>
      <p className="text-muted" style={{ fontSize: 12 }}>Таблица actions в БД ещё не реализована — данные из заглушки</p>
      {actions.length === 0 ? (
        <p className="text-muted">Действий пока нет</p>
      ) : (
        <ul className="list-unstyled" style={{ fontSize: 13 }}>
          {actions.map((a) => (
            <li key={a.id} className="border-bottom py-2">
              <strong>{a.user_name}</strong> — {a.action_type}
              {a.comment && <span>: {a.comment}</span>}
              <div className="text-muted">{formatDateTime(a.created_at)}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="page-container-fluid">
      <Link to="/violations" className="btn btn-outline-secondary btn-sm mb-3">
        <i className="bi bi-arrow-left" /> К журналу нарушений
      </Link>
      <FramePlayer
        frames={frames}
        keyFrameIndex={keyIndex}
        detectionsMap={detectionsMap}
        sidePanel={sidePanel}
      />
    </div>
  );
}
