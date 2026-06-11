import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { UserProfile } from '@/types/discovery';
import { lineLabelCyrillic } from '@/utils/discoveryPresentation';

type Tab = 'all' | 'pending' | 'expiring';
type NavMode = 'home' | 'discoveries' | 'detail' | 'default';

interface TopNavProps {
  user: UserProfile;
  detailTitle?: string;
  showDiscoveryTabs?: boolean;
  activeTab?: Tab;
  counter?: { current: number; total: number };
  notificationCount?: number;
}

const tabs: { id: Tab; label: string; suffix?: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'pending', label: 'Ожидают', suffix: ' • 4' },
  { id: 'expiring', label: 'Истекают', suffix: ' • 2' },
];

function NavArrows({ onBack, onForward }: { onBack: () => void; onForward: () => void }) {
  return (
    <div className="top-nav__arrows">
      <button type="button" className="icon-btn" aria-label="Назад" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className="icon-btn" aria-label="Вперёд" onClick={onForward}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function TopNav({
  user,
  detailTitle,
  showDiscoveryTabs = false,
  activeTab = 'all',
  counter,
  notificationCount = 5,
}: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const mode: NavMode = location.pathname === '/'
    ? 'home'
    : location.pathname.startsWith('/discoveries/') && detailTitle
      ? 'detail'
      : location.pathname.startsWith('/discoveries')
        ? 'discoveries'
        : 'default';

  const title =
    mode === 'home'
      ? user.location
      : mode === 'detail'
        ? detailTitle
        : mode === 'discoveries'
          ? 'Обнаружения'
          : location.pathname === '/statistics'
            ? 'Статистика'
            : location.pathname === '/notifications'
              ? 'Уведомления'
              : 'Видеоаналитика';

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <div className="top-nav__left">
          <NavArrows onBack={() => navigate(-1)} onForward={() => navigate(1)} />

          <div className="top-nav__brand">
            {mode === 'discoveries' ? (
              <Link to="/discoveries" className="top-nav__title top-nav__title--active">
                {title}
              </Link>
            ) : (
              <span className={`top-nav__title${mode === 'detail' ? ' top-nav__title--detail' : ''}`}>{title}</span>
            )}

            {showDiscoveryTabs && (
              <div className="top-nav__tabs">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={`/discoveries?tab=${tab.id}`}
                    className={`top-nav__tab${activeTab === tab.id ? ' top-nav__tab--active' : ''}`}
                  >
                    {tab.label}
                    {tab.suffix && <span className="top-nav__tab-suffix">{tab.suffix}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {counter && (
            <div className="top-nav__counter">
              <span className="top-nav__counter-current">{counter.current}</span>
              <span className="top-nav__counter-sep"> / </span>
              <span className="top-nav__counter-total">{counter.total}</span>
            </div>
          )}
        </div>

        <div className="top-nav__right">
          {mode === 'discoveries' && (
            <>
              <div className="top-nav__status-pill">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1 12 4v4c0 2.5-2 4.5-5 5-3-.5-5-2.5-5-5V4l5-3Z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>5</span>
              </div>
              <button type="button" className="icon-btn" aria-label="Поиск">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              <button type="button" className="icon-btn" aria-label="Экспорт">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 3v9M5 9l4 4 4-4M3 15h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {mode === 'detail' && (
            <button type="button" className="icon-btn" aria-label="Поделиться">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 11V3M6 6l3-3 3 3M4 13v2h10v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <Link to="/notifications" className="top-nav__bell" aria-label="Уведомления">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2.5a4.5 4.5 0 0 1 4.5 4.5v2.8l1.5 2.5H4l1.5-2.5V7A4.5 4.5 0 0 1 10 2.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M8 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {notificationCount > 0 && mode !== 'discoveries' && (
              <span className="top-nav__badge">{notificationCount}</span>
            )}
          </Link>

          <div className="top-nav__divider" />

          <div className="top-nav__profile">
            <div className="avatar">{user.initials}</div>
            <span className="top-nav__profile-name">
              {user.name} • {lineLabelCyrillic(user.line)}
            </span>
            <span className="top-nav__alert" aria-label="Предупреждение">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2 14 13H2L8 2Z" stroke="#ef4444" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M8 6v3" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.8" fill="#ef4444" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
