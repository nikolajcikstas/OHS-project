import { useEffect, useState } from 'react';
import { getAnalytics } from '@/api';
import { StubTag } from '@/components/StubTag';
import type { AnalyticsData } from '@/types';

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const maxDay = Math.max(...data.violations_by_day.map((d) => d.count), 1);
  const maxType = Math.max(...data.violations_by_type.map((d) => d.count), 1);

  return (
    <div className="page-container">
      <h2 className="page-title">Аналитика <StubTag /></h2>
      <p className="page-subtitle mb-4">Графики и статистика — бэкенд будет реализован позже</p>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">Нарушения по дням</div>
          <div className="card-body">
            <div className="bar-chart">
              {data.violations_by_day.map((d) => (
                <div key={d.date} className="bar-col" title={`${d.date}: ${d.count}`}>
                  <div className="bar" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">По типам нарушений</div>
          <div className="card-body">
            {data.violations_by_type.map((t) => (
              <div key={t.type} className="h-bar-row">
                <span>{t.type}</span>
                <div className="h-bar-track">
                  <div className="h-bar-fill" style={{ width: `${(t.count / maxType) * 100}%` }} />
                </div>
                <span className="h-bar-val">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">По объектам</div>
          <div className="card-body p-0">
            <table className="table table-sm mb-0">
              <thead><tr><th>Объект</th><th>Кол-во</th></tr></thead>
              <tbody>
                {data.violations_by_object.map((o) => (
                  <tr key={o.object}><td>{o.object}</td><td>{o.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Детекции по часам</div>
          <div className="card-body">
            <div className="bar-chart compact">
              {data.detections_by_hour.filter((_, i) => i % 2 === 0).map((d) => (
                <div key={d.hour} className="bar-col" title={`${d.hour}: ${d.count}`}>
                  <div className="bar secondary" style={{ height: `${(d.count / 20) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
