import { colorToHex } from "../../format/color.js";

/**
 * Discord carries a colour (a container's accent, an embed's bar) as an integer from `0x000000` to `0xffffff`. People think of colours as hex, so the colour control shows and takes `#rrggbb` and the form stores the integer.
 */

/** The integer a hex colour stands for: `#2f4b6e`, `2F4B6E` and the short `#abc` all work. Undefined for anything that is not a colour, or for nothing at all, which clears the colour. */
export const hexToColor = (hex: string): number | undefined => {
  const digits = hex.trim().replace(/^#/, ``);
  const full = digits.length === 3 ? digits.replace(/./g, `$&$&`) : digits;
  return /^[\da-f]{6}$/i.test(full) ? Number.parseInt(full, 16) : undefined;
};

/** A colour integer as `#rrggbb`, or undefined for no colour or one outside Discord's range. */
export const colorToHexOrUndefined = (
  color: number | null | undefined
): string | undefined => {
  if (color === null || color === undefined) return undefined;
  try {
    return colorToHex(color);
  } catch {
    return undefined;
  }
};
