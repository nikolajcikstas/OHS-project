# OHS-project

Фронтенд системы видеоаналитики ОТиПБ по макету Figma «Видеоаналитика».

Стек: React 19, TypeScript, Vite, React Router.

Сейчас всё работает на **заглушках** — бэкенд напишут под этот контракт.

## Запуск

```bash
npm install
copy .env.example .env
npm run dev
```

http://localhost:5173

## Экраны (по Figma)

| Экран | Маршрут | Описание |
|---|---|---|
| Главная | `/` | Системный мониторинг, журнал ошибок, статус связи с сервером |
| Журнал детекций | `/detections` | Таблица кадров, фильтры, пагинация, выгрузка CSV |
| Детализация кадра | `/detections/:id` | Покадровый плеер + поля справа |
| Журнал нарушений | `/violations` | Таблица нарушений, фильтры, пагинация, выгрузка CSV |
| Детализация нарушения | `/violations/:id` | Плеер + поля нарушения + действия пользователей |
| Аналитика | `/analytics` | Графики (полностью STUB) |
| Видеостена | `/video-wall` | Сетка камер |
| Настройки | `/settings/*` | Объекты, камеры, модели, параметры детекции |

## Заглушки

Данные: `src/api/stubs/data.ts`  
Запросы: `src/api/index.ts`  
Переключение: `VITE_USE_STUBS=true` (по умолчанию)

Метка **STUB** на экране — эндпоинта ещё нет, бэкенд нужно реализовать.

### Контракт API для бэкенда

#### Главная

```
GET /api/system-health/
GET /api/system-health/unresolved-errors/
POST /api/system-health/resolve-error/     { error_id: uuid }
```

Ответ `system-health` — объект с полями: `timestamp`, `disk`, `database`, `media`, `cameras`, `tasks`, `cleanup`, `violations`, `alerts`.

#### Журнал детекций

```
GET /api/frames/?page=1&page_size=20&object_id=&camera_id=&has_detections=true
GET /api/frames/{uuid}/          → { frame, neighbors, neighbors_info }
GET /api/detections/by_frame/?frame_id={uuid}
GET /api/detections/by_frame/?frame_ids=uuid1,uuid2
```

Кадр (`Frame`): `id` (uuid), `camera`, `camera_name`, `object_name`, `frame_url`, `received_at`, `recorded_at`, `is_important`, `detections_count`.

#### Журнал нарушений

```
GET /api/violation-cases/?page=1&object_id=&camera_id=&violation_type=&case_status=&date_from=&date_to=
GET /api/violation-cases/{uuid}/
PATCH /api/violation-cases/{uuid}/         { case_status: "New"|"Verified"|"Rejected" }
```

Нарушение (`ViolationCase`): `id`, `violation_type`, `violation_type_code`, `violation_type_name`, `violation_type_group`, `main_frame`, `object_name`, `camera`, `camera_name`, `created_at`, `case_status`, `metadata`.

#### Действия по нарушению — STUB

```
GET /api/violation-case-actions/?violation_case_id={uuid}
POST /api/violation-case-actions/          { violation_case, action_type, comment }
```

Таблица `actions` в БД пока не заложена — фронт готов, данные из заглушки.

#### Аналитика — STUB

```
GET /api/analytics/
```

Ответ: `violations_by_day`, `violations_by_type`, `violations_by_object`, `detections_by_hour`.

#### Справочники (настройки)

```
GET /api/monitored-objects/
GET /api/cameras/?work_unit=
GET /api/models/
GET /api/detection-params/
GET /api/violation-types/
```

#### Видеостена

```
GET /api/cameras/?is_active=true
GET /api/frames/   (последние кадры по камерам)
```

### Подключение бэкенда

1. Реализовать эндпоинты по контракту выше
2. В `.env`: `VITE_USE_STUBS=false`, `VITE_API_BASE=http://localhost:8000`
3. `npm run dev`

## Структура

```
src/
  api/            — слой запросов
  api/stubs/      — заглушки
  components/     — FramePlayer, фильтры, пагинация
  pages/          — экраны
  types/          — TypeScript-типы контракта
```

## Макет

[Figma — Видеоаналитика](https://www.figma.com/design/P7JaihGhp6ELYWg00bF3mA/)
