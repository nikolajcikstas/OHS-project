import { useState } from 'react';
import { figmaAssets } from '@/assets/figma';
import type { DiscoveryDetail } from '@/types/discovery';

interface StatusTimelineProps {
  discovery: DiscoveryDetail;
  onSubmit: (isViolation: boolean) => void;
}

function lineLabel(line: string, suffix?: string) {
  const cyrillic = line.replace('L', 'Л');
  return suffix ? `${cyrillic} • ${suffix}` : cyrillic;
}

export function StatusTimeline({ discovery, onSubmit }: StatusTimelineProps) {
  const [choice, setChoice] = useState<'violation' | 'not_violation' | null>(null);
  const l3User = discovery.currentReviewer;

  return (
    <section className="figma-status-timeline">
      {discovery.statusHistory.map((entry) => (
        <div key={entry.id} className="figma-status-entry">
          <div className="figma-status-entry__body">
            <div className="figma-status-entry__head">
              <span className="figma-status-entry__line-label">{lineLabel(entry.line)}</span>
              <div className={`avatar avatar--${entry.line.toLowerCase()}`}>{entry.userInitials}</div>
              <div className="figma-status-entry__user">
                <div className="figma-status-entry__name">{entry.userName}</div>
                {entry.role && <div className="figma-status-entry__role">{entry.role}</div>}
                {entry.timestamp && <div className="figma-status-entry__time">{entry.timestamp}</div>}
              </div>
            </div>
            <div className="figma-status-entry__field">
              <span className="figma-info__label">Статус</span>
              <span className={`figma-info__badge figma-info__badge--${entry.statusKind}`}>{entry.status}</span>
            </div>
            {entry.violators && (
              <div className="figma-status-entry__field">
                <span className="figma-info__label">Нарушители</span>
                <span className="figma-info__value">{entry.violators}</span>
              </div>
            )}
            {entry.comment && (
              <div className="figma-status-entry__field">
                <span className="figma-info__label">Комментарий</span>
                <span className="figma-info__value">{entry.comment}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {l3User && (
        <div className="figma-status-entry figma-status-entry--current">
          <div className="figma-status-entry__body">
            <div className="figma-status-entry__head">
              <span className="figma-status-entry__line-label">{lineLabel('L3', 'Вы')}</span>
              <div className="avatar avatar--l3">{l3User.initials}</div>
              <div className="figma-status-entry__user">
                <div className="figma-status-entry__name">{l3User.name}</div>
                <div className="figma-status-entry__role">{l3User.role}</div>
              </div>
            </div>
            <p className="figma-status-entry__question">{discovery.evaluationQuestion}</p>
            <div className="figma-eval-actions">
              <button
                type="button"
                className={`figma-eval-btn${choice === 'violation' ? ' figma-eval-btn--active' : ''}`}
                onClick={() => setChoice('violation')}
              >
                <span className="figma-eval-btn__icon">✓</span>
                Это нарушение
              </button>
              <button
                type="button"
                className={`figma-eval-btn${choice === 'not_violation' ? ' figma-eval-btn--active' : ''}`}
                onClick={() => setChoice('not_violation')}
              >
                <span className="figma-eval-btn__icon">✕</span>
                Это не нарушение
              </button>
            </div>
            <button
              type="button"
              className="figma-eval-submit"
              disabled={!choice}
              onClick={() => choice && onSubmit(choice === 'violation')}
            >
              Отправить
            </button>
          </div>
        </div>
      )}

      {/* Figma reference layers (hidden, for pixel parity checks) */}
      <div className="figma-ref-hidden" aria-hidden>
        <img src={figmaAssets.statusL1} alt="" />
        <img src={figmaAssets.statusL2} alt="" />
        <img src={figmaAssets.statusL3Eval} alt="" />
      </div>
    </section>
  );
}
