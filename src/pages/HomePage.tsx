import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { figmaAssets } from '@/assets/figma';
import { getDashboard } from '@/api/discoveries';
import type { DashboardData, Discovery } from '@/types/discovery';

function DiscoveryRow({ item }: { item: Discovery }) {
  return (
    <Link to={`/discoveries/${item.id}`} className="home-discovery-row">
      <img src={item.thumbnailUrl ?? figmaAssets.tableThumb} alt="" className="home-discovery-row__thumb" />
      <div className="home-discovery-row__content">
        <div className="home-discovery-row__title">{item.suspectedViolation ?? item.shortTitle}</div>
        <div className="home-discovery-row__meta">
          {item.id} • {item.locationLine ?? `${item.zone} • ${item.cameraId}`}
        </div>
      </div>
      <div className="home-discovery-row__time">
        <div>{item.detectedAt}</div>
        <div className={`home-discovery-row__relative${item.detectedAtRelative.includes('🔥') ? ' is-urgent' : ''}`}>
          {item.detectedAtRelative}
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <div className="page-loading">Загрузка…</div>;

  const activeProblems = data.events.filter((e) => e.type === 'error').slice(0, 3);

  return (
    <div className="section-stack">
      <section className="card card--problems">
        <div className="problems-grid">
          <div className="problems-active">
            <div className="system-state">
              <div className="system-state__icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 6v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="system-state__text system-state__text--danger">{data.problemsCount} проблемы</span>
            </div>
            <ul className="problems-list">
              {activeProblems.map((event) => (
                <li key={event.id} className="problems-list__item">
                  <span className="problems-list__icon problems-list__icon--error" />
                  <span className="problems-list__message">{event.message}</span>
                  <span className="problems-list__time">{event.time}</span>
                </li>
              ))}
            </ul>
            <div className="support-line">
              <span className="support-line__icon">🎧</span>
              Позвоните в поддержку +375 44 123-45-67
            </div>
          </div>

          <div className="problems-log">
            <div className="event-log__group-title">Ранее сегодня</div>
            <ul className="event-log">
              {data.events.map((event) => (
                <li key={event.id} className="event-item">
                  <span className={`event-dot event-dot--${event.type}`} />
                  <span className={`event-item__message event-item__message--${event.type}`}>{event.message}</span>
                  <span className="event-item__time">{event.time}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--outline">
              Все системные сообщения &gt;
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>{data.unprocessedCount} необработанных обнаружений</h2>
          <Link to="/discoveries?tab=pending" className="link-arrow">
            Все необработанные обнаружения →
          </Link>
        </div>
        <div className="card">
          <div className="home-discovery-list">
            {data.unprocessed.map((item) => (
              <DiscoveryRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>{data.expiringCount} истекающих обнаружений</h2>
          <Link to="/discoveries?tab=expiring" className="link-arrow">
            Все истекающие обнаружения →
          </Link>
        </div>
        <div className="card">
          <div className="home-discovery-list">
            {data.expiring.map((item) => (
              <Link key={item.id} to={`/discoveries/${item.id}`} className="home-discovery-row">
                <img src={item.thumbnailUrl ?? figmaAssets.tableThumb} alt="" className="home-discovery-row__thumb" />
                <div className="home-discovery-row__content">
                  <div className="home-discovery-row__title">{item.suspectedViolation ?? item.shortTitle}</div>
                  <div className="home-discovery-row__meta">{item.id}</div>
                </div>
                <div className="home-discovery-row__time">
                  <div>{item.deadlineAt}</div>
                  <div className="home-discovery-row__relative is-urgent">{item.deadlineTimer}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
