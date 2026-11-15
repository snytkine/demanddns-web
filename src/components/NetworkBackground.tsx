import type { ReactNode } from 'react';

type DeviceType = 'internet' | 'router' | 'switch' | 'dns' | 'server' | 'workstation' | 'laptop';

interface DiagramNode {
  readonly id: string;
  readonly type: DeviceType;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

/** Positions are in the 1440 × 900 coordinate space of the SVG. */
const NODES: readonly DiagramNode[] = [
  { id: 'internet', type: 'internet', label: 'Internet', x: 1250, y: 130 },
  { id: 'router', type: 'router', label: 'Router', x: 1030, y: 215 },
  { id: 'switch-a', type: 'switch', label: 'Switch', x: 700, y: 330 },
  { id: 'dns', type: 'dns', label: 'DNS Server', x: 450, y: 205 },
  { id: 'ws-1', type: 'workstation', label: 'Workstation', x: 190, y: 340 },
  { id: 'ws-2', type: 'workstation', label: 'Workstation', x: 330, y: 540 },
  { id: 'laptop-1', type: 'laptop', label: 'Laptop', x: 130, y: 720 },
  { id: 'ws-3', type: 'workstation', label: 'Workstation', x: 580, y: 610 },
  { id: 'switch-b', type: 'switch', label: 'Switch', x: 1080, y: 520 },
  { id: 'srv-1', type: 'server', label: 'Server', x: 1300, y: 400 },
  { id: 'srv-2', type: 'server', label: 'Server', x: 1310, y: 660 },
  { id: 'srv-3', type: 'server', label: 'Server', x: 1060, y: 770 },
  { id: 'laptop-2', type: 'laptop', label: 'Laptop', x: 820, y: 780 },
];

const LINKS: readonly (readonly [from: string, to: string])[] = [
  ['internet', 'router'],
  ['router', 'switch-a'],
  ['router', 'switch-b'],
  ['switch-a', 'dns'],
  ['switch-a', 'ws-1'],
  ['switch-a', 'ws-2'],
  ['switch-a', 'ws-3'],
  ['ws-2', 'laptop-1'],
  ['switch-b', 'srv-1'],
  ['switch-b', 'srv-2'],
  ['switch-b', 'srv-3'],
  ['switch-b', 'laptop-2'],
];

/** Glyphs drawn inside a 64 × 64 tile centred on the node, cloud-provider style. */
const GLYPHS: Record<DeviceType, ReactNode> = {
  internet: (
    <>
      <circle r="17" />
      <ellipse rx="7.500" ry="17" />
      <path d="M-17 0h34M-14.500-9h29M-14.500 9h29" />
    </>
  ),
  router: (
    <>
      <circle r="17" />
      <path d="M-12 0h8M12 0H4M0-12v8M0 12V4" />
      <path d="M-7-3l-3 3 3 3M7-3l3 3-3 3M-3-9l3-3 3 3M-3 9l3 3 3-3" />
    </>
  ),
  switch: (
    <>
      <rect x="-19" y="-10" width="38" height="20" rx="4" />
      <path d="M-12-3h8m-3-3 3 3-3 3M12 4H4m3-3-3 3 3 3" />
    </>
  ),
  dns: (
    <>
      <rect x="-15" y="-18" width="30" height="36" rx="4" />
      <path d="M-15-6h30M-15 6h30" />
      <path d="M-9-12h6M-9 0h6M-9 12h6" />
      <circle cx="8" cy="-12" r="1.500" />
      <circle cx="8" cy="0" r="1.500" />
      <circle cx="8" cy="12" r="1.500" />
    </>
  ),
  server: (
    <>
      <rect x="-17" y="-15" width="34" height="13" rx="3" />
      <rect x="-17" y="2" width="34" height="13" rx="3" />
      <path d="M-11-8.500h8M-11 8.500h8" />
      <circle cx="10" cy="-8.500" r="1.500" />
      <circle cx="10" cy="8.500" r="1.500" />
    </>
  ),
  workstation: (
    <>
      <rect x="-18" y="-15" width="36" height="24" rx="3" />
      <path d="M0 9v7M-9 16h18" />
    </>
  ),
  laptop: (
    <>
      <rect x="-14" y="-12" width="28" height="19" rx="2.500" />
      <path d="M-20 12h40l-3-5h-34Z" />
    </>
  ),
};

const nodeById = new Map(NODES.map((node) => [node.id, node]));

/** Decorative, non-interactive network diagram shown behind the whole site. */
export function NetworkBackground() {
  return (
    <div className="background" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g className="background__links">
          {LINKS.map(([fromId, toId]) => {
            const from = nodeById.get(fromId);
            const to = nodeById.get(toId);
            if (!from || !to) return null;
            return <line key={`${fromId}-${toId}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </g>
        {NODES.map((node) => (
          <g
            key={node.id}
            className={`background__node background__node--${node.type}`}
            transform={`translate(${node.x} ${node.y})`}
          >
            <rect className="background__tile" x="-32" y="-32" width="64" height="64" rx="14" />
            <g className="background__glyph">{GLYPHS[node.type]}</g>
            <text y="52">{node.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
