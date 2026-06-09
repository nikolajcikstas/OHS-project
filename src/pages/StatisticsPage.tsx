import { useEffect, useState } from 'react';
import { getStatistics } from '@/api/discoveries';
import type { ChartSeries } from '@/types/discovery';

const periods = ['День', 'Неделя', 'Месяц', 'Год'];

export function StatisticsPage() {
  const [data, setData] = useState<ChartSeries[]>([]);
  const [period, setPeriod] = useState('Месяц');

  useEffect(() => {
    getStatistics().then(setData);
  }, []);

  const maxVal = Math.max(...data.flatMap((d) => [d.violations, d.aiErrors, d.overdue]), 1);

  return (
    <div>
      <div className="stats-header">
        <h1>Статистика</h1>
        <div className="period-tabs">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              className={`period-tab${period === p ? ' period-tab--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Нарушения, ошибки и просрочки • Л1</h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--danger)' }} />
              Нарушения
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--accent)' }} />
              Ошибки ИИ
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--warning)' }} />
              Просрочки
            </span>
          </div>
          <div className="bar-chart">
            {data.map((item) => (
              <div key={item.label} className="bar-group">
                <div className="bar-group__bars">
                  <div className="bar bar--violations" style={{ height: `${(item.violations / maxVal) * 100}%` }} />
                  <div className="bar bar--errors" style={{ height: `${(item.aiErrors / maxVal) * 100}%` }} />
                  <div className="bar bar--overdue" style={{ height: `${(item.overdue / maxVal) * 100}%` }} />
                </div>
                <span className="bar-group__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Нарушения по бригадам • Л2/Л3</h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--danger)' }} />
              Нарушения
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--accent)' }} />
              Ошибки ИИ
            </span>
          </div>
          <div className="bar-chart">
            {data.map((item) => (
              <div key={item.label} className="bar-group">
                <div className="bar-group__bars">
                  <div
                    className="bar bar--violations"
                    style={{ height: `${((item.violations * 0.8) / maxVal) * 100}%` }}
                  />
                  <div className="bar bar--errors" style={{ height: `${((item.aiErrors * 1.2) / maxVal) * 100}%` }} />
                </div>
                <span className="bar-group__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
