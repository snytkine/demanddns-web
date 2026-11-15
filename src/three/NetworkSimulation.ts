import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { AnimationConfig, SecondsRange } from '../config/animation';
import type { Theme } from '../hooks/useTheme';

export type SimulationStatus = 'running' | 'paused' | 'finished';

interface Palette {
  readonly device: number;
  readonly deviceTrim: number;
  readonly accent: number;
  readonly accentDeep: number;
  readonly screen: number;
  readonly pad: number;
  readonly padOpacity: number;
  readonly link: number;
  readonly linkOpacity: number;
  readonly globe: number;
  readonly globeLines: number;
  readonly dot: number;
  readonly ambient: number;
}

const PALETTES: Record<Theme, Palette> = {
  light: {
    device: 0xe4eaf2,
    deviceTrim: 0xaab6c6,
    accent: 0x2f7bf6,
    accentDeep: 0x0f3f9c,
    screen: 0x7db8ff,
    pad: 0xffffff,
    padOpacity: 0.75,
    link: 0x4d86d9,
    linkOpacity: 0.8,
    globe: 0x3b8bff,
    globeLines: 0xffffff,
    dot: 0x1fc45a,
    ambient: 1.5,
  },
  dark: {
    device: 0xb9c6da,
    deviceTrim: 0x6f7f99,
    accent: 0x4c95ff,
    accentDeep: 0x1b4fb5,
    screen: 0x8fc4ff,
    pad: 0x5f7fb5,
    padOpacity: 0.28,
    link: 0x7fb0ff,
    linkOpacity: 0.5,
    globe: 0x3f8cff,
    globeLines: 0xd6e6ff,
    dot: 0x3ee07a,
    ambient: 1.1,
  },
};

type DeviceKind = 'workstation' | 'server';

/** Devices placed around the DNS server, front-left to front-right. */
const DEVICES: readonly DeviceKind[] = [
  'server',
  'workstation',
  'workstation',
  'server',
  'workstation',
  'server',
];

const DEVICE_RADIUS = 3.2;
const DOT_HEIGHT = 0.14;
const GLOBE_CENTER = new THREE.Vector3(0, 1.55, -3.5);

type Phase = 'waiting' | 'outbound' | 'inbound';

interface TrafficLink {
  readonly from: THREE.Vector3;
  readonly to: THREE.Vector3;
  readonly length: number;
  readonly speed: number;
  readonly interval: SecondsRange;
  readonly dot: THREE.Mesh;
  phase: Phase;
  progress: number;
  wait: number;
}

function randomIn([min, max]: SecondsRange): number {
  return min + Math.random() * (max - min);
}

/**
 * three.js scene: workstations and servers around a DNS server that is
 * also connected to the Internet. Green dots show queries and answers.
 */
export class NetworkSimulation {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  private readonly timer = new THREE.Timer();
  private readonly resizeObserver: ResizeObserver;
  private readonly links: TrafficLink[] = [];

