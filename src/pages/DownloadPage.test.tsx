import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ALL_RELEASES_URL, RELEASES_DOWNLOAD_PREFIX } from '../config/site';
import { DownloadPage } from './DownloadPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <DownloadPage />
    </MemoryRouter>,
  );
}

describe('DownloadPage', () => {
  it('shows the introduction, the install notes and links to the notes and older releases', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Download' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Latest release' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Before you install' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Release notes' })).toHaveAttribute('href', '/release-notes');
    expect(screen.getByRole('link', { name: 'Older releases' })).toHaveAttribute('href', ALL_RELEASES_URL);
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/documentation');
  });

  it('links each button to the installer of the latest release', async () => {
    const asset = (name: string) => ({
      name,
      size: 2048,
      browser_download_url: `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/${name}`,
    });
    const body = {
      tag_name: 'v1.0.1',
      assets: [asset('DemandDNS_1.0.1_universal.dmg'), asset('DemandDNS_1.0.1_x64-setup.exe')],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }));
    renderPage();
    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute(
        'href',
        `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/DemandDNS_1.0.1_universal.dmg`,
      );
    });
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute(
      'href',
      `${RELEASES_DOWNLOAD_PREFIX}v1.0.1/DemandDNS_1.0.1_x64-setup.exe`,
    );
  });

  it('explains the fallback when the latest version cannot be looked up', async () => {
    renderPage();
    expect(await screen.findByRole('status')).toHaveTextContent(/Could not check for the latest version/);
  });
});
