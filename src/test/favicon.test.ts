import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const svgText = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8');
const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml');

/** Reads a letter outline "M<x> <y>h<stem>a<r> <r> 0 0 1 0 <height>h-<stem>z": a stem plus a half circle. */
function letterBox(element: Element): { x: number; y: number; width: number; height: number } {
  const match = /^M([\d.]+) ([\d.]+)h(\d+)a(\d+) \d+ 0 0 1 0 (\d+)h-\d+z$/.exec(element.getAttribute('d') ?? '');
  const [x, y, stem, radius, height] = (match ?? []).slice(1).map(Number);
  return { x: x ?? NaN, y: y ?? NaN, width: (stem ?? NaN) + (radius ?? NaN), height: height ?? NaN };
}

describe('favicon.svg', () => {
  it('is a valid SVG', () => {
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.documentElement.tagName).toBe('svg');
  });

  it('is drawn in the blues of the Download button', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    const button =
      /\.button--primary \{[^}]*background: linear-gradient\(180deg, (#[0-9a-f]{6}), (#[0-9a-f]{6})\)/i.exec(css);
    expect(button).not.toBeNull();
    const stops = [...svg.querySelectorAll('linearGradient stop')].map((stop) => stop.getAttribute('stop-color'));
    expect(stops).toEqual([button?.[1], button?.[2]]);
  });

  it('shows two letters D, the second offset 50% of a letter right and 40% down', () => {
    const letters = [...svg.querySelectorAll('path.letter')].map((letter) => letterBox(letter));
    expect(letters).toHaveLength(2);
    const [first, second] = letters;
    expect(second?.width).toBe(first?.width);
    expect(second?.height).toBe(first?.height);
    expect(second?.x ?? 0).toBeCloseTo((first?.x ?? 0) + (first?.width ?? 0) * 0.5);
    expect(second?.y ?? 0).toBeCloseTo((first?.y ?? 0) + (first?.height ?? 0) * 0.4);
  });

  it('is the icon the page links to', () => {
    expect(readFileSync(resolve(root, 'index.html'), 'utf8')).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    );
  });
});
