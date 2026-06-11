import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { figmaAssets } from '@/assets/figma';
import { getCurrentUser, getDiscoveries } from '@/api/discoveries';
import type { DiscoveriesListData, Discovery, UserProfile } from '@/types/discovery';
import {
  getDiscoveryTableDateColumn,
  showStatusColumn,
  showViolatorsColumn,
} from '@/utils/discoveryPresentation';
import { formatViolatorsDisplay } from '@/utils/violators';

const presets = ['Пресет', 'Пресет', 'Пресет'];
const statusChips = [
  { id: 'open', label: 'Открытые', active: true },
  { id: 'closed', label: 'Закрытые', active: false },
];

function StatusCell({ item }: { item: Discovery }) {
  return (
    <div className="table-status">
      <span className={`figma-info__badge figma-info__badge--${item.statusKind}`}>{item.statusLabel}</span>
      {item.statusSub && <span className="table-status__sub">{item.statusSub}</span>}
      {item.deadlineSub && !item.statusSub && <span className="table-status__sub">{item.deadlineSub}</span>}
    </div>
  );
}

export function DiscoveriesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = (params.get('tab') as 'all' | 'pending' | 'expiring') || 'all';
  const [data, setData] = useState<DiscoveriesListData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState('');

  const dateColumn = useMemo(() => (user ? getDiscoveryTableDateColumn(user.line) : null), [user]);
  const showStatus = user ? showStatusColumn(user.line) : true;
  const showViolators = user ? showViolatorsColumn(user.line) : true;

  const openDiscovery = (id: string) => navigate(`/discoveries/${id}`);

  useEffect(() => {
    getCurrentUser().then(setUser);
    getDiscoveries(tab).then(setData);
  }, [tab]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        (item.suspectedViolation ?? item.violationType).toLowerCase().includes(q),
    );
  }, [data, search]);

  if (!data || !user || !dateColumn) return <div className="page-loading">Загрузка…</div>;

  return (
    <div className="discoveries-page">
      <div className="filters-bar">
        <span className="filters-bar__label">Пресеты фильтров</span>
        {presets.map((preset, i) => (
          <button key={i} type="button" className={i === 0 ? 'filter-chip filter-chip--active' : 'preset-btn'}>
            {preset}
          </button>
        ))}
        {statusChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={chip.active ? 'filter-chip filter-chip--active' : 'preset-btn'}
          >
            {chip.label}
          </button>
        ))}
        <button type="button" className="preset-btn">
          + Фильтр
        </button>
        <input
          type="search"
          className="discoveries-search"
          placeholder="Поиск по ID или нарушению…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Поиск обнаружений"
        />
      </div>

      <div className="data-table-wrap">
        <table className="data-table data-table--discoveries">
          <thead>
            <tr>
              <th className="col-thumb" />
              <th>ID</th>
              <th className="col-sorted">
                {dateColumn.header}
                <span className="sort-icon">↓</span>
              </th>
              <th>Предполагаемое нарушение</th>
              <th>Тип</th>
              <th>Зона обнаружения</th>
              <th>Камера</th>
              {showStatus && <th>Статус • Вы</th>}
              {showViolators && <th>Нарушители</th>}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const relative = dateColumn.showRelative ? dateColumn.getRelative(item) : '';
              return (
                <tr
                  key={item.id}
                  className="data-table__row--clickable"
                  onClick={() => openDiscovery(item.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openDiscovery(item.id)}
                  tabIndex={0}
                  role="link"
                  aria-label={`Открыть обнаружение ${item.id}`}
                >
                  <td>
                    <span className="table-thumb">
                      <img src={item.thumbnailUrl ?? figmaAssets.tableThumb} alt="" />
                    </span>
                  </td>
                  <td>
                    <span className="table-link">{item.id}</span>
                  </td>
                  <td>
                    <div>{dateColumn.getPrimary(item)}</div>
                    {dateColumn.showRelative && relative && (
                      <div className={`cell-relative${relative.includes('🔥') ? ' cell-relative--urgent' : ''}`}>
                        {relative}
                      </div>
                    )}
                  </td>
                  <td className="col-violation table-cell-link">{item.suspectedViolation ?? item.violationType}</td>
                  <td>{item.violationCategory}</td>
                  <td>{item.detectionZone ?? item.zone}</td>
                  <td>
                    <div>{item.cameraId}</div>
                    <div className="cell-secondary">{item.cameraName}</div>
                  </td>
                  {showStatus && (
                    <td>
                      <StatusCell item={item} />
                    </td>
                  )}
                  {showViolators && <td>{formatViolatorsDisplay(item.violators)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
