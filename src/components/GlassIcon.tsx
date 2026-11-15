import type { ReactNode } from 'react';
import type { IconName } from '../config/site';

const GLYPHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M4 11.200 12 4.500l8 6.700" />
      <path d="M6.500 9.800V19h4v-4.500h3V19h4V9.800" />
    </>
  ),
  features: (
    <>
      <path d="M10 4.500l1.700 4.300 4.300 1.700-4.300 1.700L10 16.500l-1.700-4.300L4 10.500l4.300-1.700Z" />
      <path d="M17.500 14.500l.8 2.200 2.200.8-2.200.8-.8 2.200-.8-2.200-2.200-.8 2.200-.8Z" />
    </>
  ),
  documentation: (
    <>
      <path d="M12 6.500C10.300 5.300 7.800 5 5 5.200v12.600c2.800-.2 5.300.1 7 1.300 1.700-1.200 4.200-1.500 7-1.300V5.200c-2.800-.2-5.300.1-7 1.300Z" />
      <path d="M12 6.500V19" />
    </>
  ),
  download: (
    <>
      <path d="M12 4.500V14M8 10.500l4 4 4-4" />
      <path d="M5 16.500V19h14v-2.500" />
    </>
  ),
  'how-it-works': (
    <>
      <circle cx="12" cy="12" r="2.600" />
      <circle cx="5.500" cy="6" r="1.700" />
      <circle cx="18.500" cy="6" r="1.700" />
      <circle cx="5.500" cy="18" r="1.700" />
      <circle cx="18.500" cy="18" r="1.700" />
      <path d="M10 10.200 6.800 7.200M14 10.200l3.200-3M10 13.800l-3.200 3M14 13.800l3.200 3" />
    </>
  ),
};

interface GlassIconProps {
  readonly name: IconName;
  readonly size?: 'regular' | 'large';
}

/** A glossy "glass" tile with a white glyph, tilting in 3D when its parent is hovered. */
export function GlassIcon({ name, size = 'regular' }: GlassIconProps) {
  return (
    <span className={`glass-icon glass-icon--${name} glass-icon--${size}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">{GLYPHS[name]}</svg>
    </span>
  );
}
