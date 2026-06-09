interface Props {
  open: boolean;
  onClose: () => void;
}

export function SystemInfoModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Информация о системе</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <h6>Система видеоаналитики по контролю за соблюдением требований охраны труда и промышленной безопасности</h6>
            <p>Версия: 0.0.3</p>

            <h6>Техническая информация:</h6>
            <p>
              Система реализована на базе Django с асинхронной обработкой через ASGI (Daphne).
              Взаимодействие — HTTP (Django REST Framework) и WebSocket (Django Channels) для real-time.
            </p>
            <p>
              Асинхронные задачи — Celery. База данных — PostgreSQL. Автоматическая очистка устаревших данных.
              Для компьютерного зрения — модели YOLO (Ultralytics).
            </p>
            <p>Web-клиент — React + Bootstrap 5 (по макету Figma).</p>
            <hr />

            <h6>Список изменений:</h6>
            <div className="mb-3">
              <strong>Версия 0.0.3 (Текущая):</strong>
              <ul className="mb-0">
                <li>Подсистема обработки нарушений с верификацией</li>
                <li>REST API для всех сущностей</li>
                <li>Видеостена с детекцией в реальном времени</li>
                <li>Журнал детекций и детализация кадра</li>
                <li>Мониторинг здоровья системы и дашборд</li>
              </ul>
            </div>

            <hr />
            <h6>Контактное лицо:</h6>
            <strong>Житко Алина Сергеевна</strong>
            <p className="mb-0">
              <i className="bi bi-telephone me-2" />0130
              <a href="mailto:A.Zhitko@beloil.by" className="ms-3">
                <i className="bi bi-envelope me-2" />A.Zhitko@beloil.by
              </a>
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}
