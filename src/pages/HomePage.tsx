import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { figmaAssets } from '@/assets/figma';
import { getDashboard } from '@/api/discoveries';
import type { ActiveProblem, DashboardData, Discovery } from '@/types/discovery';
import { formatHomeLocationLine, isUrgentRelative } from '@/utils/homePresentation';

function ProblemIcon({ type }: { type: ActiveProblem['icon'] }) {
  if (type === 'cloud') {
    return (
      <span className="problems-list__glyph problems-list__glyph--cloud" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M5.5 13.5h7a3 3 0 0 0 .4-5.98A4 4 0 0 0 5.2 5.5 3.5 3.5 0 0 0 5.5 13.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="problems-list__glyph problems-list__glyph--camera" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M3 6.5h2.2L6.5 4.5h5l1.3 2H15a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 15 13.5H3A1.5 1.5 0 0 1 1.5 12V8A1.5 1.5 0 0 1 3 6.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </span>
  );
}

function DiscoveryRow({ item, mode }: { item: Discovery; mode: 'unprocessed' | 'expiring' }) {
  const urgent =
    mode === 'unprocessed'
      ? isUrgentRelative(item.detectedAtRelative)
      : Boolean(item.deadlineTimer?.includes('🔥'));
  const secondary =
    mode === 'unprocessed'
      ? item.detectedAtRelative
      : item.deadlineTimer || item.deadlineSub || '';

  return (
    <Link to={`/discoveries/${item.id}`} className="home-discovery-row">
      <img src={item.thumbnailUrl ?? figmaAssets.tableThumb} alt="" className="home-discovery-row__thumb" />
      <div className="home-discovery-row__content">
        <div className="home-discovery-row__title">{item.suspectedViolation ?? item.shortTitle}</div>
        <div className="home-discovery-row__id">{item.id}</div>
        <div className="home-discovery-row__location">{formatHomeLocationLine(item)}</div>
      </div>
      <div className="home-discovery-row__time">
        <div className="home-discovery-row__datetime">
          {mode === 'unprocessed' ? item.detectedAt : item.deadlineAt}
        </div>
        {secondary && (
          <div
            className={`home-discovery-row__relative${urgent ? ' is-urgent' : ''}${mode === 'expiring' && urgent ? ' is-deadline' : ''}`}
          >
            {secondary}
          </div>
        )}
      </div>
    </Link>
  );
}

function DiscoverySection({
  title,
  items,
  footerLabel,
  footerTo,
  mode,
}: {
  title: string;
  items: Discovery[];
  footerLabel: string;
  footerTo: string;
  mode: 'unprocessed' | 'expiring';
}) {
  return (
    <section className="card card--section">
      <div className="card__header card__header--plain">
        <h2 className="card__title">{title}</h2>
      </div>
      <div className="home-discovery-list">
        {items.map((item) => (
          <DiscoveryRow key={item.id} item={item} mode={mode} />
        ))}
      </div>
      <div className="card__footer">
        <Link to={footerTo} className="btn btn--outline card__footer-btn">
          {footerLabel}
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <div className="page-loading">Загрузка…</div>;

  return (
    <div className="section-stack">
      <section className="card card--problems">
        <div className="problems-grid">
          <div className="problems-active">
            <div className="system-state system-state--danger">
              <div className="system-state__icon system-state__icon--danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 6v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="system-state__text system-state__text--danger">{data.problemsCount} проблемы</span>
            </div>
            <ul className="problems-list">
              {data.activeProblems.map((problem) => (
                <li key={problem.id} className="problems-list__item">
                  <ProblemIcon type={problem.icon} />
                  <span className="problems-list__message">{problem.message}</span>
                  <span className="problems-list__time">{problem.time}</span>
                </li>
              ))}
            </ul>
            <div className="support-line">
              <span className="support-line__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 10.5v-2a5 5 0 0 1 10 0v2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path d="M3 10.5h1.5l1 2.5h5l1-2.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                Позвоните в поддержку <span className="support-line__phone">+375 44 123-45-67</span>
              </span>
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
            <div className="card__footer card__footer--inline">
              <button type="button" className="btn btn--outline card__footer-btn">
                Все системные сообщения &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      <DiscoverySection
        title={`${data.unprocessedCount} необработанных обнаружений`}
        items={data.unprocessed}
        footerLabel="Все необработанные обнаружения &gt;"
        footerTo="/discoveries?tab=pending"
        mode="unprocessed"
      />

      <DiscoverySection
        title={`${data.expiringCount} истекающих обнаружений`}
        items={data.expiring}
        footerLabel="Все истекающие обнаружения &gt;"
        footerTo="/discoveries?tab=expiring"
        mode="expiring"
      />
    </div>
  );
}
