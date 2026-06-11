import { useState } from 'react';
import { figmaAssets } from '@/assets/figma';
import type { DiscoveryDetail } from '@/types/discovery';
import { lineLabelCyrillic } from '@/utils/discoveryPresentation';

const COMMENT_MAX = 500;

interface StatusTimelineProps {
  discovery: DiscoveryDetail;
  onSubmit: (isViolation: boolean, comment: string) => void;
}

function lineLabel(line: string, suffix?: string) {
  const cyrillic = lineLabelCyrillic(line as 'L1' | 'L2' | 'L3');
  return suffix ? `${cyrillic} • ${suffix}` : cyrillic;
}

export function StatusTimeline({ discovery, onSubmit }: StatusTimelineProps) {
  const [choice, setChoice] = useState<'violation' | 'not_violation' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const l3User = discovery.currentReviewer;

  const handleSubmit = () => {
    if (!choice) return;
    onSubmit(choice === 'violation', comment.trim());
    setSubmitted(true);
  };

  const handleCancel = () => {
    setSubmitted(false);
    setChoice(null);
    setComment('');
  };

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

            {submitted ? (
              <div className="figma-eval-sent">
                <span className="figma-eval-sent__label">Отправлено</span>
                <button type="button" className="figma-eval-sent__cancel" onClick={handleCancel}>
                  Отменить
                </button>
              </div>
            ) : (
              <>
                <p className="figma-status-entry__question">{discovery.evaluationQuestion}</p>
                <div className="figma-eval-actions">
                  <button
                    type="button"
                    className={`figma-eval-btn${choice === 'violation' ? ' figma-eval-btn--active' : ''}`}
                    onClick={() => setChoice('violation')}
                  >
                    <span className={`figma-eval-btn__check${choice === 'violation' ? ' is-checked' : ''}`} aria-hidden />
                    Это нарушение
                  </button>
                  <button
                    type="button"
                    className={`figma-eval-btn${choice === 'not_violation' ? ' figma-eval-btn--active' : ''}`}
                    onClick={() => setChoice('not_violation')}
                  >
                    <span className={`figma-eval-btn__check${choice === 'not_violation' ? ' is-checked' : ''}`} aria-hidden />
                    Это не нарушение
                  </button>
                </div>
                <textarea
                  className="figma-eval-comment"
                  placeholder="Комментарий (необязательно)"
                  value={comment}
                  maxLength={COMMENT_MAX}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="figma-eval-comment__meta">
                  {comment.length}/{COMMENT_MAX}
                </div>
                <button
                  type="button"
                  className="figma-eval-submit"
                  disabled={!choice}
                  onClick={handleSubmit}
                >
                  Отправить
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="figma-ref-hidden" aria-hidden>
        <img src={figmaAssets.statusL1} alt="" />
        <img src={figmaAssets.statusL2} alt="" />
        <img src={figmaAssets.statusL3Eval} alt="" />
      </div>
    </section>
  );
}
