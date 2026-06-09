import type {
  AnalyticsData,
  Camera,
  DetectionParams,
  DetectionRecord,
  Frame,
  FrameDetailResponse,
  MlModel,
  MonitoredObject,
  Paginated,
  SystemHealthReport,
  UnresolvedErrorsResponse,
  ViolationCase,
  ViolationCaseAction,
  ViolationType,
} from '@/types';

export const stubObjects: MonitoredObject[] = [
  { id: 1, name: 'Цех №1', description: 'Производственный цех' },
  { id: 2, name: 'Склад', description: 'Складской комплекс' },
  { id: 3, name: 'Проходная', description: 'КПП' },
];

export const stubCameras: Camera[] = [
  { id: 1, name: 'CAM-01', stream_url: 'rtsp://192.168.1.10/stream1', work_unit: 1, work_unit_name: 'Цех №1', zone: 'Участок сварки', is_active: true },
  { id: 2, name: 'CAM-02', stream_url: 'rtsp://192.168.1.11/stream1', work_unit: 1, work_unit_name: 'Цех №1', zone: 'Сборочная линия', is_active: true },
  { id: 3, name: 'CAM-55', stream_url: '/media/videos/test_video.mp4', work_unit: 2, work_unit_name: 'Склад', zone: 'Зона погрузки', is_active: true },
];

export const stubModels: MlModel[] = [
  { id: 1, name: 'PPE_312_yolo12_l', model_file: 'models/PPE_312_yolo12_l.pt', framework: 'pytorch', is_active: true },
  { id: 2, name: 'Helmet detector v3', model_file: 'models/helmet_v3.pt', framework: 'pytorch', is_active: false },
];

export const stubDetectionParams: DetectionParams[] = [
  {
    id: 1,
    monitored_object: 2,
    monitored_object_name: 'Склад',
    camera: 3,
    camera_name: 'CAM-55',
    model: 1,
    model_name: 'PPE_312_yolo12_l',
    frame_skip: 10,
    violation_types: [1, 2],
    violation_types_count: 2,
    processing_status: 'running',
    processing_status_display: 'Ведётся',
    is_active: true,
  },
  {
    id: 2,
    monitored_object: 1,
    monitored_object_name: 'Цех №1',
    camera: 1,
    camera_name: 'CAM-01',
    model: 1,
    model_name: 'PPE_312_yolo12_l',
    frame_skip: 5,
    violation_types: [1],
    violation_types_count: 1,
    processing_status: 'idle',
    processing_status_display: 'Не ведётся',
    is_active: true,
  },
];

export const stubModelClasses: Record<number, string[]> = {
  1: ['no_helmet', 'no_vest', 'person', 'helmet', 'vest'],
};

export const stubViolationTypes: ViolationType[] = [
  { id: 1, code: '111', name: 'Отсутствие каски', group: 'СИЗ', group_display: 'СИЗ (Средства индивидуальной защиты)' },
  { id: 2, code: '112', name: 'Отсутствие жилета', group: 'СИЗ', group_display: 'СИЗ (Средства индивидуальной защиты)' },
  { id: 3, code: '121', name: 'Проникновение в зону', group: 'Зона', group_display: 'Зона' },
];

const FRAME_IDS = {
  f9: 'a1000000-0000-4000-8000-000000000009',
  f10: 'a1000000-0000-4000-8000-000000000010',
  f11: 'a1000000-0000-4000-8000-000000000011',
  f12: 'a1000000-0000-4000-8000-000000000012',
};

export const stubFrames: Frame[] = [
  { id: FRAME_IDS.f12, camera: 3, camera_name: 'CAM-55', object_name: 'Склад', frame_url: null, received_at: '2026-06-08T10:15:00', detections_count: 2 },
  { id: FRAME_IDS.f11, camera: 3, camera_name: 'CAM-55', object_name: 'Склад', frame_url: null, received_at: '2026-06-08T10:14:50', detections_count: 0 },
  { id: FRAME_IDS.f10, camera: 1, camera_name: 'CAM-01', object_name: 'Цех №1', frame_url: null, received_at: '2026-06-08T10:10:00', detections_count: 1 },
  { id: FRAME_IDS.f9, camera: 2, camera_name: 'CAM-02', object_name: 'Цех №1', frame_url: null, received_at: '2026-06-08T09:55:00', detections_count: 0 },
];

