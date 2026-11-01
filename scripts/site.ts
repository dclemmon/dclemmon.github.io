/**
 * Deployment settings shared by vite.config.ts and the build scripts.
 * BASE_PATH: path the app is served under ("/" for a domain or subdomain root).
 * SITE_URL: origin used for absolute links in the .ics calendar feeds.
 */
export function basePath(): string {
  let base = process.env.BASE_PATH ?? '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

export function appUrl(): string {
  const origin = (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
  return `${origin}${basePath()}`;
}
