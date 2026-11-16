import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(import.meta.dirname, '../../public/404.html'), 'utf8');
const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

/** Runs the page's redirect script as GitHub Pages would for a request to `url`; returns where it sends the browser. */
function redirectFor(url: string): string {
  const { hostname, pathname, search } = new URL(url);
  let target = '';
  const location = {
    hostname,
    pathname,
    search,
    replace: (to: string) => {
      target = to;
    },
  };
  runInNewContext(script, { location });
  return target;
}

describe('404.html', () => {
  it('contains the redirect script', () => {
    expect(script).toContain('location.replace');
  });

  it('turns a deep link on a project site into a hash route under the repository', () => {
    expect(redirectFor('https://snytkine.github.io/demanddns-web/features')).toBe('/demanddns-web/#/features');
  });

  it('keeps nested paths and the query string', () => {
    expect(redirectFor('https://snytkine.github.io/demanddns-web/docs/dns?q=cache')).toBe(
      '/demanddns-web/#/docs/dns?q=cache',
    );
  });

  it('handles a trailing slash', () => {
    expect(redirectFor('https://snytkine.github.io/demanddns-web/download/')).toBe('/demanddns-web/#/download/');
  });

  it('does not treat the first path segment as a repository on a custom domain', () => {
    expect(redirectFor('https://commanddns.example.com/features')).toBe('/#/features');
  });

  it('sends an unknown address to the app, which shows its own not-found page', () => {
    expect(redirectFor('https://snytkine.github.io/demanddns-web/nope')).toBe('/demanddns-web/#/nope');
  });
});
