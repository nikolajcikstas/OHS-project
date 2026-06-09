import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getSystemHealth, getUnresolvedErrors } from '@/api';
import { isUsingStubs } from '@/api/client';

const STORAGE_KEY = 'sidebarState';

/** Пункты меню по макету Figma + журнал нарушений и аналитика */
const navItems = [
  { to: '/', label: 'Главная', icon: 'bi-house-door', end: true },
  { to: '/detections', label: 'Журнал детекций', icon: 'bi-journal-text' },
  { to: '/violations', label: 'Журнал нарушений', icon: 'bi-exclamation-triangle', badge: 'violations' as const },
  { to: '/analytics', label: 'Аналитика', icon: 'bi-bar-chart-line', stub: true },
  { to: '/video-wall', label: 'Видеостена', icon: 'bi-camera-video' },
  { to: '/settings', label: 'Настройки', icon: 'bi-gear' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [unresolvedViolations, setUnresolvedViolations] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    getSystemHealth().then((h) => setUnresolvedViolations(h.violations.unresolved_violations ?? 0));
    getUnresolvedErrors().then((e) => setErrorCount(e.total));
    const interval = setInterval(() => {
      getSystemHealth().then((h) => setUnresolvedViolations(h.violations.unresolved_violations ?? 0));
      getUnresolvedErrors().then((e) => setErrorCount(e.total));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <i className={`bi ${item.icon}`} />
              <span>
                {item.label}
                {item.stub && <span className="stub-tag" style={{ marginLeft: 4 }}>STUB</span>}
              </span>
              {item.badge === 'violations' && unresolvedViolations > 0 && (
                <span className="nav-badge">{unresolvedViolations}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-toggle" onClick={onToggle} title="Свернуть/Развернуть">
          <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`} />
        </button>
        {isUsingStubs() && <div className="stub-indicator">Режим заглушек</div>}
        {!collapsed && errorCount > 0 && (
          <div className="text-muted mt-2" style={{ fontSize: 11 }}>
            <span className="nav-badge warn" style={{ marginRight: 6 }}>{errorCount}</span>
            ошибок системы
          </div>
        )}
      </div>
    </nav>
  );
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'collapsed');

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'expanded');
      return next;
    });
  }

  return { collapsed, toggle };
}
