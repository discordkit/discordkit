/**
 * The tunable presentation options the Studio's controls panel drives — the
 * "dev tool" core: a developer adjusts these and watches the live friends list
 * re-render against Discord's design guidelines, the way with-electron lets them
 * tweak a presence payload and watch Discord update.
 */
export interface StudioOptions {
  /** Row size: comfortable (avatar + status line) vs compact (denser, name-only). */
  density: `comfortable` | `compact`;
  /** Show the Discord "universal communication" badge on online-elsewhere friends. */
  showDiscordBadge: boolean;
  /** Show the "Connect to Discord" connection point (the pre-auth CTA). */
  showConnectionPoint: boolean;
  /** The game's display name, used in the "Online — {GameTitle}" section header. */
  gameTitle: string;
  /** How many online friends to simulate as "in this game" (previews that section). */
  simulatedInGame: number;
}

export const DEFAULT_OPTIONS: StudioOptions = {
  density: `comfortable`,
  showDiscordBadge: true,
  showConnectionPoint: true,
  gameTitle: `Acme Quest`,
  simulatedInGame: 0
};
