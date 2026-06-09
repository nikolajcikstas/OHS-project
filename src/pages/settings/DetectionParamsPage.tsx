import { useCallback, useEffect, useState } from 'react';
import {
  createDetectionParams,
  deleteDetectionParams,
  getCameras,
  getDetectionParams,
  getModels,
  getObjects,
  getViolationTypes,
  pauseDetection,
  startDetection,
  updateDetectionParams,
} from '@/api';
import { useToast } from '@/hooks/useToast';
import type { Camera, DetectionParams, MlModel, MonitoredObject, ViolationType } from '@/types';

const statusBadge: Record<string, string> = {
  idle: 'bg-secondary',
  running: 'bg-success',
  error: 'bg-danger',
};

export function DetectionParamsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<DetectionParams[]>([]);
  const [objects, setObjects] = useState<MonitoredObject[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [models, setModels] = useState<MlModel[]>([]);
  const [types, setTypes] = useState<ViolationType[]>([]);
  const [filterObject, setFilterObject] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    object_id: '',
    camera_id: '',
    model_id: '',
    frame_skip: 25,
    violation_types: [] as number[],
  });

  const load = useCallback(() => {
    setLoading(true);
    getDetectionParams()
      .then((list) => setItems(list.filter((p) => p.is_active)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([getObjects(), getModels(), getViolationTypes()]).then(([o, m, t]) => {
      setObjects(o);
      setModels(m.filter((x) => x.is_active));
      setTypes(t);
    });
    load();
  }, [load]);

  useEffect(() => {
    if (!form.object_id) { setCameras([]); return; }
    getCameras(Number(form.object_id)).then(setCameras);
  }, [form.object_id]);

  const filtered = filterObject
    ? items.filter((p) => p.monitored_object === Number(filterObject))
    : items;

  function openCreate() {
    setEditId(null);
    setForm({ object_id: '', camera_id: '', model_id: '', frame_skip: 25, violation_types: [] });
    setModalOpen(true);
  }

  function openEdit(p: DetectionParams) {
    setEditId(p.id);
    setForm({
      object_id: String(p.monitored_object ?? ''),
      camera_id: String(p.camera),
      model_id: String(p.model),
      frame_skip: p.frame_skip,
      violation_types: p.violation_types ?? [],
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.object_id || !form.camera_id || !form.model_id) {
      showToast('Ошибка', 'Заполните обязательные поля', 'danger');
      return;
    }
    const payload = {
      monitored_object: Number(form.object_id),
      camera: Number(form.camera_id),
      model: Number(form.model_id),
      frame_skip: form.frame_skip,
      violation_types: form.violation_types,
    };
    try {
      if (editId) {
        await updateDetectionParams(editId, payload);
        showToast('Успех', 'Параметры обновлены', 'success');
      } else {
        await createDetectionParams(payload);
        showToast('Успех', 'Параметры созданы', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      showToast('Ошибка', 'Не удалось сохранить', 'danger');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteDetectionParams(deleteId);
    showToast('Успех', 'Параметры деактивированы', 'success');
    setDeleteId(null);
    load();
  }

  async function toggleRun(p: DetectionParams) {
    if (p.processing_status === 'running') {
      await pauseDetection(p.id);
      showToast('Пауза', 'Детекция приостановлена', 'warning');
    } else {
      await startDetection(p.id);
      showToast('Запуск', 'Детекция запущена', 'success');
    }
    load();
  }

  const groups = [...new Set(types.map((t) => t.group))];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Параметры детекции</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" />Добавить
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <select className="form-select" value={filterObject} onChange={(e) => setFilterObject(e.target.value)}>
            <option value="">Все объекты</option>
            {objects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-hourglass-split fs-4" />
              <p className="mt-2">Загрузка данных...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Объект</th>
                    <th>Камера</th>
                    <th>Модель</th>
                    <th>Нарушения</th>
                    <th>Частота</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">Нет параметров детекции</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.monitored_object_name ?? '—'}</td>
                      <td>{p.camera_name ?? p.camera}</td>
                      <td>{p.model_name ?? p.model}</td>
                      <td>{p.violation_types_count ?? 0}</td>
                      <td>1/{p.frame_skip}</td>
                      <td>
                        <span className={`badge status-badge ${statusBadge[p.processing_status]}`}>
                          {p.processing_status_display ?? p.processing_status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-outline-primary" onClick={() => toggleRun(p)} title={p.processing_status === 'running' ? 'Пауза' : 'Запуск'}>
                            <i className={`bi bi-${p.processing_status === 'running' ? 'pause' : 'play'}-fill`} />
                          </button>
                          <button type="button" className="btn btn-outline-secondary" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button type="button" className="btn btn-outline-danger" onClick={() => setDeleteId(p.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Редактировать параметры' : 'Добавить параметры детекции'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Объект наблюдения *</label>
                  <select className="form-select" value={form.object_id} onChange={(e) => setForm({ ...form, object_id: e.target.value, camera_id: '' })}>
                    <option value="">Выберите объект...</option>
                    {objects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Камера *</label>
                  <select className="form-select" value={form.camera_id} disabled={!form.object_id} onChange={(e) => setForm({ ...form, camera_id: e.target.value })}>
                    <option value="">{form.object_id ? 'Выберите камеру...' : 'Сначала выберите объект...'}</option>
                    {cameras.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Модель *</label>
                  <select className="form-select" value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })}>
                    <option value="">Выберите модель</option>
                    {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Частота детекции</label>
                  <input type="number" className="form-control" min={1} value={form.frame_skip} onChange={(e) => setForm({ ...form, frame_skip: Number(e.target.value) })} />
                  <div className="form-text">Обрабатывать каждый N-й кадр</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Типы нарушений</label>
                  <div className="border rounded p-3" style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {groups.map((g) => (
                      <div key={g}>
                        <div className="violation-group-title">{g}</div>
                        {types.filter((t) => t.group === g).map((t) => (
                          <label key={t.id} className="violation-checkbox d-flex align-items-center">
                            <input
                              type="checkbox"
                              checked={form.violation_types.includes(t.id)}
                              onChange={(e) => setForm({
                                ...form,
                                violation_types: e.target.checked
                                  ? [...form.violation_types, t.id]
                                  : form.violation_types.filter((id) => id !== t.id),
                              })}
                            />
                            {t.code} — {t.name}
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Отмена</button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-exclamation-triangle me-2" />Подтверждение удаления</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)} />
              </div>
              <div className="modal-body">
                <p>Вы уверены, что хотите деактивировать параметры детекции?</p>
                <p className="text-muted small mb-0">Запись останется в истории, но перестанет использоваться.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteId(null)}>Отмена</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash" /> Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
