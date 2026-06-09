import { request, USE_STUBS } from './client';
import {
  buildFrameDetail,
  filterFrames,
  filterViolations,
  paginate,
  stubAnalytics,
  stubCameras,
  stubDetectionParams,
  stubDetectionsByFrame,
  stubFrames,
  stubModels,
  stubObjects,
  stubSystemHealth,
  stubUnresolvedErrors,
  stubViolationActions,
  stubModelClasses,
  stubViolationTypes,
  stubViolations,
} from './stubs/data';
import type {
  AnalyticsData,
  Camera,
  DetectionParams,
  DetectionRecord,
  FrameDetailResponse,
  FrameFilters,
  MlModel,
  ModelClasses,
  MonitoredObject,
  Paginated,
  SystemHealthReport,
  UnresolvedErrorsResponse,
  VideoWallLatest,
  ViolationCase,
  ViolationCaseAction,
  ViolationCaseStatus,
  ViolationFilters,
  ViolationType,
  Frame,
} from '@/types';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function getSystemHealth(refresh = false): Promise<SystemHealthReport> {
  if (USE_STUBS) {
    await delay();
    return { ...stubSystemHealth, timestamp: new Date().toISOString() };
  }
  return request<SystemHealthReport>(`/api/system-health/${refresh ? '?refresh=true' : ''}`);
}

export async function getUnresolvedErrors(): Promise<UnresolvedErrorsResponse> {
  if (USE_STUBS) {
    await delay();
    return { ...stubUnresolvedErrors, last_updated: new Date().toISOString() };
  }
  return request<UnresolvedErrorsResponse>('/api/system-health/unresolved_errors/');
}

export async function resolveError(errorId: string): Promise<void> {
  if (USE_STUBS) {
    await delay();
    const idx = stubUnresolvedErrors.errors.findIndex((e) => e.id === errorId);
    if (idx >= 0) stubUnresolvedErrors.errors.splice(idx, 1);
    stubUnresolvedErrors.total = stubUnresolvedErrors.errors.length;
    return;
  }
  await request('/api/system-health/resolve_error/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error_id: errorId }),
  });
}

export async function resolveAllErrors(): Promise<void> {
  if (USE_STUBS) {
    await delay();
    stubUnresolvedErrors.errors.length = 0;
    stubUnresolvedErrors.total = 0;
    return;
  }
  await request('/api/system-health/resolve_all_errors/', { method: 'POST' });
}

export async function manualCleanup(): Promise<{ message: string }> {
  if (USE_STUBS) {
    await delay(500);
    stubSystemHealth.cleanup.last_cleanup = new Date().toISOString();
    return { message: 'Удалено: 42 кадра, 3 лога (заглушка)' };
  }
  const data = await request<{ status: string; frames_deleted?: number; logs_deleted?: number; message?: string }>(
    '/api/system-health/cleanup_database/',
    { method: 'POST' },
  );
  return {
    message: data.message ?? `Удалено: ${data.frames_deleted ?? 0} кадров, ${data.logs_deleted ?? 0} логов`,
  };
}

export async function getFrames(filters: FrameFilters = {}): Promise<Paginated<Frame>> {
  if (USE_STUBS) {
    await delay();
    const list = filterFrames(filters);
    return paginate(list, filters.page ?? 1, filters.page_size ?? 20);
  }
  const q = buildQuery({
    page: filters.page,
    page_size: filters.page_size,
    object_id: filters.object_id,
    camera_id: filters.camera_id,
    has_detections: filters.has_detections ? 'true' : undefined,
  });
  return request<Paginated<Frame>>(`/api/frames/${q}`);
}

export async function getFrameDetail(id: string): Promise<FrameDetailResponse | undefined> {
  if (USE_STUBS) {
    await delay();
    return buildFrameDetail(id);
  }
  return request<FrameDetailResponse>(`/api/frames/${id}/`);
}

export async function getDetectionsByFrame(frameId: string): Promise<DetectionRecord[]> {
  if (USE_STUBS) {
    await delay();
    return stubDetectionsByFrame[frameId] ?? [];
  }
  return request<DetectionRecord[]>(`/api/detections/by_frame/?frame_id=${frameId}`);
}

export async function getDetectionsByFrames(frameIds: string[]): Promise<Record<string, DetectionRecord[]>> {
  if (USE_STUBS) {
    await delay();
    const result: Record<string, DetectionRecord[]> = {};
    for (const id of frameIds) {
      result[id] = stubDetectionsByFrame[id] ?? [];
    }
    return result;
  }
  return request<Record<string, DetectionRecord[]>>(`/api/detections/by_frame/?frame_ids=${frameIds.join(',')}`);
}

