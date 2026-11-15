import type { Vector3 } from 'three';
import type { SecondsRange } from '../config/animation';

export type Phase = 'waiting' | 'outbound' | 'inbound';

/** The part of a three.js mesh the traffic logic needs. */
export interface Dot {
  visible: boolean;
  readonly position: Vector3;
}

/** One connection with a dot that travels from → to (query) and back (answer). */
export interface TrafficLink {
  readonly from: Vector3;
  readonly to: Vector3;
  readonly length: number;
  readonly speed: number;
  readonly interval: SecondsRange;
  readonly dot: Dot;
  phase: Phase;
  progress: number;
  wait: number;
}

export type RandomSource = () => number;

export function randomIn([min, max]: SecondsRange, random: RandomSource = Math.random): number {
  return min + random() * (max - min);
}

export function createLink(
  from: Vector3,
  to: Vector3,
  speed: number,
  interval: SecondsRange,
  dot: Dot,
  firstWait: number,
): TrafficLink {
  dot.visible = false;
  return {
    from,
    to,
    length: from.distanceTo(to),
    speed,
    interval,
    dot,
    phase: 'waiting',
    progress: 0,
    wait: firstWait,
  };
}

/** Moves a link's dot forward by `dt` seconds. */
export function advanceLink(link: TrafficLink, dt: number, random: RandomSource = Math.random): void {
  if (link.phase === 'waiting') {
    link.wait -= dt;
    if (link.wait > 0) return;
    link.phase = 'outbound';
    link.progress = 0;
    link.dot.visible = true;
  } else {
    link.progress += (dt * link.speed) / link.length;
  }

  if (link.progress >= 1) {
    if (link.phase === 'outbound') {
      link.phase = 'inbound';
      link.progress = 0;
    } else {
      link.phase = 'waiting';
      link.wait = randomIn(link.interval, random);
      link.dot.visible = false;
      return;
    }
  }

  if (link.phase === 'outbound') link.dot.position.lerpVectors(link.from, link.to, link.progress);
  else link.dot.position.lerpVectors(link.to, link.from, link.progress);
}

/** Seconds between two animation-frame timestamps, capped so a background tab does not cause a jump. */
export function frameDelta(previous: number | null, timestamp: number, maxSeconds = 0.1): number {
  if (previous === null) return 0;
  return Math.min(Math.max((timestamp - previous) / 1000, 0), maxSeconds);
}
