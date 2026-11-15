import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { animationConfig } from '../config/animation';
import type { Theme } from '../hooks/useTheme';
import { NetworkSimulation, type SimulationStatus } from '../three/NetworkSimulation';

const HINTS: Record<SimulationStatus, string> = {
  running: 'Click to pause',
  paused: 'Paused · click to resume',
  finished: 'Click to replay',
};

interface NetworkSceneProps {
  readonly theme: Theme;
}

export default function NetworkScene({ theme }: NetworkSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<NetworkSimulation | null>(null);
  const themeRef = useRef(theme);
  const [status, setStatus] = useState<SimulationStatus>('paused');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let simulation: NetworkSimulation;
    try {
      simulation = new NetworkSimulation(container, animationConfig, themeRef.current, setStatus);
    } catch {
      // WebGL is unavailable; the page works without the animation.
      setFailed(true);
      return;
    }
    simulationRef.current = simulation;
    // Respect the system "reduce motion" setting: start paused, play on click.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) simulation.play();
    return () => {
      simulation.dispose();
      simulationRef.current = null;
    };
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    simulationRef.current?.setTheme(theme);
  }, [theme]);

  if (failed) return null;

  const toggle = () => simulationRef.current?.toggle();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      ref={containerRef}
      className="scene"
      role="button"
      tabIndex={0}
      aria-label={`Animated network diagram: workstations and servers query the DNS server, which occasionally queries the Internet. ${HINTS[status]}.`}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <span className="glass scene__hint" aria-hidden="true">
        {HINTS[status]}
      </span>
    </div>
  );
}
