import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { animationConfig } from '../config/animation';
import { stubMatchMedia } from '../test/setup';
import type { SimulationStatus } from '../three/NetworkSimulation';
import NetworkScene from './NetworkScene';

const fake = vi.hoisted(() => {
  const onStatusChange: (status: SimulationStatus) => void = () => {};
  return {
    shouldThrow: false,
    args: [] as unknown[],
    onStatusChange,
    play: vi.fn(),
    toggle: vi.fn(),
    setTheme: vi.fn(),
    dispose: vi.fn(),
  };
});

vi.mock('../three/NetworkSimulation', () => ({
  NetworkSimulation: class {
    play = fake.play;
    toggle = fake.toggle;
    setTheme = fake.setTheme;
    dispose = fake.dispose;
    constructor(...args: [HTMLElement, unknown, string, (status: SimulationStatus) => void]) {
      if (fake.shouldThrow) throw new Error('WebGL unavailable');
      fake.args = args;
      fake.onStatusChange = args[3];
    }
  },
}));

beforeEach(() => {
  fake.shouldThrow = false;
  fake.args = [];
  fake.play.mockClear();
  fake.toggle.mockClear();
  fake.setTheme.mockClear();
  fake.dispose.mockClear();
});

describe('NetworkScene', () => {
  it('creates the simulation in its container with the configured settings and starts it', () => {
    render(<NetworkScene theme="dark" />);
    expect(fake.args[0]).toBe(screen.getByRole('button'));
    expect(fake.args[1]).toBe(animationConfig);
    expect(fake.args[2]).toBe('dark');
    expect(fake.play).toHaveBeenCalledOnce();
  });

  it('starts paused when the system asks for reduced motion', () => {
    stubMatchMedia((query) => query.includes('prefers-reduced-motion'));
    render(<NetworkScene theme="light" />);
    expect(fake.play).not.toHaveBeenCalled();
    expect(screen.getByText('Paused · click to resume')).toBeInTheDocument();
  });

  it('shows a hint that matches the simulation status', () => {
    render(<NetworkScene theme="light" />);
    act(() => {
      fake.onStatusChange('running');
    });
    expect(screen.getByText('Click to pause')).toBeInTheDocument();
    act(() => {
      fake.onStatusChange('finished');
    });
    expect(screen.getByText('Click to replay')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAccessibleName(/Click to replay/);
  });

  it('toggles on click', async () => {
    render(<NetworkScene theme="light" />);
    await userEvent.click(screen.getByRole('button'));
    expect(fake.toggle).toHaveBeenCalledOnce();
  });

  it('toggles with Enter and Space but not other keys', () => {
    render(<NetworkScene theme="light" />);
    const scene = screen.getByRole('button');
    fireEvent.keyDown(scene, { key: 'Enter' });
    fireEvent.keyDown(scene, { key: ' ' });
    fireEvent.keyDown(scene, { key: 'a' });
    expect(fake.toggle).toHaveBeenCalledTimes(2);
  });

  it('forwards theme changes to the running simulation', () => {
    const { rerender } = render(<NetworkScene theme="light" />);
    rerender(<NetworkScene theme="dark" />);
    expect(fake.setTheme).toHaveBeenLastCalledWith('dark');
  });

  it('disposes the simulation when removed', () => {
    const { unmount } = render(<NetworkScene theme="light" />);
    unmount();
    expect(fake.dispose).toHaveBeenCalledOnce();
  });

  it('renders nothing when WebGL is unavailable', () => {
    fake.shouldThrow = true;
    const { container } = render(<NetworkScene theme="light" />);
    expect(container).toBeEmptyDOMElement();
  });
});
