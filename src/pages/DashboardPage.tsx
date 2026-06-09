import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getSystemHealth,
  getUnresolvedErrors,
  manualCleanup,
  resolveAllErrors,
  resolveError,
} from '@/api';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { SystemInfoModal } from '@/components/SystemInfoModal';
import { formatDateTime, formatFutureTime, formatRelativeTime } from '@/utils/format';
import type { SystemError, SystemHealthReport } from '@/types';

export function DashboardPage() {
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [errorUpdated, setErrorUpdated] = useState('');
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [celeryOpen, setCeleryOpen] = useState(false);
  const [violationsOpen, setViolationsOpen] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState('');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const [h, e] = await Promise.all([getSystemHealth(refresh), getUnresolvedErrors()]);
      setHealth(h);
      if (h.alerts?.length) setAlertMsg(h.alerts[0].message);
      setErrors(e.errors);
      setErrorUpdated(e.last_updated);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleResolve(id: string) {
    await resolveError(id);
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleResolveAll() {
    if (!confirm('Пометить все ошибки как решённые?')) return;
    await resolveAllErrors();
    setErrors([]);
  }

  async function handleCleanup() {
    if (!confirm('Запустить очистку базы данных сейчас?')) return;
    setCleanupLoading(true);
    setCleanupMsg('Выполняется очистка...');
    try {
      const result = await manualCleanup();
      setCleanupMsg(result.message);
      load(true);
    } catch {
      setCleanupMsg('Ошибка очистки');
    } finally {
      setCleanupLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Загрузка...</p>
      </div>
    );
  }

  const diskPct = health?.disk.usage_percent ?? 0;
  const diskClass = diskPct >= 90 ? 'error' : diskPct >= 70 ? 'warning' : '';

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-1">ИИ ОТиПБ</h1>
          <p className="page-subtitle">
            Система видеоаналитики по контролю за соблюдением требований охраны труда и промышленной безопасности с применением ИИ
          </p>
          <small className="page-version">Версия 0.0.3</small>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowInfo(true)} title="Информация о системе">
          <i className="bi bi-info-circle" />
        </button>
      </div>

      <div className="system-dashboard">
        {alertMsg && (
          <div className="alert-box critical mb-4">
            <h3 className="mb-2" style={{ fontSize: 15, color: '#cb2431' }}>Критическое предупреждение</h3>
            <p className="mb-0">{alertMsg}</p>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Системный мониторинг</h2>
          <div className="d-flex align-items-center gap-3">
            {health?.timestamp && (
              <span className="text-muted" style={{ fontSize: 13 }}>
                Данные получены: {formatDateTime(health.timestamp)}
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={refreshing}
              onClick={() => load(true)}
            >
              {refreshing ? (
                <><span className="spinner-border spinner-border-sm me-2" />Загрузка...</>
              ) : 'Обновить'}
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <MetricCard title="Диск">
            <MetricRow label="Использовано" value={`${diskPct.toFixed(1)}%`} className={diskClass} />
            <div className="disk-progress">
              <div className={`fill ${diskClass}`} style={{ width: `${diskPct}%` }} />
            </div>
            <MetricRow label="Свободно" value={`${health?.disk.free_gb?.toFixed(1) ?? 0} GB`} />
            <MetricRow label="Всего" value={`${health?.disk.total_gb?.toFixed(1) ?? 0} GB`} />
          </MetricCard>

          <MetricCard title="База данных">
            <MetricRow label="Размер" value={`${health?.database.size_mb ?? 0} MB`} />
            <MetricRow label="Таблица кадров" value={health?.database.frames_count ?? 0} />
            <MetricRow label="Детекции" value={health?.database.detections_count ?? 0} />
            <MetricRow label="Нарушения" value={health?.database.violations_count ?? 0} />
          </MetricCard>

          <MetricCard title="Celery">
            <MetricRow label="Активные задачи" value={health?.tasks.active_tasks ?? 0} />
            <MetricRow label="В очереди" value={health?.tasks.pending_tasks ?? 0} />
            <MetricRow label="Выполнено / час" value={health?.tasks.completed_tasks_last_hour ?? 0} success />
            <MetricRow
              label="Ошибок / час"
              value={health?.tasks.failed_tasks_last_hour ?? 0}
              error={!!health?.tasks.failed_tasks_last_hour}
            />
            <div className="metric-section">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary collapse-toggle"
                onClick={() => setCeleryOpen((o) => !o)}
              >
                <span>{health?.tasks.workers ? `Запущен (${health.tasks.workers} воркеров)` : 'Детали'}</span>
                <i className={`bi bi-chevron-${celeryOpen ? 'up' : 'down'}`} style={{ fontSize: 10 }} />
              </button>
              {celeryOpen && (
                <div className="collapse-body">
                  <div className="collapse-row">
                    <span>Статус</span>
                    <span className={`metric-value ${health?.tasks.status === 'ok' ? 'success' : 'error'}`} style={{ fontSize: 13 }}>
                      {health?.tasks.status === 'ok' ? 'Запущен' : health?.tasks.status ?? '—'}
                    </span>
                  </div>
                  <div className="collapse-row">
                    <span>Beat</span>
                    <span className={`metric-value ${health?.tasks.beat_running ? 'success' : 'error'}`} style={{ fontSize: 13 }}>
                      {health?.tasks.beat_running ? 'Запущен' : 'Остановлен'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </MetricCard>

          <MetricCard title="Камеры">
            <MetricRow label="Активные" value={health?.cameras.active ?? 0} success />
            <MetricRow label="Онлайн" value={health?.cameras.online ?? 0} success />
            <MetricRow label="Оффлайн" value={health?.cameras.offline ?? 0} error />
          </MetricCard>

          <MetricCard title="Медиа">
            <MetricRow label="Размер" value={`${health?.media.size_gb?.toFixed(1) ?? 0} GB`} />
            <MetricRow label="Файлов" value={health?.media.files_count ?? 0} />
            <MetricRow label="До заполнения" value={
              health?.media.days_until_full != null ? `${health.media.days_until_full.toFixed(1)} дней` : '—'
            } />
          </MetricCard>

          <MetricCard title="Очистка БД">
            <MetricRow label="Последняя очистка" value={formatRelativeTime(health?.cleanup.last_cleanup)} />
            <MetricRow label="Следующая очистка" value={formatFutureTime(health?.cleanup.next_cleanup)} />
            <MetricRow label="Интервал" value={`${health?.cleanup.interval_minutes ?? 60} мин`} />
            <div className="metric-section">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger w-100"
                disabled={cleanupLoading}
                onClick={handleCleanup}
              >
                <i className="bi bi-trash3" /> {cleanupLoading ? 'Очистка...' : 'Очистить сейчас'}
              </button>
              {cleanupMsg && <div className="text-muted mt-2" style={{ fontSize: 12 }}>{cleanupMsg}</div>}
            </div>
          </MetricCard>

          <MetricCard title="Нарушения">
            <MetricRow label="Всего" value={health?.violations.total_violations ?? 0} />
            <MetricRow
              label={<Link to="/violations" className="text-decoration-none">Не решено</Link>}
              value={health?.violations.unresolved_violations ?? 0}
              error
            />
            <MetricRow label="За сегодня" value={health?.violations.violations_today ?? 0} />
            <MetricRow label="За неделю" value={health?.violations.violations_week ?? 0} />
            {(health?.violations.violations_by_type?.length ?? 0) > 0 && (
              <div className="metric-section">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary collapse-toggle"
                  onClick={() => setViolationsOpen((o) => !o)}
                >
                  <span>По типам</span>
                  <i className={`bi bi-chevron-${violationsOpen ? 'up' : 'down'}`} style={{ fontSize: 10 }} />
                </button>
                {violationsOpen && (
                  <div className="collapse-body">
                    {health?.violations.violations_by_type?.map((item) => (
                      <div key={item.violation_type__name} className="collapse-row">
                        <span>{item.violation_type__name}</span>
                        <span>{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </MetricCard>
        </div>
      </div>

      <div className="error-log-section">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            Журнал ошибок
            <span className={`error-count-badge${errors.length === 0 ? ' zero' : ''}`}>{errors.length}</span>
          </h2>
          <div className="d-flex align-items-center gap-2">
            {errorUpdated && (
              <span className="text-muted" style={{ fontSize: 13 }}>
                Обновлено: {formatDateTime(errorUpdated)}
              </span>
            )}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => load()}>
              <i className="bi bi-arrow-clockwise" />
            </button>
            {errors.length > 0 && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResolveAll}>
                <i className="bi bi-check2-all" /> Решить все
              </button>
            )}
          </div>
        </div>

        <div className="error-list">
          {errors.length === 0 ? (
            <div className="error-empty">
              <i className="bi bi-check-circle" style={{ fontSize: 24 }} />
              <p className="mt-2 mb-0">Нет неразрешённых ошибок</p>
            </div>
          ) : errors.map((e) => (
            <div key={e.id} className={`error-item level-${e.level}`}>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className={`error-level-badge ${e.level.toLowerCase()}`}>{e.level}</span>
                  <span className="error-item-time">{formatDateTime(e.created_at)}</span>
                </div>
                <div className="error-item-message">{e.message}</div>
                {e.source && (
                  <div className="error-item-source">
                    <i className="bi bi-code-slash" /> {e.source}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-success ms-2"
                onClick={() => handleResolve(e.id)}
                title="Пометить как решённую"
              >
                <i className="bi bi-check2" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConnectionStatus connected={connected} />

      <SystemInfoModal open={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  success,
  error,
  className,
}: {
  label: React.ReactNode;
  value: string | number;
  success?: boolean;
  error?: boolean;
  className?: string;
}) {
  const cls = className
    ? `metric-value ${className}`
    : error
      ? 'metric-value error'
      : success
        ? 'metric-value success'
        : 'metric-value';
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}
