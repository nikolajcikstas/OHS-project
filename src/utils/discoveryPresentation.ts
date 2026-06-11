import type { Discovery, ResponseLine } from '@/types/discovery';

/**
 * BNDesign: «Для Л1 в «Дата и время» показывать «Поступило»».
 * «для Л2 и Л3 вместо «Дата и время» — «Поступило»».
 * «Для «Поступило» у Л2 и Л3 относительное время не нужно».
 */
export function getDiscoveryTableDateColumn(userLine: ResponseLine) {
  if (userLine === 'L1') {
    return {
      header: 'Дата и время',
      getPrimary: (d: Discovery) => d.receivedAt,
      getRelative: (d: Discovery) => d.detectedAtRelative,
      showRelative: true,
    };
  }

  return {
    header: 'Поступило',
    getPrimary: (d: Discovery) => d.receivedAt,
    getRelative: () => '',
    showRelative: false,
  };
}

/** BNDesign: «Возможно статусы не нужны для л2 и л3» */
export function showStatusColumn(userLine: ResponseLine) {
  return userLine === 'L1';
}

/** BNDesign: «Нужны ли «Нарушители» для Л2 и Л3?» — скрываем для L2/L3 */
export function showViolatorsColumn(userLine: ResponseLine) {
  return userLine === 'L1';
}

/** Инфо-панель: L1 — оба поля, L2/L3 — только «Поступило» без относительного времени */
export function shouldShowDetectionDateField(viewerLine: ResponseLine) {
  return viewerLine === 'L1';
}

export function lineLabelCyrillic(line: ResponseLine) {
  return line.replace('L', 'Л');
}
