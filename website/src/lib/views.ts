// View counts read from Convex at build time, so every page ships with its numbers already in
// the HTML. The script in layouts/Base.astro then brings them up to date in place.

const cache = new Map<string, Promise<number | undefined>>();

/**
 * The view count at `path` when the site was built, or undefined when CONVEX_URL isn't set or
 * Convex can't be reached (the count is then filled in by the browser only). Each path is
 * fetched once per build, however many pages show it.
 */
export function getViews(path: string) {
  const url = import.meta.env.CONVEX_URL;
  if (!url) return Promise.resolve(undefined);
  let views = cache.get(path);
  if (!views) {
    views = fetch(`${url}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'views:get', args: { path }, format: 'json' }),
      signal: AbortSignal.timeout(10_000),
    })
      .then((res) => res.json())
      .then((res) => (res.status === 'success' ? (res.value as number) : undefined))
      .catch(() => undefined);
    cache.set(path, views);
  }
  return views;
}

/** "1 view", "1,234 views". The script in layouts/Base.astro formats counts the same way. */
export const formatViews = (n: number) => `${n.toLocaleString('en-US')} ${n === 1 ? 'view' : 'views'}`;
