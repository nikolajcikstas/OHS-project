import { useNavigate } from 'react-router-dom';

const cards = [
  { to: '/settings/detection-params', icon: 'bi-gear-fill', color: 'text-info', btn: 'btn-info', title: 'Параметры детекции', desc: 'Настройка параметров детекции для камер' },
  { to: '/settings/cameras', icon: 'bi-camera-video-fill', color: 'text-primary', btn: 'btn-primary', title: 'Камеры', desc: 'Управление камерами наблюдения' },
  { to: '/settings/models', icon: 'bi-cpu-fill', color: 'text-success', btn: 'btn-success', title: 'Модели', desc: 'Управление моделями машинного обучения' },
  { to: '/settings/objects', icon: 'bi-building-fill', color: 'text-warning', btn: 'btn-warning', title: 'Объекты', desc: 'Управление объектами наблюдения' },
];

export function SettingsIndexPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h2 className="page-title mb-4">Настройки</h2>
      <div className="row g-4">
        {cards.map((card) => (
          <div key={card.to} className="col-md-4">
            <div className="card settings-card" onClick={() => navigate(card.to)} role="button" tabIndex={0}>
              <div className="card-body text-center py-5">
                <i className={`bi ${card.icon} ${card.color} settings-icon`} />
                <h4>{card.title}</h4>
                <p className="text-muted">{card.desc}</p>
                <button type="button" className={`btn ${card.btn} mt-2`}>
                  Перейти <i className="bi bi-arrow-right ms-2" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
