import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';

function renderMarkdown(content: string) {
  return render(
    <MemoryRouter>
      <Markdown content={content} />
    </MemoryRouter>,
  );
}

describe('Markdown', () => {
  it('renders headings and paragraphs', () => {
    renderMarkdown('# Title\n\nSome **bold** text.');
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('turns links starting with "/" into in-app links', () => {
    renderMarkdown('See [Download](/download).');
    const link = screen.getByRole('link', { name: 'Download' });
    expect(link).toHaveAttribute('href', '/download');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab safely', () => {
    renderMarkdown('Visit [Example](https://example.com).');
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('wraps tables so they can scroll on narrow screens', () => {
    renderMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |');
    expect(screen.getByRole('table').parentElement).toHaveClass('table-scroll');
  });
});
