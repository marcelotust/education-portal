const RELOAD_ATTEMPTED_KEY = 'edp-stale-chunk-reload';

/**
 * A tab left open across a deploy holds an index.html referencing JS chunk
 * hashes the new deployment no longer serves. Vercel's SPA catch-all
 * rewrite (vercel.json) then returns index.html for that missing chunk
 * instead of a 404, and the browser refuses to run text/html as a module —
 * the exact crash Sentry reported on /host (event 490969e6).
 *
 * Vite's own dynamic-import wrapper already detects this and dispatches
 * `vite:preloadError`; calling preventDefault stops it re-throwing into the
 * app at all, so a reload — which fetches the fresh index.html and the
 * correct chunk — resolves it before it ever reaches the error boundary.
 * Guarded by sessionStorage so a genuinely broken chunk only reloads once
 * per tab, not in a loop.
 */
export const recoverFromStaleChunk = () => {
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem(RELOAD_ATTEMPTED_KEY)) return;

    event.preventDefault();
    sessionStorage.setItem(RELOAD_ATTEMPTED_KEY, '1');
    window.location.reload();
  });
};