export async function getViolationCases(filters: ViolationFilters = {}): Promise<Paginated<ViolationCase>> {
  if (USE_STUBS) {
    await delay();
    const list = filterViolations(filters);
    return paginate(list, filters.page ?? 1, filters.page_size ?? 20);
  }
  const q = buildQuery({
    page: filters.page,
    page_size: filters.page_size,
    object_id: filters.object_id,
    camera_id: filters.camera_id,
    violation_type: filters.violation_type,
    case_status: filters.case_status || undefined,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  return request<Paginated<ViolationCase>>(`/api/violation-cases/${q}`);
}

export async function getViolationCase(id: string): Promise<ViolationCase | undefined> {
  if (USE_STUBS) {
    await delay();
    return stubViolations.find((v) => v.id === id);
  }
  return request<ViolationCase>(`/api/violation-cases/${id}/`);
}

export async function getViolationCaseActions(caseId: string): Promise<ViolationCaseAction[]> {
  if (USE_STUBS) {
    await delay();
    return stubViolationActions.filter((a) => a.violation_case === caseId);
  }
  return request<ViolationCaseAction[]>(`/api/violation-case-actions/?violation_case_id=${caseId}`);
}

export async function updateViolationStatus(id: string, case_status: ViolationCaseStatus): Promise<ViolationCase> {
  if (USE_STUBS) {
    await delay();
    const item = stubViolations.find((v) => v.id === id);
    if (!item) throw new Error('Нарушение не найдено');
    item.case_status = case_status;
    return { ...item };
  }
  return request<ViolationCase>(`/api/violation-cases/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_status }),
  });
}

export async function getAnalytics(): Promise<AnalyticsData> {
  if (USE_STUBS) {
    await delay(300);
    return { ...stubAnalytics };
  }
  return request<AnalyticsData>('/api/analytics/');
}

export async function getObjects(): Promise<MonitoredObject[]> {
  if (USE_STUBS) {
    await delay();
    return [...stubObjects];
  }
  return request<MonitoredObject[]>('/api/monitored-objects/');
}

export async function getCameras(workUnit?: number): Promise<Camera[]> {
  if (USE_STUBS) {
    await delay();
    let list = [...stubCameras];
    if (workUnit) list = list.filter((c) => c.work_unit === workUnit);
    return list;
  }
  const q = workUnit ? `?work_unit=${workUnit}` : '';
  return request<Camera[]>(`/api/cameras/${q}`);
}

export async function getModels(): Promise<MlModel[]> {
  if (USE_STUBS) {
    await delay();
    return [...stubModels];
  }
  return request<MlModel[]>('/api/models/');
}

export async function getDetectionParams(): Promise<DetectionParams[]> {
  if (USE_STUBS) {
    await delay();
    return [...stubDetectionParams];
  }
  return request<DetectionParams[]>('/api/detection-params/');
}

export async function getViolationTypes(): Promise<ViolationType[]> {
  if (USE_STUBS) {
    await delay();
    return [...stubViolationTypes];
  }
  return request<ViolationType[]>('/api/violation-types/');
}

export async function getVideoWallLatest(cameraId: number, lastFrameId?: string): Promise<VideoWallLatest> {
  if (USE_STUBS) {
    await delay(100);
    const frame = stubFrames.find((f) => f.camera === cameraId);
    const dets = frame ? stubDetectionsByFrame[frame.id] ?? [] : [];
    const items = dets.flatMap((d) => d.detection_log?.detections ?? []);
    return {
      has_new: true,
      frame_id: frame?.id ?? 'stub-frame',
      camera_id: cameraId,
      sent_at: frame?.recorded_at ?? frame?.received_at,
      received_at: frame?.received_at,
      created_at: frame?.received_at,
      detections: items,
      detection_count: items.length,
    };
  }
  const q = lastFrameId ? `?camera_id=${cameraId}&last_frame_id=${lastFrameId}` : `?camera_id=${cameraId}`;
  return request<VideoWallLatest>(`/video-wall/latest/${q}`);
}

export async function getModelClasses(modelId: number): Promise<ModelClasses> {
  if (USE_STUBS) {
    await delay();
    const model = stubModels.find((m) => m.id === modelId);
    return {
      model_id: modelId,
      model_name: model?.name ?? 'Model',
      classes: stubModelClasses[modelId] ?? [],
    };
  }
  return request<ModelClasses>(`/api/models/${modelId}/classes/`);
}

export async function createObject(data: { name: string; description?: string }): Promise<MonitoredObject> {
  if (USE_STUBS) {
    await delay();
    const item = { id: stubObjects.length + 1, ...data };
    stubObjects.push(item);
    return item;
  }
  return request<MonitoredObject>('/api/monitored-objects/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateObject(id: number, data: { name: string; description?: string }): Promise<MonitoredObject> {
  if (USE_STUBS) {
    await delay();
    const item = stubObjects.find((o) => o.id === id);
    if (!item) throw new Error('Объект не найден');
    Object.assign(item, data);
    return { ...item };
  }
  return request<MonitoredObject>(`/api/monitored-objects/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteObject(id: number): Promise<void> {
  if (USE_STUBS) {
    await delay();
    const idx = stubObjects.findIndex((o) => o.id === id);
    if (idx >= 0) stubObjects.splice(idx, 1);
    return;
  }
  await request(`/api/monitored-objects/${id}/`, { method: 'DELETE' });
}

export async function createDetectionParams(data: {
  monitored_object: number;
  camera: number;
  model: number;
  frame_skip: number;
  violation_types: number[];
}): Promise<DetectionParams> {
  if (USE_STUBS) {
    await delay();
    const obj = stubObjects.find((o) => o.id === data.monitored_object);
    const cam = stubCameras.find((c) => c.id === data.camera);
    const model = stubModels.find((m) => m.id === data.model);
    const item: DetectionParams = {
      id: stubDetectionParams.length + 1,
      monitored_object: data.monitored_object,
      monitored_object_name: obj?.name,
      camera: data.camera,
      camera_name: cam?.name,
      model: data.model,
      model_name: model?.name,
      frame_skip: data.frame_skip,
      violation_types: data.violation_types,
      violation_types_count: data.violation_types.length,
      processing_status: 'idle',
      processing_status_display: 'Не ведётся',
      is_active: true,
    };
    stubDetectionParams.push(item);
    return item;
  }
  return request<DetectionParams>('/api/detection-params/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, violation_types_ids: data.violation_types, is_active: true }),
  });
}

export async function updateDetectionParams(
  id: number,
  data: { monitored_object: number; camera: number; model: number; frame_skip: number; violation_types: number[] },
): Promise<DetectionParams> {
  if (USE_STUBS) {
    await delay();
    const item = stubDetectionParams.find((p) => p.id === id);
    if (!item) throw new Error('Параметры не найдены');
    const obj = stubObjects.find((o) => o.id === data.monitored_object);
    const cam = stubCameras.find((c) => c.id === data.camera);
    const model = stubModels.find((m) => m.id === data.model);
    Object.assign(item, {
      ...data,
      monitored_object_name: obj?.name,
      camera_name: cam?.name,
      model_name: model?.name,
      violation_types_count: data.violation_types.length,
    });
    return { ...item };
  }
  return request<DetectionParams>(`/api/detection-params/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, violation_types_ids: data.violation_types, is_active: true }),
  });
}

export async function deleteDetectionParams(id: number): Promise<void> {
  if (USE_STUBS) {
    await delay();
    const idx = stubDetectionParams.findIndex((p) => p.id === id);
    if (idx >= 0) stubDetectionParams[idx].is_active = false;
    return;
  }
  await request(`/api/detection-params/${id}/`, { method: 'DELETE' });
}

export async function startDetection(id: number): Promise<DetectionParams> {
  if (USE_STUBS) {
    await delay();
    const item = stubDetectionParams.find((p) => p.id === id);
    if (!item) throw new Error('Параметры не найдены');
    item.processing_status = 'running';
    item.processing_status_display = 'Ведётся';
    return { ...item };
  }
  const res = await request<{ processing_status: string }>(`/api/detection-params/${id}/start/`, { method: 'POST' });
  const item = await getDetectionParams().then((list) => list.find((p) => p.id === id));
  if (!item) throw new Error('Параметры не найдены');
  item.processing_status = res.processing_status as DetectionParams['processing_status'];
  return item;
}

export async function pauseDetection(id: number): Promise<DetectionParams> {
  if (USE_STUBS) {
    await delay();
    const item = stubDetectionParams.find((p) => p.id === id);
    if (!item) throw new Error('Параметры не найдены');
    item.processing_status = 'idle';
    item.processing_status_display = 'Не ведётся';
    return { ...item };
  }
  await request(`/api/detection-params/${id}/pause/`, { method: 'POST' });
  const item = await getDetectionParams().then((list) => list.find((p) => p.id === id));
  if (!item) throw new Error('Параметры не найдены');
  return item;
}

export async function testCameraConnection(id: number): Promise<{ status: string; message: string }> {
  if (USE_STUBS) {
    await delay(500);
    const cam = stubCameras.find((c) => c.id === id);
    return { status: 'connected', message: `Подключение к ${cam?.name ?? 'камере'} успешно (заглушка)` };
  }
  return request(`/api/cameras/${id}/test_connection/`, { method: 'POST' });
}
