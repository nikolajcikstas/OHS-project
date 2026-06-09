export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MonitoredObject {
  id: number;
  name: string;
  description?: string;
}

export interface Camera {
  id: number;
  name: string;
  stream_url: string;
  work_unit?: number;
  work_unit_name?: string;
  zone?: string;
  is_active: boolean;
}

export interface MlModel {
  id: number;
  name: string;
  model_file?: string;
  framework?: string;
  is_active: boolean;
}

export interface DetectionParams {
  id: number;
  monitored_object?: number;
  monitored_object_name?: string;
  camera: number;
  camera_name?: string;
  model: number;
  model_name?: string;
  frame_skip: number;
  violation_types?: number[];
  violation_types_detail?: ViolationType[];
  violation_types_count?: number;
  processing_status: 'idle' | 'running' | 'error';
  processing_status_display?: string;
  is_active: boolean;
}

export interface VideoWallLatest {
  has_new: boolean;
  frame_id?: string;
  camera_id: number;
  image?: string;
  sent_at?: string;
  received_at?: string;
  created_at?: string;
  detections?: DetectionItem[];
  detection_count?: number;
}

export interface ModelClasses {
  model_id: number;
  model_name: string;
  classes: string[];
}

export interface ViolationType {
  id: number;
  code: string;
  name: string;
  group: string;
  group_display?: string;
}

export type ViolationCaseStatus = 'New' | 'Verified' | 'Rejected';

export interface ViolationCaseMetadata {
  affected_people?: number;
  consecutive_frames?: number;
  detection_details?: Record<string, unknown>;
}

export interface ViolationCase {
  id: string;
  violation_type: number;
  violation_type_code?: string;
  violation_type_name?: string;
  violation_type_group?: string;
  main_frame: string;
  main_frame_url?: string;
  object_name?: string;
  camera?: number;
  camera_name?: string;
  created_at: string;
  case_status: ViolationCaseStatus;
  metadata?: ViolationCaseMetadata;
}

export interface ViolationCaseAction {
  id: string;
  violation_case: string;
  user_name: string;
  action_type: 'verify' | 'reject' | 'comment' | 'assign';
  comment?: string;
  created_at: string;
}

export interface Frame {
  id: string;
  camera: number;
  camera_name?: string;
  object_name?: string;
  frame_url?: string | null;
  received_at: string;
  recorded_at?: string | null;
  is_important?: boolean;
  detections_count?: number;
}

export interface FrameDetailResponse {
  frame: Frame;
  neighbors: Frame[];
  neighbors_info: {
    total: number;
    expected: number;
    before: number;
    after: number;
    is_complete: boolean;
  };
}

export interface DetectionItem {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface DetectionRecord {
  id: string;
  received_frame: string;
  ml_model_name?: string;
  detection_log: { detections?: DetectionItem[] };
  detected_at: string;
}

export interface SystemError {
  id: string;
  level: 'ERROR' | 'CRITICAL' | 'WARNING';
  source: string;
  message: string;
  created_at: string;
  is_resolved?: boolean;
}

export interface UnresolvedErrorsResponse {
  errors: SystemError[];
  total: number;
  last_updated: string;
}

export interface SystemHealthReport {
  timestamp: string;
  disk: {
    usage_percent?: number;
    free_gb?: number;
    total_gb?: number;
    error?: string;
  };
  database: {
    size_mb?: number;
    size_gb?: number;
    frames_count?: number;
    detections_count?: number;
    violations_count?: number;
  };
  media: {
    size_gb?: number;
    files_count?: number;
    days_until_full?: number | null;
  };
  cameras: {
    active?: number;
    online?: number;
    offline?: number;
  };
  tasks: {
    active_tasks?: number;
    pending_tasks?: number;
    completed_tasks_last_hour?: number;
    failed_tasks_last_hour?: number;
    workers?: number;
    status?: string;
    beat_running?: boolean;
  };
  cleanup: {
    last_cleanup?: string | null;
    next_cleanup?: string | null;
    interval_minutes?: number;
  };
  violations: {
    total_violations?: number;
    unresolved_violations?: number;
    violations_today?: number;
    violations_week?: number;
    violations_by_type?: { violation_type__name: string; count: number }[];
  };
  alerts: { type?: string; level?: string; message: string }[];
}

export interface AnalyticsData {
  violations_by_day: { date: string; count: number }[];
  violations_by_type: { type: string; count: number }[];
  violations_by_object: { object: string; count: number }[];
  detections_by_hour: { hour: string; count: number }[];
}

export interface FrameFilters {
  object_id?: string;
  camera_id?: string;
  has_detections?: boolean;
  page?: number;
  page_size?: number;
}

export interface ViolationFilters {
  object_id?: string;
  camera_id?: string;
  violation_type?: string;
  case_status?: ViolationCaseStatus | '';
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
