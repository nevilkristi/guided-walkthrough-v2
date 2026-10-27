import { useEffect, useState } from 'react';
import { PANEL_BASE, PANEL_COUNT } from '../data/story.js';

export const panelSrc = (n) => `${PANEL_BASE}/${n}.png`;

export default function ComicPanel({ panel, caption, compact = false }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [panel]);

  // Warm the cache for the next panel so scrolling feels instant.
  useEffect(() => {
    if (panel < PANEL_COUNT) new Image().src = panelSrc(panel + 1);
  }, [panel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const label = `Comic panel ${panel} of ${PANEL_COUNT}`;

  return (
    <>
      <figure className={`comic ${compact ? 'compact' : ''}`}>
        {failed ? (
          <div className="comic-fallback">{label}{caption ? ` · ${caption}` : ''}</div>
        ) : (
          <button className="comic-btn" onClick={() => setOpen(true)} aria-label={`${label}, open full screen`}>
            <img key={panel} src={panelSrc(panel)} alt={caption || label} onError={() => setFailed(true)} />
          </button>
        )}
        <figcaption>
          <span className="panel-no">Panel {panel}/{PANEL_COUNT}</span>
          {!compact && <span className="muted"> · click to enlarge</span>}
        </figcaption>
      </figure>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={label} onClick={() => setOpen(false)}>
          <img src={panelSrc(panel)} alt={caption || label} />
          <button className="lightbox-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>
      )}
    </>
  );
}
