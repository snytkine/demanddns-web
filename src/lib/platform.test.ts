import { describe, expect, it } from 'vitest';
import { detectPlatform } from './platform';

describe('detectPlatform', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 'mac'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120', 'windows'],
  ])('recognises a desktop system (%s)', (userAgent, platform) => {
    expect(detectPlatform(userAgent)).toBe(platform);
  });

  it.each([
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/120.0',
    '',
  ])('gives no platform for mobile or unknown systems (%s)', (userAgent) => {
    expect(detectPlatform(userAgent)).toBeNull();
  });
});
