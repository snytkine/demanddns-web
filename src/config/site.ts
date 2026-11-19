export type IconName = 'home' | 'features' | 'documentation' | 'tutorials' | 'download' | 'how-it-works';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  /** Shorter label shown on phones, where the tab bar is tight. */
  readonly shortLabel?: string;
  readonly icon: IconName;
}

export const site = {
  name: 'Demand DNS',
  copyrightStartYear: 2026,
} as const;

export const navItems: readonly NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/features', label: 'Features', icon: 'features' },
  { path: '/documentation', label: 'Documentation', shortLabel: 'Docs', icon: 'documentation' },
  { path: '/tutorials', label: 'Tutorials', icon: 'tutorials' },
  { path: '/download', label: 'Download', icon: 'download' },
];

/** Supported desktop platforms. */
export type Platform = 'mac' | 'windows';

/** Describes a downloadable build. */
export interface DownloadOption {
  readonly platform: Platform;
  readonly label: string;
  readonly requirement: string;
  /** Fallback link, used until the latest release is known (or when the lookup fails). */
  readonly url: string;
}

/** Public GitHub repository that holds the installer downloads (the app's source repository is private). */
export const RELEASES_REPO = 'snytkine/demanddns-web';

/** Page listing the newest release. Used as the download link when the release lookup fails. */
export const RELEASES_PAGE_URL = `https://github.com/${RELEASES_REPO}/releases/latest`;

/** Page that lists every release of the app, newest first, including the older ones. */
export const ALL_RELEASES_URL = `https://github.com/${RELEASES_REPO}/releases`;

/** GitHub API endpoint that describes the newest published release (no drafts or pre-releases). */
export const RELEASES_API_URL = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`;

/** How many of the newest releases the release notes page shows. */
export const RELEASE_NOTES_COUNT = 10;

/** GitHub API endpoint that lists the newest published releases (no drafts), with their notes. */
export const RELEASES_LIST_API_URL = `https://api.github.com/repos/${RELEASES_REPO}/releases?per_page=${String(RELEASE_NOTES_COUNT)}`;

/** Every installer link must start with this, so a malformed API reply can never point elsewhere. */
export const RELEASES_DOWNLOAD_PREFIX = `https://github.com/${RELEASES_REPO}/releases/download/`;

/** Download buttons, in their default order. The visitor's own platform is shown first. */
export const DOWNLOADS: readonly DownloadOption[] = [
  {
    platform: 'mac',
    label: 'Download for Mac',
    requirement: 'macOS, Apple Silicon and Intel',
    url: RELEASES_PAGE_URL,
  },
  {
    platform: 'windows',
    label: 'Download for Windows',
    requirement: 'Windows 10 or later, 64-bit',
    url: RELEASES_PAGE_URL,
  },
];
