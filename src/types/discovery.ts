export type ResponseLine = 'L1' | 'L2' | 'L3';

export type DiscoveryStatus =
  | 'pending'
  | 'violation'
  | 'ai_error'
  | 'expiring'
  | 'processed';

export type StatusBadgeKind = 'pending' | 'violation' | 'ai_error';

export interface UserProfile {
  name: string;
  line: ResponseLine;
  initials: string;
  location: string;
}

export interface SystemEvent {
  id: string;
  time: string;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export interface Discovery {
  id: string;
  title: string;
  shortTitle: string;
  violationType: string;
  violationCategory: string;
  suspectedViolation?: string;
  objectName: string;
  master: string;
  brigade: string;
  zone: string;
  detectionZone?: string;
  cameraId: string;
  cameraName: string;
  detectedAt: string;
  detectedAtRelative: string;
  receivedAt: string;
  deadlineAt: string;
  deadlineTimer: string;
  deadlineSub?: string;
  status: DiscoveryStatus;
  statusLabel: string;
  statusKind: StatusBadgeKind;
  statusSub?: string;
  violators: string;
  line: ResponseLine;
  locationLine?: string;
  thumbnailUrl?: string;
}

export interface DiscoveryDetail extends Discovery {
  fullTitle: string;
  comment?: string;
  statusHistory: StatusHistoryEntry[];
  evaluationQuestion: string;
  currentReviewer?: ReviewerProfile;
  videoTimestamp?: string;
  /** ISO-время ключевого кадра для пакета соседних кадров */
  keyFrameRecordedAt?: string;
  mainFrameId?: string;
}

export interface StatusHistoryEntry {
  id: string;
  line: ResponseLine;
  userName: string;
  userInitials: string;
  role?: string;
  timestamp?: string;
  status: string;
  statusKind: StatusBadgeKind;
  comment?: string;
  violators?: string;
}

export interface ReviewerProfile {
  name: string;
  initials: string;
  role: string;
  line: ResponseLine;
}

export interface NotificationItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
  type: 'discovery' | 'system' | 'deadline';
  read: boolean;
  discoveryId?: string;
}

export interface StatisticsPeriod {
  label: string;
  value: string;
}

export interface ChartSeries {
  label: string;
  violations: number;
  aiErrors: number;
  overdue: number;
}

export interface DashboardData {
  problemsCount: number;
  events: SystemEvent[];
  unprocessedCount: number;
  expiringCount: number;
  unprocessed: Discovery[];
  expiring: Discovery[];
}

export interface DiscoveriesListData {
  total: number;
  filtered: number;
  pendingCount: number;
  expiringCount: number;
  items: Discovery[];
}
