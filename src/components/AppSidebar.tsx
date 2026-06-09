import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', icon: 'home', label: 'Главная' },
  { to: '/discoveries', icon: 'users', label: 'Обнаружения', badge: 4 },
  { to: '/discoveries?tab=all', icon: 'clock', label: 'История' },
];

function Icon({ name }: { name: string }) {
  if (name === 'home') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 17c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="14" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 17c.3-2 1.4-3.5 3-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AppSidebar() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to.startsWith('/discoveries')) return location.pathname.startsWith('/discoveries');
    return location.pathname === to;
  };

  return (
    <aside className="app-sidebar">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`app-sidebar__item${isActive(item.to) ? ' app-sidebar__item--active' : ''}`}
          title={item.label}
        >
          <Icon name={item.icon} />
          {item.badge ? <span className="app-sidebar__badge">{item.badge}</span> : null}
        </Link>
      ))}
    </aside>
  );
}
