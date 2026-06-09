import {
  getDiscoveriesList,
  getDiscoveryDetail,
  stubChartData,
  stubDashboard,
  stubNotifications,
  stubUser,
} from './stubs/discoveries';
import {
  buildDiscoveryDetectionsMap,
  buildDiscoveryFrameDetail,
} from './stubs/discoveryFrames';
import type {
  ChartSeries,
  DashboardData,
  DiscoveryDetail,
  DiscoveriesListData,
  NotificationItem,
  UserProfile,
} from '@/types/discovery';
import type { DetectionRecord, Frame, FrameDetailResponse } from '@/types';

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

export async function getCurrentUser(): Promise<UserProfile> {
  await delay();
  return stubUser;
}

export async function getDashboard(): Promise<DashboardData> {
  await delay();
  return stubDashboard;
}

export async function getDiscoveries(
  tab: 'all' | 'pending' | 'expiring' = 'all',
): Promise<DiscoveriesListData> {
  await delay();
  return getDiscoveriesList(tab);
}

export async function getDiscovery(id: string): Promise<DiscoveryDetail | null> {
  await delay();
  return getDiscoveryDetail(id);
}

export async function getNotifications(): Promise<NotificationItem[]> {
  await delay();
  return stubNotifications;
}

export async function getStatistics(): Promise<ChartSeries[]> {
  await delay();
  return stubChartData;
}

export async function updateDiscoveryStatus(
  _id: string,
  _status: string,
  _comment?: string,
): Promise<void> {
  await delay(300);
}

export interface DiscoveryFrameBundle {
  frames: Frame[];
  keyFrameIndex: number;
  detectionsMap: Record<string, DetectionRecord[]>;
  neighborsInfo: FrameDetailResponse['neighbors_info'];
}

export async function getDiscoveryFrameBundle(discoveryId: string): Promise<DiscoveryFrameBundle | null> {
  await delay(220);
  const discovery = getDiscoveryDetail(discoveryId);
  if (!discovery) return null;

  const detail = buildDiscoveryFrameDetail(
    discovery.id,
    discovery.cameraId,
    discovery.cameraName,
    discovery.objectName,
    discovery.keyFrameRecordedAt ?? discovery.detectedAt,
  );
  if (!detail) return null;

  const before = detail.neighbors.slice(0, detail.neighbors_info.before);
  const after = detail.neighbors.slice(detail.neighbors_info.before);
  const frames = [...before, detail.frame, ...after];
  const keyFrameIndex = before.length;

  return {
    frames,
    keyFrameIndex,
    detectionsMap: buildDiscoveryDetectionsMap(frames, keyFrameIndex),
    neighborsInfo: detail.neighbors_info,
  };
}
