import { describe, expect, it } from "vite-plus/test";
import { describeFonts, hasCjk } from "../fontReport.js";

/**
 * The font report is how a reader of an image learns that it would look different on another machine. Inbou's audience is mostly on macOS while its developer is on Windows, where an English-locale render draws kanji in a Chinese-design font; without the note, nothing in the output says the kanji are this machine's.
 */

describe(`hasCjk`, () => {
  it.each([
    `兄は 先生です。`,
    `がっこう`,
    `カタカナ`,
    `한국어`,
    `＿＿`,
    `中文`
  ])(`finds CJK text in %s`, (text) => {
    expect(hasCjk(text)).toBe(true);
  });

  it(`finds none in Latin text with punctuation Discord cards use`, () => {
    expect(hasCjk(`Question 4 · 18 / 24 — “ends” in 10 months…`)).toBe(false);
  });
});

describe(`describeFonts`, () => {
  it(`calls an unpinned render with CJK text machine-dependent, names the fonts this machine used, and says how to pin`, () => {
    const report = describeFonts(
      [
        { family: `Noto Sans`, system: false, glyphs: 120 },
        { family: `Microsoft YaHei`, system: true, glyphs: 15 },
        { family: `Yu Gothic UI`, system: true, glyphs: 128 }
      ],
      { cjkText: true, cjk: `system` }
    );
    expect(report.machineDependent).toBe(true);
    expect(report.note).toMatch(
      /Yu Gothic UI \(128 glyphs\), Microsoft YaHei \(15 glyphs\)/
    );
    expect(report.note).toMatch(/--cjk noto-sans-jp/);
  });

  it(`still calls unpinned CJK text machine-dependent when no installed font drew it, since it may be empty boxes`, () => {
    const report = describeFonts(
      [{ family: `Noto Sans`, system: false, glyphs: 40 }],
      {
        cjkText: true,
        cjk: `system`
      }
    );
    expect(report.machineDependent).toBe(true);
    expect(report.note).toMatch(/empty boxes/);
  });

  it(`calls a pinned render with only bundled fonts the same on every machine, with no note`, () => {
    expect(
      describeFonts(
        [
          { family: `Noto Sans JP Thin`, system: false, glyphs: 143 },
          { family: `Noto Sans`, system: false, glyphs: 120 }
        ],
        { cjkText: true, cjk: `noto-sans-jp` }
      )
    ).toStrictEqual({
      used: [
        { family: `Noto Sans JP Thin`, system: false, glyphs: 143 },
        { family: `Noto Sans`, system: false, glyphs: 120 }
      ],
      machineDependent: false
    });
  });

  it(`flags other characters drawn by an installed font, without advice that pinning would fix them`, () => {
    const report = describeFonts(
      [
        { family: `Noto Sans`, system: false, glyphs: 40 },
        { family: `Segoe UI Symbol`, system: true, glyphs: 2 }
      ],
      { cjkText: false, cjk: `system` }
    );
    expect(report.machineDependent).toBe(true);
    expect(report.note).toMatch(/Segoe UI Symbol \(2 glyphs\)/);
    expect(report.note).not.toMatch(/--cjk/);
  });

  it(`merges Chromium's per-face entries into one per family, so bold and regular are not listed twice`, () => {
    expect(
      describeFonts(
        [
          { family: `Noto Sans`, system: false, glyphs: 10 },
          { family: `Microsoft YaHei`, system: true, glyphs: 3 },
          { family: `Noto Sans`, system: false, glyphs: 5 },
          { family: `Microsoft YaHei`, system: true, glyphs: 2 }
        ],
        { cjkText: false, cjk: `system` }
      ).used
    ).toStrictEqual([
      { family: `Noto Sans`, system: false, glyphs: 15 },
      { family: `Microsoft YaHei`, system: true, glyphs: 5 }
    ]);
  });
});
