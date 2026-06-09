import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { figmaAssets } from '@/assets/figma';
import { getDiscoveries } from '@/api/discoveries';
import type { DiscoveriesListData, Discovery } from '@/types/discovery';

const presets = ['Пресет', 'Пресет', 'Пресет'];

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

  const openDiscovery = (id: string) => navigate(`/discoveries/${id}`);

  useEffect(() => {
    getDiscoveries(tab).then(setData);
  }, [tab]);

  if (!data) return <div className="page-loading">Загрузка…</div>;

  return (
    <div className="discoveries-page">
      <div className="filters-bar">
        <span className="filters-bar__label">Пресеты фильтров</span>
        {presets.map((preset, i) => (
          <button key={i} type="button" className={i === 0 ? 'filter-chip filter-chip--active' : 'preset-btn'}>
            {preset}
          </button>
        ))}
        <button type="button" className="preset-btn">
          + Фильтр
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table data-table--discoveries">
          <thead>
            <tr>
              <th className="col-thumb" />
              <th>ID</th>
              <th className="col-sorted">
                Дата и время
                <span className="sort-icon">↓</span>
              </th>
              <th>Предполагаемое нарушение</th>
              <th>Тип</th>
              <th>Зона обнаружения</th>
              <th>Камера</th>
              <th>Статус • Вы</th>
              <th>Нарушители</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
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
                  <div>{item.detectedAt}</div>
                  <div className={`cell-relative${item.detectedAtRelative.includes('🔥') ? ' cell-relative--urgent' : ''}`}>
                    {item.detectedAtRelative}
                  </div>
                </td>
                <td className="col-violation table-cell-link">{item.suspectedViolation ?? item.violationType}</td>
                <td>{item.violationCategory}</td>
                <td>{item.detectionZone ?? item.zone}</td>
                <td>
                  <div>{item.cameraId}</div>
                  <div className="cell-secondary">{item.cameraName}</div>
                </td>
                <td>
                  <StatusCell item={item} />
                </td>
                <td>{item.violators}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