export const stubViolations: ViolationCase[] = [
  {
    id: 'b2000000-0000-4000-8000-000000000101',
    violation_type: 1,
    violation_type_code: '111',
    violation_type_name: 'Отсутствие каски',
    violation_type_group: 'СИЗ',
    main_frame: FRAME_IDS.f12,
    main_frame_url: null,
    object_name: 'Склад',
    camera: 3,
    camera_name: 'CAM-55',
    created_at: '2026-06-08T10:15:00',
    case_status: 'New',
    metadata: { affected_people: 1, consecutive_frames: 3, detection_details: { confidence: 0.92 } },
  },
  {
    id: 'b2000000-0000-4000-8000-000000000102',
    violation_type: 2,
    violation_type_code: '112',
    violation_type_name: 'Отсутствие жилета',
    violation_type_group: 'СИЗ',
    main_frame: FRAME_IDS.f10,
    object_name: 'Цех №1',
    camera: 1,
    camera_name: 'CAM-01',
    created_at: '2026-06-08T09:42:00',
    case_status: 'Verified',
    metadata: { affected_people: 1, consecutive_frames: 5 },
  },
  {
    id: 'b2000000-0000-4000-8000-000000000103',
    violation_type: 3,
    violation_type_code: '121',
    violation_type_name: 'Проникновение в зону',
    violation_type_group: 'Зона',
    main_frame: FRAME_IDS.f9,
    object_name: 'Цех №1',
    camera: 2,
    camera_name: 'CAM-02',
    created_at: '2026-06-07T18:30:00',
    case_status: 'Rejected',
    metadata: { affected_people: 0, consecutive_frames: 1 },
  },
];

export const stubViolationActions: ViolationCaseAction[] = [
  {
    id: 'c3000000-0000-4000-8000-000000000001',
    violation_case: 'b2000000-0000-4000-8000-000000000102',
    user_name: 'Иванов И.И.',
    action_type: 'verify',
    comment: 'Нарушение подтверждено по видеозаписи',
    created_at: '2026-06-08T11:00:00',
  },
];

export const stubDetectionsByFrame: Record<string, DetectionRecord[]> = {
  [FRAME_IDS.f12]: [{
    id: 'd4000000-0000-4000-8000-000000000001',
    received_frame: FRAME_IDS.f12,
    ml_model_name: 'PPE_312_yolo12_l',
    detection_log: {
      detections: [
        { class: 'no_helmet', confidence: 0.92, bbox: [120, 80, 160, 340] },
        { class: 'no_vest', confidence: 0.78, bbox: [130, 200, 140, 200] },
      ],
    },
    detected_at: '2026-06-08T10:15:00',
  }],
  [FRAME_IDS.f10]: [{
    id: 'd4000000-0000-4000-8000-000000000002',
    received_frame: FRAME_IDS.f10,
    ml_model_name: 'PPE_312_yolo12_l',
    detection_log: {
      detections: [{ class: 'no_helmet', confidence: 0.88, bbox: [50, 60, 150, 320] }],
    },
    detected_at: '2026-06-08T10:10:00',
  }],
};

export function buildFrameDetail(frameId: string): FrameDetailResponse | undefined {
  const idx = stubFrames.findIndex((f) => f.id === frameId);
  if (idx < 0) return undefined;
  const frame = stubFrames[idx];
  const neighbors = stubFrames.filter((f) => f.camera === frame.camera && f.id !== frame.id);
  const before = neighbors.filter((n) => n.received_at < frame.received_at);
  const after = neighbors.filter((n) => n.received_at > frame.received_at);
  return {
    frame,
    neighbors: [...before, ...after],
    neighbors_info: {
      total: neighbors.length,
      expected: 60,
      before: before.length,
      after: after.length,
      is_complete: false,
    },
  };
}

