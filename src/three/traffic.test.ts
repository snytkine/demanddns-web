import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { advanceLink, createLink, frameDelta, randomIn, type Dot, type TrafficLink } from './traffic';

function makeLink(firstWait = 0.5): TrafficLink {
  const dot: Dot = { visible: true, position: new Vector3() };
  // 10 units long at 10 units/second: one second each way.
  return createLink(new Vector3(0, 0, 0), new Vector3(10, 0, 0), 10, [2, 4], dot, firstWait);
}

describe('randomIn', () => {
  it('maps the random source onto the range', () => {
    expect(randomIn([2, 4], () => 0)).toBe(2);
    expect(randomIn([2, 4], () => 0.5)).toBe(3);
    expect(randomIn([2, 4], () => 1)).toBe(4);
  });

  it('uses Math.random by default', () => {
    const value = randomIn([1, 2]);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(2);
  });
});

describe('createLink', () => {
  it('starts waiting with a hidden dot and the measured length', () => {
    const link = makeLink(0.5);
    expect(link.phase).toBe('waiting');
    expect(link.dot.visible).toBe(false);
    expect(link.length).toBe(10);
    expect(link.wait).toBe(0.5);
  });
});

describe('advanceLink', () => {
  it('keeps the dot hidden while waiting', () => {
    const link = makeLink(0.5);
    advanceLink(link, 0.2);
    expect(link.phase).toBe('waiting');
    expect(link.dot.visible).toBe(false);
  });

  it('shows the dot at the start once the wait is over', () => {
    const link = makeLink(0.5);
    advanceLink(link, 0.5);
    expect(link.phase).toBe('outbound');
    expect(link.dot.visible).toBe(true);
    expect(link.dot.position.x).toBe(0);
  });

  it('moves the dot towards the destination at the configured speed', () => {
    const link = makeLink(0);
    advanceLink(link, 0);
    advanceLink(link, 0.5);
    expect(link.phase).toBe('outbound');
    expect(link.dot.position.x).toBeCloseTo(5);
  });

  it('turns around at the destination and travels back', () => {
    const link = makeLink(0);
    advanceLink(link, 0);
    advanceLink(link, 1);
    expect(link.phase).toBe('inbound');
    expect(link.dot.position.x).toBeCloseTo(10);

    advanceLink(link, 0.5);
    expect(link.dot.position.x).toBeCloseTo(5);
  });

  it('hides the dot and waits a random interval after returning', () => {
    const link = makeLink(0);
    advanceLink(link, 0);
    advanceLink(link, 1);
    advanceLink(link, 1, () => 0.5);
    expect(link.phase).toBe('waiting');
    expect(link.dot.visible).toBe(false);
    expect(link.wait).toBe(3);
  });
});

describe('frameDelta', () => {
  it('is zero for the first frame', () => {
    expect(frameDelta(null, 5000)).toBe(0);
  });

  it('converts milliseconds to seconds', () => {
    expect(frameDelta(1000, 1016)).toBeCloseTo(0.016);
  });

  it('caps long gaps and ignores time going backwards', () => {
    expect(frameDelta(1000, 9000)).toBe(0.1);
    expect(frameDelta(1000, 9000, 0.5)).toBe(0.5);
    expect(frameDelta(1000, 500)).toBe(0);
  });
});
