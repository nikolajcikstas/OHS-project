import type { DiscoveryDetail } from '@/types/discovery';

interface InfoPanelProps {
  discovery: DiscoveryDetail;
}

export function InfoPanel({ discovery }: InfoPanelProps) {
  return (
    <aside className="figma-info">
      <h2 className="figma-info__title">{discovery.violationType}</h2>

      <div className="figma-info__row">
        <span className="figma-info__label">Статус • Вы</span>
        <span className="figma-info__badge figma-info__badge--pending">{discovery.statusLabel}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">ID</span>
        <span className="figma-info__value">{discovery.id}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Дата и время</span>
        <span className="figma-info__value">
          {discovery.detectedAt}
          <span className="figma-info__sub">{discovery.detectedAtRelative}</span>
        </span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Тип</span>
        <span className="figma-info__value">{discovery.violationCategory}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Объект</span>
        <span className="figma-info__value">{discovery.objectName}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Мастер</span>
        <span className="figma-info__value">{discovery.master}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Бригада</span>
        <span className="figma-info__value">{discovery.brigade}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Зона</span>
        <span className="figma-info__value">{discovery.zone}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Камера</span>
        <span className="figma-info__value">
          {discovery.cameraId}
          <span className="figma-info__sub">{discovery.cameraName}</span>
        </span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Поступило</span>
        <span className="figma-info__value">{discovery.receivedAt}</span>
      </div>

      <div className="figma-info__row">
        <span className="figma-info__label">Обработать</span>
        <span className="figma-info__value">
          {discovery.deadlineAt}
          <span className="figma-info__deadline">{discovery.deadlineTimer}</span>
        </span>
      </div>
    </aside>
  );
}
