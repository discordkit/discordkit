/**
 * Client-side fetch helper for the authenticated API routes. On a 401 (no
 * session, or no linked Discord account) it sends the user back to `/`, where
 * the server renders the logged-out view — so the dashboard never gets stuck
 * showing "couldn't load" errors with no way back to login.
 */
export const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (res.status === 401) {
    // Hard-navigate so the server re-renders the logged-out page.
    window.location.replace(`/`);
    // Never resolves — the navigation tears down the page.
    return new Promise<T>(() => {});
  }
  if (!res.ok) {
    throw new Error(`Request to ${url} failed (${res.status})`);
  }
  return res.json();
};
