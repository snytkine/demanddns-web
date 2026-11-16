import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const svgText = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8');
const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml');

/** The x/y offset of an element's `translate(x y)` transform. */
function translation(element: Element): [number, number] {
  const match = /translate\(([\d.]+) ([\d.]+)\)/.exec(element.getAttribute('transform') ?? '');
  return [Number(match?.[1]), Number(match?.[2])];
}

describe('favicon.svg', () => {
  it('is a valid SVG', () => {
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.documentElement.tagName).toBe('svg');
  });

  it('is drawn in the dark blue of the hero heading', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    const heroBlue = /--accent-deep:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    expect(heroBlue).toBeDefined();
    expect(svgText).toContain(`stroke: ${heroBlue}`);
  });

  it('shows two letters D, the second offset by half a letter right and down', () => {
    const letters = [...svg.querySelectorAll('use.c')];
    expect(letters).toHaveLength(2);
    expect(letters.map((letter) => letter.getAttribute('href'))).toEqual(['#d', '#d']);

    // The letter is "M0 0h<stem>a<r> <r> 0 0 1 0 <height>h-<stem>z": a stem plus a half circle.
    const outline = /^M0 0h(\d+)a(\d+) \d+ 0 0 1 0 (\d+)h-\d+z$/.exec(svg.querySelector('#d')?.getAttribute('d') ?? '');
    const width = Number(outline?.[1]) + Number(outline?.[2]);
    const height = Number(outline?.[3]);

    const [first, second] = letters.map((letter) => translation(letter));
    expect(second?.[0] ?? 0).toBeCloseTo((first?.[0] ?? 0) + width / 2);
    expect(second?.[1] ?? 0).toBeCloseTo((first?.[1] ?? 0) + height / 2);
  });

  it('is the icon the page links to', () => {
    expect(readFileSync(resolve(root, 'index.html'), 'utf8')).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    );
  });
});
