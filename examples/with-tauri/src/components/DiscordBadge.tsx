/**
 * The Discord "universal communication" badge shown beside an online-elsewhere
 * friend who has connected their Discord account. Per the `unified-friends-list`
 * guideline it signals: "I can message or invite this friend anywhere Discord is
 * present." The blurple Discord mark, sized to sit inline with the name.
 */
export const DiscordBadge = (): React.JSX.Element => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="var(--color-brand)"
    role="img"
    aria-label="Reachable on Discord"
    className="shrink-0"
  >
    <path d="M20.32 4.37A19.8 19.8 0 0 0 15.45 3a13.6 13.6 0 0 0-.62 1.27 18.3 18.3 0 0 0-5.66 0A13.6 13.6 0 0 0 8.55 3a19.8 19.8 0 0 0-4.88 1.37C.55 9.06-.3 13.64.12 18.15a19.9 19.9 0 0 0 6.07 3.07c.49-.67.93-1.38 1.3-2.13-.71-.27-1.4-.6-2.04-.99.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.1 0c.16.14.33.27.5.4-.65.39-1.34.72-2.05.99.38.75.81 1.46 1.3 2.13a19.9 19.9 0 0 0 6.08-3.07c.5-5.23-.85-9.77-3.56-13.78ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.94-2.42 2.15-2.42 1.22 0 2.18 1.1 2.16 2.42 0 1.34-.94 2.42-2.16 2.42Z" />
  </svg>
);
