/**
 * Links for subscribing to a calendar feed. Pure functions: callers pass the page URL
 * and the app's base path, so this works under any host or sub-path.
 */

export interface FeedLinks {
  /** Plain https:// address of the .ics file (download, Outlook, copy and paste). */
  https: string;
  /** webcal:// address: Apple Calendar and most desktop apps open it as a subscription. */
  webcal: string;
  /** Google Calendar's own "add this calendar" page for the feed (works on Android). */
  google: string;
}

export function feedLinks(file: string, base: string, pageUrl: string): FeedLinks {
  const https = new URL(`${base}${file}`, pageUrl).href;
  const webcal = https.replace(/^https?:/, 'webcal:');
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  return { https, webcal, google };
}