export const stubSystemHealth: SystemHealthReport = {
  timestamp: new Date().toISOString(),
  disk: { usage_percent: 42.5, free_gb: 280, total_gb: 500 },
  database: { size_mb: 156, frames_count: 1240, detections_count: 890, violations_count: 47 },
  media: { size_gb: 12.4, files_count: 1240, days_until_full: 45 },
  cameras: { active: 3, online: 2, offline: 1 },
  tasks: { active_tasks: 1, pending_tasks: 0, completed_tasks_last_hour: 156, failed_tasks_last_hour: 0, workers: 1, status: 'ok', beat_running: true },
  cleanup: { last_cleanup: '2026-06-08T06:00:00', next_cleanup: '2026-06-08T07:00:00', interval_minutes: 60 },
  violations: {
    total_violations: 47,
    unresolved_violations: 12,
    violations_today: 4,
    violations_week: 18,
    violations_by_type: [
      { violation_type__name: 'Отсутствие каски', count: 22 },
      { violation_type__name: 'Отсутствие жилета', count: 15 },
      { violation_type__name: 'Проникновение в зону', count: 10 },
    ],
  },
  alerts: [],
};

// Раскомментируйте для теста баннера алертов:
// stubSystemHealth.alerts = [{ type: 'critical', message: 'Диск заполнен более чем на 90%' }];

export const stubUnresolvedErrors: UnresolvedErrorsResponse = {
  errors: [
    { id: 'e5000000-0000-4000-8000-000000000001', level: 'ERROR', source: 'monitoring.camera', message: 'Потеря соединения RTSP: CAM-02', created_at: '2026-06-08T08:12:00' },
  ],
  total: 1,
  last_updated: new Date().toISOString(),
};

export const stubAnalytics: AnalyticsData = {
  violations_by_day: [
    { date: '2026-06-02', count: 3 },
    { date: '2026-06-03', count: 5 },
    { date: '2026-06-04', count: 2 },
    { date: '2026-06-05', count: 7 },
    { date: '2026-06-06', count: 4 },
    { date: '2026-06-07', count: 6 },
    { date: '2026-06-08', count: 4 },
  ],
  violations_by_type: [
    { type: 'Отсутствие каски', count: 22 },
    { type: 'Отсутствие жилета', count: 15 },
    { type: 'Проникновение в зону', count: 10 },
  ],
  violations_by_object: [
    { object: 'Цех №1', count: 28 },
    { object: 'Склад', count: 14 },
    { object: 'Проходная', count: 5 },
  ],
  detections_by_hour: Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    count: Math.floor(Math.random() * 20) + 2,
  })),
};

export function paginate<T>(items: T[], page = 1, pageSize = 20): Paginated<T> {
  const start = (page - 1) * pageSize;
  const results = items.slice(start, start + pageSize);
  return {
    count: items.length,
    next: start + pageSize < items.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}

export function filterViolations(filters: {
  object_id?: string;
  camera_id?: string;
  violation_type?: string;
  case_status?: string;
  date_from?: string;
  date_to?: string;
}): ViolationCase[] {
  return stubViolations.filter((v) => {
    if (filters.object_id) {
      const obj = stubObjects.find((o) => o.id === Number(filters.object_id));
      if (obj && v.object_name !== obj.name) return false;
    }
    if (filters.camera_id && v.camera !== Number(filters.camera_id)) return false;
    if (filters.violation_type && v.violation_type !== Number(filters.violation_type)) return false;
    if (filters.case_status && v.case_status !== filters.case_status) return false;
    if (filters.date_from && v.created_at < filters.date_from) return false;
    if (filters.date_to && v.created_at > filters.date_to + 'T23:59:59') return false;
    return true;
  });
}

export function filterFrames(filters: { object_id?: string; camera_id?: string; has_detections?: boolean }): Frame[] {
  return stubFrames.filter((f) => {
    if (filters.has_detections && !(f.detections_count && f.detections_count > 0)) return false;
    if (filters.camera_id && f.camera !== Number(filters.camera_id)) return false;
    if (filters.object_id) {
      const obj = stubObjects.find((o) => o.id === Number(filters.object_id));
      if (obj && f.object_name !== obj.name) return false;
    }
    return true;
  });
}