  private readonly ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  private readonly deviceMaterial = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.35 });
  private readonly trimMaterial = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.5 });
  private readonly accentMaterial = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.25 });
  private readonly accentDeepMaterial = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.3 });
  private readonly screenMaterial = new THREE.MeshBasicMaterial();
  private readonly padMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  private readonly linkMaterial = new THREE.LineBasicMaterial({ transparent: true });
  private readonly globeMaterial = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 });
  private readonly globeLineMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 });
  private readonly dotMaterial = new THREE.MeshBasicMaterial();
  private readonly ringMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });

  private readonly globe = new THREE.Group();
  private readonly ring: THREE.Mesh;

  private status: SimulationStatus = 'paused';
  private elapsed = 0;
  private frame = 0;
  private disposed = false;

  constructor(
    private readonly container: HTMLElement,
    private readonly config: AnimationConfig,
    theme: Theme,
    private readonly onStatusChange: (status: SimulationStatus) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 9, 6);
    this.scene.add(this.ambientLight, sun);

    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.05, 64), this.ringMaterial);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.03;
    this.scene.add(this.ring);

    this.buildDnsServer();
    this.buildDevices();
    this.buildInternet();
    this.setTheme(theme);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  /** Starts, or restarts after the loop has finished. */
  play(): void {
    if (this.disposed || this.status === 'running') return;
    if (this.status === 'finished') this.elapsed = 0;
    this.setStatus('running');
    this.timer.reset();
    this.frame = requestAnimationFrame(this.tick);
  }

  pause(): void {
    if (this.status !== 'running') return;
    cancelAnimationFrame(this.frame);
    this.setStatus('paused');
  }

  /** Click behaviour: pause when running, otherwise resume or replay. */
  toggle(): void {
    if (this.status === 'running') this.pause();
    else this.play();
  }

  setTheme(theme: Theme): void {
    const p = PALETTES[theme];
    this.ambientLight.intensity = p.ambient;
    this.deviceMaterial.color.setHex(p.device);
    this.trimMaterial.color.setHex(p.deviceTrim);
    this.accentMaterial.color.setHex(p.accent);
    this.accentDeepMaterial.color.setHex(p.accentDeep);
    this.screenMaterial.color.setHex(p.screen);
    this.padMaterial.color.setHex(p.pad);
    this.padMaterial.opacity = p.padOpacity;
    this.linkMaterial.color.setHex(p.link);
    this.linkMaterial.opacity = p.linkOpacity;
    this.globeMaterial.color.setHex(p.globe);
    this.globeLineMaterial.color.setHex(p.globeLines);
    this.dotMaterial.color.setHex(p.dot);
    this.ringMaterial.color.setHex(p.accent);
    this.render();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
        object.geometry.dispose();
        const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material instanceof THREE.SpriteMaterial) material.map?.dispose();
          material.dispose();
        }
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private setStatus(status: SimulationStatus): void {
    this.status = status;
    this.onStatusChange(status);
  }

  private readonly tick = (timestamp: number): void => {
    if (this.status !== 'running') return;
    this.timer.update(timestamp);
    // Clamp so a background tab does not produce one huge jump.
    const dt = Math.min(this.timer.getDelta(), 0.1);
    this.elapsed += dt;

    for (const link of this.links) this.advance(link, dt);
    this.globe.rotation.y += dt * 0.5;
    const pulse = (this.elapsed * 0.6) % 1;
    this.ring.scale.setScalar(1 + pulse * 0.9);
    this.ringMaterial.opacity = 0.55 * (1 - pulse);

    this.render();

    if (this.elapsed >= this.config.loopSeconds) {
      this.setStatus('finished');
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };

  private advance(link: TrafficLink, dt: number): void {
    if (link.phase === 'waiting') {
      link.wait -= dt;
      if (link.wait > 0) return;
      link.phase = 'outbound';
      link.progress = 0;
      link.dot.visible = true;
    } else {
      link.progress += (dt * link.speed) / link.length;
    }

    if (link.progress >= 1) {
      if (link.phase === 'outbound') {
        link.phase = 'inbound';
        link.progress = 0;
      } else {
        link.phase = 'waiting';
        link.wait = randomIn(link.interval);
        link.dot.visible = false;
        return;
      }
    }

    if (link.phase === 'outbound') link.dot.position.lerpVectors(link.from, link.to, link.progress);
    else link.dot.position.lerpVectors(link.to, link.from, link.progress);
  }

  private render(): void {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Pull the camera back far enough to fit the scene both ways.
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const distance = Math.max(3.7 / Math.tan(halfFov), 4.35 / (Math.tan(halfFov) * aspect));
    const target = new THREE.Vector3(0, 0.55, -0.35);
    this.camera.position.copy(target).add(new THREE.Vector3(0, 0.66, 0.75).normalize().multiplyScalar(distance));
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.render();
  }

  private addPad(parent: THREE.Object3D, radius: number): void {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), this.padMaterial);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.01;
    parent.add(pad);
  }

  private addLink(from: THREE.Vector3, to: THREE.Vector3, speed: number, interval: SecondsRange, firstWait: number): void {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    this.scene.add(new THREE.Line(geometry, this.linkMaterial));

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), this.dotMaterial);
    dot.visible = false;
    this.scene.add(dot);

    this.links.push({
      from,
      to,
      length: from.distanceTo(to),
      speed,
      interval,
      dot,
      phase: 'waiting',
      progress: 0,
      wait: firstWait,
    });
  }

  private buildDnsServer(): void {
    const group = new THREE.Group();
    this.addPad(group, 1.05);

    const tower = new THREE.Mesh(new RoundedBoxGeometry(1.05, 1.45, 1.05, 4, 0.12), this.accentMaterial);
    tower.position.y = 0.76;
    group.add(tower);

    for (let i = 0; i < 3; i++) {
      const slot = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.13, 0.04, 2, 0.02), this.accentDeepMaterial);
      slot.position.set(0, 0.42 + i * 0.25, 0.53);
      group.add(slot);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), this.dotMaterial);
      led.position.set(0.3, 0.42 + i * 0.25, 0.56);
      group.add(led);
    }

    const label = this.createLabel('DNS');
    label.position.set(0, 1.95, 0);
    group.add(label);

    this.scene.add(group);
  }

  private buildDevices(): void {
    const { lanDotSpeed, lanQueryInterval } = this.config;
    const dnsPoint = new THREE.Vector3(0, DOT_HEIGHT, 0);

    DEVICES.forEach((kind, index) => {
      // Spread the devices on an arc that leaves the back free for the Internet link.
      const angle = THREE.MathUtils.degToRad(200 - (index * 220) / (DEVICES.length - 1));
      const position = new THREE.Vector3(Math.cos(angle) * DEVICE_RADIUS, 0, Math.sin(angle) * DEVICE_RADIUS);

      const group = kind === 'server' ? this.createServer() : this.createWorkstation();
      group.position.copy(position);
      this.scene.add(group);

      const from = position.clone().setY(DOT_HEIGHT);
      const to = dnsPoint.clone().add(from.clone().normalize().multiplyScalar(0.6)).setY(DOT_HEIGHT);
      this.addLink(from, to, lanDotSpeed, lanQueryInterval, Math.random() * lanQueryInterval[1]);
    });
  }

  private buildInternet(): void {
    const { internetDotSpeed, internetQueryInterval } = this.config;

    this.globe.position.copy(GLOBE_CENTER);
    this.globe.rotation.z = THREE.MathUtils.degToRad(18);
    const radius = 0.8;
    this.globe.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 28), this.globeMaterial));

    const lineRadius = radius * 1.012;
    const circle = (points: THREE.Vector3[]): void => {
      this.globe.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), this.globeLineMaterial));
    };
    const segments = 64;
    for (let m = 0; m < 6; m++) {
      const rotation = (m * Math.PI) / 6;
      circle(
        Array.from({ length: segments }, (_, i) => {
          const a = (i / segments) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(a) * Math.cos(rotation) * lineRadius,
            Math.sin(a) * lineRadius,
            Math.cos(a) * Math.sin(rotation) * lineRadius,
          );
        }),
      );
    }
    for (const latitude of [-50, -25, 0, 25, 50]) {
      const y = Math.sin(THREE.MathUtils.degToRad(latitude)) * lineRadius;
      const r = Math.cos(THREE.MathUtils.degToRad(latitude)) * lineRadius;
      circle(
        Array.from({ length: segments }, (_, i) => {
          const a = (i / segments) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
        }),
      );
    }
    this.scene.add(this.globe);

    const from = new THREE.Vector3(0, 1.1, -0.55);
    const direction = GLOBE_CENTER.clone().sub(from).normalize();
    const to = GLOBE_CENTER.clone().sub(direction.multiplyScalar(radius + 0.05));
    this.addLink(from, to, internetDotSpeed, internetQueryInterval, internetQueryInterval[0] * 0.5);
  }

  private createServer(): THREE.Group {
    const group = new THREE.Group();
    this.addPad(group, 0.78);
    for (let i = 0; i < 3; i++) {
      const y = 0.17 + i * 0.3;
      const unit = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.26, 0.7, 3, 0.04), this.deviceMaterial);
      unit.position.y = y;
      group.add(unit);
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.02), this.trimMaterial);
      vent.position.set(-0.16, y, 0.355);
      group.add(vent);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), this.dotMaterial);
      led.position.set(0.33, y, 0.36);
      group.add(led);
    }
    return group;
  }

  private createWorkstation(): THREE.Group {
    const group = new THREE.Group();
    this.addPad(group, 0.78);

    const base = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.05, 0.32, 2, 0.02), this.trimMaterial);
    base.position.y = 0.05;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.05), this.trimMaterial);
    stand.position.y = 0.2;
    const monitor = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.66, 0.07, 3, 0.03), this.deviceMaterial);
    monitor.position.y = 0.64;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.54), this.screenMaterial);
    screen.position.set(0, 0.64, 0.037);
    group.add(base, stand, monitor, screen);

    // Tilt slightly back so the screen catches the camera.
    monitor.rotation.x = screen.rotation.x = -0.12;
    return group;
  }

  private createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#0f3f9c';
      context.beginPath();
      context.roundRect(8, 16, 240, 96, 48);
      context.fill();
      context.fillStyle = '#ffffff';
      context.font = '700 62px -apple-system, "Helvetica Neue", Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 68);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(1.1, 0.55, 1);
    return sprite;
  }
}
