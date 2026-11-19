import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RELEASES_DOWNLOAD_PREFIX, RELEASES_PAGE_URL } from '../config/site';
import { DownloadButtons } from './DownloadButtons';

/** Makes the release lookup succeed with the given assets. */
function stubRelease(assets: { name: string; size: number }[]) {
  const body = {
    tag_name: 'v1.0.1',
    assets: assets.map((a) => ({ ...a, browser_download_url: `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/${a.name}` })),
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }));
}

describe('DownloadButtons', () => {
  it('links to the installers of the latest release with version, size and checksum', async () => {
    stubRelease([
      { name: 'DemandDNS_1.0.1_universal.dmg', size: 20 * 1024 * 1024 },
      { name: 'DemandDNS_1.0.1_universal.dmg.sha256', size: 90 },
      { name: 'DemandDNS_1.0.1_x64-setup.exe', size: 5 * 1024 * 1024 },
    ]);
    render(<DownloadButtons />);
    expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute('href', RELEASES_PAGE_URL);
    await vi.waitFor(() =>
      expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute(
        'href',
        `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/DemandDNS_1.0.1_universal.dmg`,
      ),
    );
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute(
      'href',
      `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/DemandDNS_1.0.1_x64-setup.exe`,
    );
    expect(screen.getByText(/Version 1\.0\.1 · 20\.0 MB/)).toBeInTheDocument();
    expect(screen.getByText(/Version 1\.0\.1 · 5\.0 MB/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'SHA-256' })).toHaveLength(1);
  });

  it('keeps the releases page link for a platform that has no installer yet', async () => {
    stubRelease([{ name: 'DemandDNS_1.0.1_x64-setup.exe', size: 1024 }]);
    render(<DownloadButtons />);
    await screen.findByText(/Version 1\.0\.1/);
    expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute('href', RELEASES_PAGE_URL);
  });

  it('falls back to the releases page and explains it when the lookup fails', async () => {
    render(<DownloadButtons showStatus />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(/Could not check for the latest version/);
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute('href', RELEASES_PAGE_URL);
  });

  it('stays quiet about a failed lookup unless asked to show it', async () => {
    render(<DownloadButtons />);
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    await Promise.resolve();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('DownloadButtons platform order', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Download for Mac'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Download for Windows'],
  ])('lists the visitor’s own platform first and highlights it (%s)', (userAgent, first) => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    render(<DownloadButtons />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAccessibleName(first);
    expect(links[0]).toHaveClass('button--primary');
    expect(links[1]).not.toHaveClass('button--primary');
  });
});
