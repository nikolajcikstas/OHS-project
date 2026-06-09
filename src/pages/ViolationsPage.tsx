import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCameras, getObjects, getViolationCases, getViolationTypes } from '@/api';
import { JournalFilters, type JournalFilterValues } from '@/components/JournalFilters';
import { Pagination } from '@/components/Pagination';
import { formatDateTime, violationStatusBadge, violationStatusLabel } from '@/utils/format';
import { downloadCsv } from '@/utils/exportCsv';
import type { Camera, MonitoredObject, ViolationCase, ViolationType } from '@/types';

const defaultFilters: JournalFilterValues = {
  object_id: '',
  camera_id: '',
  violation_type: '',
  case_status: '',
  date_from: '',
  date_to: '',
};

export function ViolationsPage() {
  const navigate = useNavigate();
  const [objects, setObjects] = useState<MonitoredObject[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [types, setTypes] = useState<ViolationType[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [applied, setApplied] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ results: ViolationCase[]; count: number }>({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getObjects(), getCameras(), getViolationTypes()]).then(([o, c, t]) => {
      setObjects(o);
      setCameras(c);
      setTypes(t);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    getViolationCases({
      object_id: applied.object_id || undefined,
      camera_id: applied.camera_id || undefined,
      violation_type: applied.violation_type || undefined,
      case_status: (applied.case_status as ViolationCase['case_status']) || undefined,
      date_from: applied.date_from || undefined,
      date_to: applied.date_to || undefined,
      page,
    })
      .then((r) => setData({ results: r.results, count: r.count }))
      .finally(() => setLoading(false));
  }, [applied, page]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    downloadCsv(
      'violations.csv',
      ['ID', 'Код', 'Тип', 'Объект', 'Камера', 'Время', 'Статус'],
      data.results.map((v) => [
        v.id,
        v.violation_type_code ?? '',
        v.violation_type_name ?? '',
        v.object_name ?? '',
        v.camera_name ?? '',
        formatDateTime(v.created_at),
        violationStatusLabel(v.case_status),
      ]),
    );
  }

  return (
    <div className="page-container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Журнал нарушений</h2>
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
        violationTypes={types}
        showViolationFilters
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
                    <th>Код</th>
                    <th>Тип нарушения</th>
                    <th>Объект</th>
                    <th>Камера</th>
                    <th>Время</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">Нет записей</td>
                    </tr>
                  ) : data.results.map((v) => (
                    <tr key={v.id} className="table-row-clickable" onClick={() => navigate(`/violations/${v.id}`)}>
                      <td><div className="thumb-placeholder" /></td>
                      <td className="mono">{v.violation_type_code}</td>
                      <td>{v.violation_type_name}</td>
                      <td>{v.object_name ?? '—'}</td>
                      <td>{v.camera_name ?? '—'}</td>
                      <td>{formatDateTime(v.created_at)}</td>
                      <td>
                        <span className={`badge ${violationStatusBadge(v.case_status)}`}>
                          {violationStatusLabel(v.case_status)}
                        </span>
                      </td>
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
