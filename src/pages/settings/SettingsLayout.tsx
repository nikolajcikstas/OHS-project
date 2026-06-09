import { Link, Outlet, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/settings/objects', label: 'Объекты' },
  { to: '/settings/cameras', label: 'Камеры' },
  { to: '/settings/models', label: 'Модели ML' },
  { to: '/settings/detection-params', label: 'Параметры детекции' },
];

export function SettingsLayout() {
  const { pathname } = useLocation();
  const isIndex = pathname === '/settings' || pathname === '/settings/';

  if (isIndex) {
    return <Outlet />;
  }

  return (
    <div className="page-container">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/settings" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left" />
        </Link>
        <h2 className="page-title mb-0">Настройки</h2>
      </div>

      <ul className="nav nav-pills mb-4 flex-wrap gap-2">
        {tabs.map((tab) => (
          <li key={tab.to} className="nav-item">
            <Link
              to={tab.to}
              className={`nav-link${pathname.startsWith(tab.to) ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>

      <Outlet />
    </div>
  );
}
