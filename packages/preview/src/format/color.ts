/**
 * A colour as the API carries it (an integer from `0x000000` to `0xffffff`, as in a container's `accentColor`, an embed's `color` or a role's `color`) written as the `#rrggbb` a stylesheet takes.
 *
 * Throws for anything outside that range, which the client's schemas already refuse, so a bad colour fails loudly here rather than drawing as some other colour.
 */
export const colorToHex = (color: number): string => {
  if (!Number.isInteger(color) || color < 0 || color > 0xff_ff_ff) {
    throw new RangeError(
      `@discordkit/preview cannot draw the colour ${String(color)}. Discord colours are whole numbers from 0 (0x000000, black) to 16777215 (0xffffff, white), one byte each for red, green and blue. Write it as a hex literal such as 0x5865f2.`
    );
  }
  return `#${color.toString(16).padStart(6, `0`)}`;
};
