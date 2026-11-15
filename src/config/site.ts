export type IconName = 'home' | 'features' | 'documentation' | 'download' | 'how-it-works';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: IconName;
}

export const site = {
  name: 'Command DNS',
  copyrightStartYear: 2026,
} as const;

export const navItems: readonly NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/features', label: 'Features', icon: 'features' },
  { path: '/documentation', label: 'Documentation', icon: 'documentation' },
  { path: '/download', label: 'Download', icon: 'download' },
];
