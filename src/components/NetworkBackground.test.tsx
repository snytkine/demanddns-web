import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NetworkBackground } from './NetworkBackground';

describe('NetworkBackground', () => {
  it('is decorative', () => {
    const { container } = render(<NetworkBackground />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the network devices, including one DNS server and the Internet', () => {
    const { container } = render(<NetworkBackground />);
    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent);
    expect(labels.filter((label) => label === 'DNS Server')).toHaveLength(1);
    expect(labels).toEqual(expect.arrayContaining(['Internet', 'Router', 'Switch', 'Server', 'Workstation', 'Laptop']));
  });

  it('connects every device to the network', () => {
    const { container } = render(<NetworkBackground />);
    const nodes = container.querySelectorAll('.background__node');
    const links = container.querySelectorAll('.background__links line');
    // A connected network of N devices needs at least N - 1 links.
    expect(links.length).toBeGreaterThanOrEqual(nodes.length - 1);
  });
});
