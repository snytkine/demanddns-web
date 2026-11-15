/** A [min, max] range in seconds. */
export type SecondsRange = readonly [min: number, max: number];

export interface AnimationConfig {
  /** How long the animation runs before it stops on its own (seconds). */
  readonly loopSeconds: number;
  /** Speed of the dots between workstations/servers and the DNS server (scene units per second). */
  readonly lanDotSpeed: number;
  /** Pause between two queries from the same workstation/server (seconds, random within range). */
  readonly lanQueryInterval: SecondsRange;
  /** Speed of the dot between the DNS server and the Internet (scene units per second). */
  readonly internetDotSpeed: number;
  /** Pause between two upstream queries to the Internet (seconds, random within range). */
  readonly internetQueryInterval: SecondsRange;
}

/**
 * Settings for the animated network on the home page.
 * Larger speed = faster dots. Larger interval = less frequent traffic.
 */
export const animationConfig: AnimationConfig = {
  loopSeconds: 10,
  lanDotSpeed: 3.2,
  lanQueryInterval: [0.3, 1.6],
  internetDotSpeed: 2.2,
  internetQueryInterval: [2.5, 4],
};
