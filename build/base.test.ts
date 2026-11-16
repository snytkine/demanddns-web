import { describe, expect, it } from 'vitest';
import { resolveBase } from './base';

describe('resolveBase', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['/', '/'],
    ['/demanddns-web', '/demanddns-web/'],
    ['/demanddns-web/', '/demanddns-web/'],
    ['demanddns-web', '/demanddns-web/'],
    ['/a/b', '/a/b/'],
  ])('turns %j into %j', (input, expected) => {
    expect(resolveBase(input)).toBe(expected);
  });
});
