import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

function renderHeader(path = '/', onToggleTheme = vi.fn()) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header theme="light" onToggleTheme={onToggleTheme} />
    </MemoryRouter>,
  );
  return onToggleTheme;
}

describe('Header', () => {
  it('shows the project name linking home', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Command DNS' })).toHaveAttribute('href', '/');
  });

  it('lists the five navigation items in order, each with an icon', () => {
    renderHeader();
    const links = within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Home',
      'Features',
      'Documentation',
      'Tutorials',
      'Download',
    ]);
    for (const link of links) expect(link.querySelector('.glass-icon')).not.toBeNull();
  });

  it('offers a short label for long items without changing their text', () => {
    renderHeader();
    const label = within(screen.getByRole('link', { name: 'Documentation' })).getByText('Documentation');
    expect(label).toHaveAttribute('data-short', 'Docs');
    expect(within(screen.getByRole('link', { name: 'Home' })).getByText('Home')).not.toHaveAttribute('data-short');
  });

  it('marks only the current page as active', () => {
    renderHeader('/features');
    expect(screen.getByRole('link', { name: 'Features' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('active');
  });

  it('passes theme toggling through', async () => {
    const onToggleTheme = renderHeader();
    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });
});
