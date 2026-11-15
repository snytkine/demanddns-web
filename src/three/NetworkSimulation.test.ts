import type * as Three from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnimationConfig } from '../config/animation';
import { NetworkSimulation, type SimulationStatus } from './NetworkSimulation';

const fakes = vi.hoisted(() => ({
  renderers: [] as {
    domElement: HTMLCanvasElement;
    setPixelRatio: ReturnType<typeof vi.fn>;
    setSize: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  }[],
}));

// WebGL does not exist in jsdom; everything else in three.js is real.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class WebGLRenderer {
    domElement = document.createElement('canvas');
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    constructor() {
      fakes.renderers.push(this);
    }
  }
  return { ...actual, WebGLRenderer };
});

const config: AnimationConfig = {
  loopSeconds: 0.25,
  lanDotSpeed: 3,
  lanQueryInterval: [0, 0],
  internetDotSpeed: 2,
  internetQueryInterval: [0, 0],
};

let frames: FrameRequestCallback[];
let resizeCallbacks: (() => void)[];
let disconnect: ReturnType<typeof vi.fn>;
let statuses: SimulationStatus[];
let container: HTMLDivElement;
let now: number;

/** Runs the next queued animation frame, 100 ms after the previous one. */
function runFrame(): boolean {
  const frame = frames.shift();
  if (!frame) return false;
  now += 100;
  frame(now);
  return true;
}

function create(size: { width: number; height: number } = { width: 400, height: 430 }): NetworkSimulation {
  Object.defineProperty(container, 'clientWidth', { value: size.width, configurable: true });
  Object.defineProperty(container, 'clientHeight', { value: size.height, configurable: true });
  return new NetworkSimulation(container, config, 'light', (status) => statuses.push(status));
}

function renderer() {
  return fakes.renderers.at(-1)!;
}

beforeEach(() => {
  fakes.renderers.length = 0;
  frames = [];
  resizeCallbacks = [];
  statuses = [];
  now = 1000;
  disconnect = vi.fn();
  container = document.createElement('div');
  document.body.appendChild(container);

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = [];
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  const context = { beginPath: vi.fn(), roundRect: vi.fn(), fill: vi.fn(), fillText: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  container.remove();
});

describe('NetworkSimulation', () => {
  it('adds its canvas to the container and draws a first frame without starting', () => {
    create();
    expect(container.querySelector('canvas')).toBe(renderer().domElement);
    expect(renderer().setSize).toHaveBeenCalledWith(400, 430);
    expect(renderer().render).toHaveBeenCalled();
    expect(statuses).toEqual([]);
    expect(frames).toHaveLength(0);
  });

  it('skips sizing while the container has no size', () => {
    create({ width: 0, height: 0 });
    expect(renderer().setSize).not.toHaveBeenCalled();
  });

  it('resizes when the container changes size', () => {
    create();
    Object.defineProperty(container, 'clientWidth', { value: 900, configurable: true });
    resizeCallbacks[0]!();
    expect(renderer().setSize).toHaveBeenLastCalledWith(900, 430);
  });

  it('still builds the scene when the label canvas has no 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(() => create()).not.toThrow();
  });

  it('runs for the configured number of seconds and then stops', () => {
    const simulation = create();
    simulation.play();
    expect(statuses).toEqual(['running']);

    // First frame has no delta; 0.1 s per frame afterwards → finished on the 4th.
    let count = 0;
    while (runFrame()) count++;
    expect(count).toBe(4);
    expect(statuses).toEqual(['running', 'finished']);
    expect(frames).toHaveLength(0);
  });

  it('draws every frame while running', () => {
    const simulation = create();
    const before = renderer().render.mock.calls.length;
    simulation.play();
    runFrame();
    runFrame();
    expect(renderer().render.mock.calls.length).toBe(before + 2);
  });

  it('pauses and resumes on toggle without losing progress', () => {
    const simulation = create();
    simulation.toggle();
    runFrame();
    runFrame();
    simulation.toggle();
    expect(statuses).toEqual(['running', 'paused']);
    expect(frames).toHaveLength(0);

    simulation.toggle();
    let count = 0;
    while (runFrame()) count++;
    // 0.1 s was already used before the pause; the first frame after resuming has no delta.
    expect(count).toBe(3);
    expect(statuses).toEqual(['running', 'paused', 'running', 'finished']);
  });

  it('ignores play while running and pause while not running', () => {
    const simulation = create();
    simulation.pause();
    expect(statuses).toEqual([]);
    simulation.play();
    simulation.play();
    expect(statuses).toEqual(['running']);
    expect(frames).toHaveLength(1);
  });

  it('does not advance a frame that arrives after pausing', () => {
    const simulation = create();
    simulation.play();
    const stale = frames[0]!;
    simulation.pause();
    const before = renderer().render.mock.calls.length;
    stale(now + 100);
    expect(renderer().render.mock.calls.length).toBe(before);
  });

  it('replays a full loop after finishing', () => {
    const simulation = create();
    simulation.play();
    while (runFrame());
    simulation.toggle();
    let count = 0;
    while (runFrame()) count++;
    expect(count).toBe(4);
    expect(statuses).toEqual(['running', 'finished', 'running', 'finished']);
  });

  it('redraws when the theme changes', () => {
    const simulation = create();
    const before = renderer().render.mock.calls.length;
    simulation.setTheme('dark');
    expect(renderer().render.mock.calls.length).toBe(before + 1);
  });

  it('cleans up on dispose and stays inert afterwards', () => {
    const simulation = create();
    simulation.play();
    simulation.dispose();

    expect(container.querySelector('canvas')).toBeNull();
    expect(renderer().dispose).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(frames).toHaveLength(0);

    const drawn = renderer().render.mock.calls.length;
    simulation.setTheme('dark');
    simulation.play();
    expect(renderer().render.mock.calls.length).toBe(drawn);
    expect(frames).toHaveLength(0);
  });
});
