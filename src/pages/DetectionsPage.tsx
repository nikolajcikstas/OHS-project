import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCameras, getFrames, getObjects } from '@/api';
import { JournalFilters, type JournalFilterValues } from '@/components/JournalFilters';
import { Pagination } from '@/components/Pagination';
import { formatDateTime } from '@/utils/format';
import { downloadCsv } from '@/utils/exportCsv';
import type { Camera, Frame, MonitoredObject } from '@/types';

const defaultFilters: JournalFilterValues = { object_id: '', camera_id: '' };

export function DetectionsPage() {
  const navigate = useNavigate();
  const [objects, setObjects] = useState<MonitoredObject[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [applied, setApplied] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ results: Frame[]; count: number }>({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getObjects(), getCameras()]).then(([o, c]) => {
      setObjects(o);
      setCameras(c);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    getFrames({
      object_id: applied.object_id || undefined,
      camera_id: applied.camera_id || undefined,
      has_detections: true,
      page,
    })
      .then((r) => setData({ results: r.results, count: r.count }))
      .finally(() => setLoading(false));
  }, [applied, page]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    downloadCsv(
      'detections.csv',
      ['ID', 'Объект', 'Камера', 'Время', 'Детекций'],
      data.results.map((f) => [
        f.id,
        f.object_name ?? '',
        f.camera_name ?? '',
        formatDateTime(f.received_at),
        f.detections_count ?? 0,
      ]),
    );
  }

  return (
    <div className="page-container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Журнал детекций</h2>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={load} title="Обновить">
            <i className="bi bi-arrow-clockwise" />
          </button>
          <button type="button" className="btn btn-outline-primary" onClick={handleExport}>
            <i className="bi bi-download" /> CSV
          </button>
        </div>
      </div>

      <JournalFilters
        objects={objects}
        cameras={cameras}
        values={filters}
        onChange={setFilters}
        onApply={() => { setApplied(filters); setPage(1); }}
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-2 text-muted">Загрузка данных...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Изображение</th>
                    <th>Объект</th>
                    <th>Камера</th>
                    <th>Время получения</th>
                    <th>Детекции</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }} />
                        <p className="mt-3 text-muted mb-0">Нет записей с детекциями</p>
                      </td>
                    </tr>
                  ) : data.results.map((f) => (
                    <tr key={f.id} className="table-row-clickable" onClick={() => navigate(`/detections/${f.id}`)}>
                      <td><div className="thumb-placeholder" /></td>
                      <td>{f.object_name ?? '—'}</td>
                      <td>{f.camera_name ?? '—'}</td>
                      <td>{formatDateTime(f.received_at)}</td>
                      <td><span className="badge bg-warning text-dark">{f.detections_count ?? 0}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={data.count} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
