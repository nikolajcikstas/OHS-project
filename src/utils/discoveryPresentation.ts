import type { Discovery, ResponseLine } from '@/types/discovery';

/** Колонка таблицы обнаружений зависит от линии ответа пользователя (комментарий BNDesign в Figma). */
export function getDiscoveryTableDateColumn(userLine: ResponseLine) {
  if (userLine === 'L1') {
    return {
      header: 'Дата и время',
      getPrimary: (d: Discovery) => d.detectedAt,
      getRelative: (d: Discovery) => d.detectedAtRelative,
    };
  }

  return {
    header: 'Поступило',
    getPrimary: (d: Discovery) => d.receivedAt,
    getRelative: (d: Discovery) => d.receivedAtRelative ?? d.detectedAtRelative,
  };
}

/** Поля инфо-панели на детальной странице (L1 — оба поля, L2/L3 — только «Поступило»). */
export function shouldShowDetectionDateField(viewerLine: ResponseLine) {
  return viewerLine === 'L1';
}

export function lineLabelCyrillic(line: ResponseLine) {
  return line.replace('L', 'Л');
}
