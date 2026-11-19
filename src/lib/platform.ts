import type { Platform } from '../config/site';

/**
 * Guesses the visitor's desktop platform from the user agent string.
 *
 * @param userAgent - navigator.userAgent value
 * @returns the detected platform, or `null` for mobile and unknown systems
 */
export function detectPlatform(userAgent: string): Platform | null {
  if (/android|iphone|ipad|ipod/i.test(userAgent)) return null;
  if (/windows/i.test(userAgent)) return 'windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'mac';
  return null;
}
