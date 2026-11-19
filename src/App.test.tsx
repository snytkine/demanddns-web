import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.mock('./components/NetworkScene', () => ({
  default: () => <div data-testid="scene" />,
}));

function renderApp(path = '/', basename?: string) {
  return render(
    <MemoryRouter initialEntries={[path]} basename={basename}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('shows the home page with header, background and footer', async () => {
    const { container } = renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Demand DNS');
    expect(container.querySelector('.background')).not.toBeNull();
    expect(await screen.findByTestId('scene')).toBeInTheDocument();
  });

  it.each([
    ['/features', 'Features'],
    ['/documentation', 'Documentation'],
    ['/tutorials', 'Tutorials'],
    ['/download', 'Download'],
    ['/release-notes', 'Release notes'],
  ])('shows the %s page', (path, title) => {
    renderApp(path);
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
  });

  it('opens a deep link served under a repository path, as on GitHub Pages', () => {
    renderApp('/demanddns-web/features', '/demanddns-web/');
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: 'Features' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/demanddns-web/download');
  });

  it('shows the placeholder text on the Tutorials page', () => {
    renderApp('/tutorials');
    expect(within(screen.getByRole('main')).getByText('Tutorials coming soon')).toBeInTheDocument();
  });

  it('shows a not-found page for unknown addresses', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home page' })).toHaveAttribute('href', '/');
  });

  it('navigates between pages through the menu', async () => {
    const { container } = renderApp('/features');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await userEvent.click(within(nav).getByRole('link', { name: 'Documentation' }));
    fireEvent.animationEnd(container.querySelector('.page')!);
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible();
  });

  it('switches between light and dark mode', async () => {
    renderApp('/features');
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(document.documentElement.dataset.theme).toBe('light');
    await userEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
