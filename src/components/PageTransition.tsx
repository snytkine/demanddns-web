import { useEffect, useState, type AnimationEvent, type ReactNode } from 'react';
import { useLocation, type Location } from 'react-router-dom';

interface PageTransitionProps {
  /** Renders the routes for the location currently on screen. */
  readonly children: (location: Location) => ReactNode;
}

/**
 * Animates the old page out, then swaps in the new page and animates it in.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  const [stage, setStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (location.pathname !== displayed.pathname) setStage('exit');
  }, [location, displayed]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || stage !== 'exit') return;
    setDisplayed(location);
    setStage('enter');
    window.scrollTo(0, 0);
  };

  return (
    <div className={`page page--${stage}`} onAnimationEnd={handleAnimationEnd}>
      {children(displayed)}
    </div>
  );
}
