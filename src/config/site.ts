export type IconName = 'home' | 'features' | 'documentation' | 'tutorials' | 'download' | 'how-it-works';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  /** Shorter label shown on phones, where the tab bar is tight. */
  readonly shortLabel?: string;
  readonly icon: IconName;
}

export const site = {
  name: 'Command DNS',
  copyrightStartYear: 2026,
} as const;

export const navItems: readonly NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/features', label: 'Features', icon: 'features' },
  { path: '/documentation', label: 'Documentation', shortLabel: 'Docs', icon: 'documentation' },
  { path: '/tutorials', label: 'Tutorials', icon: 'tutorials' },
  { path: '/download', label: 'Download', icon: 'download' },
];
