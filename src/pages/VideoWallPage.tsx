import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCameras,
  getDetectionParams,
  getModelClasses,
  getObjects,
  getVideoWallLatest,
} from '@/api';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/format';
import type { Camera, DetectionItem, DetectionParams, MonitoredObject } from '@/types';

interface LogEntry {
  time: string;
  text: string;
  level: 'success' | 'info' | 'warning' | 'error';
}

export function VideoWallPage() {
  const { showToast } = useToast();
  const [objects, setObjects] = useState<MonitoredObject[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [params, setParams] = useState<DetectionParams[]>([]);
  const [objectId, setObjectId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [paramsOpen, setParamsOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [latest, setLatest] = useState<{ sent?: string; recv?: string; crtd?: string; detections: DetectionItem[] } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [classSettings, setClassSettings] = useState<Record<string, { visible: boolean; color: string }>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeParams = params.find((p) => p.camera === Number(cameraId) && p.is_active);
  const selectedCamera = cameras.find((c) => c.id === Number(cameraId));

  useEffect(() => {
    Promise.all([getObjects(), getDetectionParams()]).then(([o, p]) => {
      setObjects(o);
      setParams(p.filter((x) => x.is_active));
    });
  }, []);

  useEffect(() => {
    if (!objectId) {
      setCameras([]);
      setCameraId('');
      return;
    }
    getCameras(Number(objectId)).then(setCameras);
    setCameraId('');
  }, [objectId]);

  const addLog = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    setLog((prev) => [{ time: new Date().toLocaleTimeString('ru-RU'), text, level }, ...prev].slice(0, 100));
  }, []);

  const poll = useCallback(async () => {
    if (!cameraId) return;
    try {
      const data = await getVideoWallLatest(Number(cameraId));
      if (data.has_new) {
        setLatest({
          sent: data.sent_at,
          recv: data.received_at,
          crtd: data.created_at,
          detections: data.detections ?? [],
        });
        if ((data.detection_count ?? 0) > 0) {
          addLog(`Детекция: ${data.detection_count} объект(ов)`, 'success');
        } else {
          addLog('Новый кадр получен', 'info');
        }
      }
    } catch {
      addLog('Ошибка получения кадра', 'error');
    }
  }, [cameraId, addLog]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!cameraId) {
      setLatest(null);
      return;
    }
    addLog(`Камера ${selectedCamera?.name ?? cameraId} выбрана`, 'info');
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [cameraId, selectedCamera?.name, poll, addLog]);

  useEffect(() => {
    if (!activeParams?.model) return;
    getModelClasses(activeParams.model).then((mc) => {
      const settings: Record<string, { visible: boolean; color: string }> = {};
      mc.classes.forEach((cls, i) => {
        settings[cls] = { visible: true, color: `hsl(${(i * 47) % 360}, 70%, 45%)` };
      });
      setClassSettings(settings);
    });
  }, [activeParams?.model]);

  function statusLabel(status?: string) {
    if (status === 'running') return <span className="badge bg-success status-badge">Ведётся</span>;
    if (status === 'error') return <span className="badge bg-danger status-badge">Ошибка</span>;
    return <span className="badge bg-secondary status-badge">Не ведётся</span>;
  }

  return (
    <div className="page-container-fluid">
      <div className="card mb-3">
        <div className="card-body p-3">
          <h5 className="card-title mb-3">
            <i className="bi bi-camera-video" /> Выбор объекта и камеры
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold" htmlFor="vw-object">Объект наблюдения</label>
              <select
                id="vw-object"
                className="form-select form-select-lg"
                value={objectId}
                onChange={(e) => setObjectId(e.target.value)}
              >
                <option value="">Выберите объект...</option>
                {objects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold" htmlFor="vw-camera">Камера</label>
              <select
                id="vw-camera"
                className="form-select form-select-lg"
                value={cameraId}
                disabled={!objectId}
                onChange={(e) => setCameraId(e.target.value)}
              >
                <option value="">{objectId ? 'Выберите камеру...' : 'Сначала выберите объект...'}</option>
                {cameras.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {cameraId && (
            <>
              {paramsOpen && (
                <div className="mt-2">
                  <h6 className="text-muted mb-2"><i className="bi bi-gear" /> Параметры детекции</h6>
                  {activeParams ? (
                    <div className="d-flex flex-column gap-2 mt-2">
                      <div><small className="text-muted">Модель</small><div className="fw-bold">{activeParams.model_name}</div></div>
                      <div><small className="text-muted">Частота детекции</small><div className="fw-bold">каждый {activeParams.frame_skip}-й кадр</div></div>
                      <div><small className="text-muted">Статус обработки</small><div>{statusLabel(activeParams.processing_status)}</div></div>
                    </div>
                  ) : (
                    <div className="text-muted small">Параметры детекции не настроены</div>
                  )}
                </div>
              )}
              <div className="text-center mt-1">
                <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={() => setParamsOpen((o) => !o)}>
                  <i className={`bi bi-chevron-${paramsOpen ? 'up' : 'down'}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body p-2">
          <h5 className="card-title mb-2">
            <i className="bi bi-display" /> {selectedCamera?.name ?? 'Камера не выбрана'}
          </h5>
          <div className="frame-wrapper">
            {cameraId && (
              <>
                <button
                  type="button"
                  className="settings-btn border-0"
                  title="Настройки рамок"
                  onClick={() => setSettingsOpen(true)}
                >
                  <i className="bi bi-eye fs-5" />
                </button>
                {latest && (
                  <div
                    className="position-absolute top-0 start-0 p-2"
                    style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '0 0 8px 0', zIndex: 50 }}
                  >
                    <div className="small mb-1"><i className="bi bi-camera-video" /> Sent: {formatDateTime(latest.sent)}</div>
                    <div className="small mb-1"><i className="bi bi-database" /> Recv: {formatDateTime(latest.recv)}</div>
                    <div className="small"><i className="bi bi-cpu" /> Crtd: {formatDateTime(latest.crtd)}</div>
                  </div>
                )}
              </>
            )}
            {!cameraId ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-camera-video-off" style={{ fontSize: '4rem' }} />
                <p className="mt-3 mb-0">Выберите камеру для просмотра видеопотока</p>
              </div>
            ) : (
              <div className="frame-placeholder" style={{ minHeight: 360 }}>
                <div className="text-center">
                  <i className="bi bi-play-circle" style={{ fontSize: '3rem' }} />
                  <p className="mt-2 mb-0">Видеопоток (заглушка polling /video-wall/latest/)</p>
                  {latest && latest.detections.length > 0 && (
                    <p className="mt-2 mb-0 small">Детекций: {latest.detections.length}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="card-title mb-0"><i className="bi bi-journal-text" /> Лог детекции</h5>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setLog([])}>
              <i className="bi bi-trash" /> Очистить лог
            </button>
          </div>
          <div className="detection-log-container border rounded p-2 bg-light">
            {log.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-clock-history" style={{ fontSize: '3rem' }} />
                <p className="mt-2 mb-0">Лог детекции будет отображаться здесь</p>
              </div>
            ) : log.map((entry, i) => (
              <p key={i} className={`log-line ${entry.level}`}>
                <span className="text-muted me-2">[{entry.time}]</span>{entry.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {settingsOpen && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-palette" /> Настройки рамок детекций</h5>
                <button type="button" className="btn-close" onClick={() => setSettingsOpen(false)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small">Включите или выключите отображение для каждого класса и выберите цвет рамки.</p>
                {Object.keys(classSettings).length === 0 ? (
                  <p className="text-muted text-center">Нет классов для настройки</p>
                ) : Object.entries(classSettings).map(([cls, s]) => (
                  <div key={cls} className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={(e) => setClassSettings((prev) => ({
                        ...prev,
                        [cls]: { ...prev[cls], visible: e.target.checked },
                      }))}
                    />
                    <span className="flex-grow-1">{cls}</span>
                    <input
                      type="color"
                      value={s.color.startsWith('#') ? s.color : '#0366d6'}
                      onChange={(e) => setClassSettings((prev) => ({
                        ...prev,
                        [cls]: { ...prev[cls], color: e.target.value },
                      }))}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSettingsOpen(false)}>Отмена</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { setSettingsOpen(false); showToast('Сохранено', 'Настройки рамок применены (заглушка)', 'success'); }}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
