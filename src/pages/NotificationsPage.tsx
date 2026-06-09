import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications } from '@/api/discoveries';
import type { NotificationItem } from '@/types/discovery';

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    getNotifications().then(setItems);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <div className="notifications-header">
        <h1>Уведомления</h1>
        {unread > 0 && <span className="problems-badge">Есть {unread} проблемы</span>}
      </div>

      <ul className="notification-list">
        {items.map((item) => (
          <li key={item.id}>
            {item.discoveryId ? (
              <Link
                to={`/discoveries/${item.discoveryId}`}
                className={`notification-item${!item.read ? ' notification-item--unread' : ''}`}
              >
                <div>
                  <div className="notification-item__title">{item.title}</div>
                  {item.subtitle && <div className="notification-item__subtitle">{item.subtitle}</div>}
                </div>
                <span className="notification-item__time">{item.time}</span>
              </Link>
            ) : (
              <div className={`notification-item${!item.read ? ' notification-item--unread' : ''}`}>
                <div>
                  <div className="notification-item__title">{item.title}</div>
                </div>
                <span className="notification-item__time">{item.time}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
