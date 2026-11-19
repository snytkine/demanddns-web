import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetLatestReleaseCache } from '../lib/release';
import { resetReleaseNotesCache } from '../lib/releaseNotes';

/** jsdom has no matchMedia; tests choose which media queries match. */
export function stubMatchMedia(matches: (query: string) => boolean = () => false): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matches(query),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  stubMatchMedia();
  // jsdom logs "not implemented" for scrollTo.
  vi.stubGlobal('scrollTo', vi.fn());
  // No test may reach the real GitHub API; tests that need an answer stub fetch themselves.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('network disabled in tests'))),
  );
  resetLatestReleaseCache();
  resetReleaseNotesCache();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
});
