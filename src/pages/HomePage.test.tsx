import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

vi.mock('../components/NetworkScene', () => ({
  default: ({ theme }: { theme: string }) => <div data-testid="scene">{theme}</div>,
}));

function renderHome() {
  render(
    <MemoryRouter>
      <HomePage theme="dark" />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('shows the headline from the markdown content', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/DNS/);
  });

  it('loads the network animation and passes the theme to it', async () => {
    renderHome();
    expect(await screen.findByTestId('scene')).toHaveTextContent('dark');
  });

  it('has Features, How it works and Download cards, each with an icon, title and link', () => {
    renderHome();
    const overview = screen.getByRole('region', { name: 'Overview' });
    const expected = [
      ['Features', '/features'],
      ['How it works', '/documentation'],
      ['Download', '/download'],
    ] as const;

    const titles = within(overview).getAllByRole('heading', { level: 2 });
    expect(titles.map((title) => title.textContent)).toEqual(expected.map(([title]) => title));

    const links = within(overview).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(expected.map(([, href]) => href));
    expect(overview.querySelectorAll('.card .glass-icon')).toHaveLength(3);
  });

  it('offers download and features actions in the hero', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/download');
    expect(screen.getByRole('link', { name: 'See features' })).toHaveAttribute('href', '/features');
  });
});
