import type { CjkFont } from "./fonts.js";

/** A font that drew some of the scene's text. */
export interface FontUse {
  /** The family name inside the font file, which for a supplied gg sans is whatever that file calls itself. */
  family: string;
  /** Installed on this machine, rather than bundled with the package or supplied as gg sans. */
  system: boolean;
  /** How many glyphs it drew. */
  glyphs: number;
}

/** Which fonts drew a render's text. This describes the image, not the message: nothing here is a problem with the payload. */
export interface FontReport {
  /** Every font that drew text, most glyphs first. */
  used: FontUse[];
  /** Whether another machine could draw this scene's text differently: some text was drawn with an installed font, or Chinese, Japanese or Korean text was left to this machine's fonts. */
  machineDependent: boolean;
  /** Why the image is machine-dependent and what to do about it, when it is. */
  note?: string;
}

/** Han, kana, Hangul, CJK punctuation and full-width forms, including the supplementary ideograph planes. */
const cjkPattern =
  /[ᄀ-ᇿ⺀-⿟　-ㇿ㈀-鿿ꥠ-꥿가-퟿豈-﫿︰-﹏＀-￯\u{20000}-\u{3FFFF}]/u;

export const hasCjk = (text: string): boolean => cjkPattern.test(text);

/** Merges Chromium's per-face report (one entry per weight and style) into one per family, ordered so the same render always reports the same list. */
const byFamily = (fonts: readonly FontUse[]): FontUse[] => {
  const merged = new Map<string, FontUse>();
  for (const font of fonts) {
    const key = `${font.system ? `system` : `page`}:${font.family}`;
    const entry = merged.get(key);
    if (entry) entry.glyphs += font.glyphs;
    else merged.set(key, { ...font });
  }
  return [...merged.values()].sort(
    (a, b) =>
      b.glyphs - a.glyphs ||
      a.family.localeCompare(b.family, `en`) ||
      Number(a.system) - Number(b.system)
  );
};

const listed = (fonts: readonly FontUse[]): string =>
  fonts
    .map(
      (font) =>
        `${font.family} (${String(font.glyphs)} glyph${font.glyphs === 1 ? `` : `s`})`
    )
    .join(`, `);

const pinAdvice = `To draw the same image on every machine, pin CJK text to the bundled Japanese-design Noto Sans JP: \`--cjk noto-sans-jp\` on the command line, or \`cjk: "noto-sans-jp"\` in the Node API.`;

/**
 * Says which fonts drew the text, and whether the image would look different on another machine. That is information for whoever reads the image, so it is reported beside the findings rather than as one.
 */
export const describeFonts = (
  fonts: readonly FontUse[],
  { cjkText, cjk }: { cjkText: boolean; cjk: CjkFont }
): FontReport => {
  const used = byFamily(fonts);
  const system = used.filter((font) => font.system);
  if (cjkText && cjk === `system`) {
    return {
      used,
      machineDependent: true,
      note:
        system.length > 0
          ? `Chinese, Japanese or Korean text in this scene was drawn with fonts installed on this machine (${listed(system)}), as the Discord client does, so the image shows what this machine draws, not what every viewer sees: under an English locale, Windows draws kanji in a Chinese-design font, while macOS is believed to draw them in Hiragino. ${pinAdvice}`
          : `This scene has Chinese, Japanese or Korean text, and no font installed on this machine drew it, so it may show as empty boxes, and another machine will draw it differently. ${pinAdvice}`
    };
  }
  if (system.length > 0) {
    return {
      used,
      machineDependent: true,
      note: `Some text was drawn with fonts installed on this machine (${listed(system)}), because the fonts the renderer controls do not have those characters, so another machine may draw them differently. Nothing in the renderer pins these characters; Korean Hangul is one example, since Noto Sans JP does not have it.`
    };
  }
  return { used, machineDependent: false };
};
