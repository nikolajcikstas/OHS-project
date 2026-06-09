import type { Camera, MonitoredObject, ViolationType } from '@/types';

export interface JournalFilterValues {
  object_id: string;
  camera_id: string;
  violation_type?: string;
  case_status?: string;
  date_from?: string;
  date_to?: string;
}

interface Props {
  objects: MonitoredObject[];
  cameras: Camera[];
  violationTypes?: ViolationType[];
  showViolationFilters?: boolean;
  values: JournalFilterValues;
  onChange: (values: JournalFilterValues) => void;
  onApply: () => void;
}

export function JournalFilters({
  objects,
  cameras,
  violationTypes,
  showViolationFilters,
  values,
  onChange,
  onApply,
}: Props) {
  const filteredCameras = values.object_id
    ? cameras.filter((c) => c.work_unit === Number(values.object_id))
    : cameras;

  return (
    <div className="card mb-4">
      <div className="card-body">
        <form
          className="row g-3"
          onSubmit={(e) => { e.preventDefault(); onApply(); }}
        >
          <div className="col-md-3">
            <label className="form-label" htmlFor="object_filter">Объект наблюдения</label>
            <select
              id="object_filter"
              className="form-select"
              value={values.object_id}
              onChange={(e) => onChange({ ...values, object_id: e.target.value, camera_id: '' })}
            >
              <option value="">Все объекты</option>
              {objects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label" htmlFor="camera_filter">Камера</label>
            <select
              id="camera_filter"
              className="form-select"
              value={values.camera_id}
              onChange={(e) => onChange({ ...values, camera_id: e.target.value })}
            >
              <option value="">Все камеры</option>
              {filteredCameras.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {showViolationFilters && violationTypes && (
            <>
              <div className="col-md-3">
                <label className="form-label">Тип нарушения</label>
                <select
                  className="form-select"
                  value={values.violation_type ?? ''}
                  onChange={(e) => onChange({ ...values, violation_type: e.target.value })}
                >
                  <option value="">Все типы</option>
                  {violationTypes.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Статус</label>
                <select
                  className="form-select"
                  value={values.case_status ?? ''}
                  onChange={(e) => onChange({ ...values, case_status: e.target.value })}
                >
                  <option value="">Все статусы</option>
                  <option value="New">Необходима верификация</option>
                  <option value="Verified">Подтверждено</option>
                  <option value="Rejected">Ложное срабатывание</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Дата с</label>
                <input
                  type="date"
                  className="form-control"
                  value={values.date_from ?? ''}
                  onChange={(e) => onChange({ ...values, date_from: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Дата по</label>
                <input
                  type="date"
                  className="form-control"
                  value={values.date_to ?? ''}
                  onChange={(e) => onChange({ ...values, date_to: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">Применить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
