import { describe, expect, it } from "vite-plus/test";
import { colorToHex } from "../color.js";
import { embedFieldColumns } from "../embedFields.js";
import {
  arrangeGallery,
  galleryArrangements,
  gallerySizing
} from "../galleryLayout.js";

/** The decisions Discord makes in JavaScript rather than CSS, kept as data so calibration can correct them in one place. These pin what the data says, so a change to it is deliberate. */

describe(`colorToHex`, () => {
  it(`writes an API colour as the six-digit hex a stylesheet takes, keeping leading zeros so blue does not turn into a short, wrong colour`, () => {
    expect(colorToHex(0x5865f2)).toBe(`#5865f2`);
    expect(colorToHex(0x0000ff)).toBe(`#0000ff`);
    expect(colorToHex(0)).toBe(`#000000`);
    expect(colorToHex(0xffffff)).toBe(`#ffffff`);
  });

  it.each([-1, 0x1000000, 1.5, Number.NaN])(
    `refuses %s, which is not a Discord colour, instead of drawing some other colour`,
    (color) => {
      expect(() => colorToHex(color)).toThrow(/cannot draw the colour/);
    }
  );
});

describe(`the media gallery arrangement`, () => {
  const items = (count: number): number[] =>
    Array.from({ length: count }, (_, index) => index);

  it.each(Object.entries(galleryArrangements))(
    `places all %s items, each once and in payload order, since the order is the answer order in Tome's picture questions`,
    (count) => {
      const bands = arrangeGallery(items(Number(count)));
      expect(bands.flatMap((band) => band.items)).toStrictEqual(
        items(Number(count))
      );
    }
  );

  it(`draws three as one large item beside two stacked, and four as an even 2×2, as the captures show (three on iOS only)`, () => {
    expect(arrangeGallery(items(3)).map((band) => band.layout)).toStrictEqual([
      `oneByTwoLayoutThree`
    ]);
    expect(arrangeGallery(items(4)).map((band) => band.layout)).toStrictEqual([
      `twoByTwo`
    ]);
    expect(galleryArrangements[3].evidence).toBe(`ios`);
    expect(galleryArrangements[4].evidence).toBe(`desktop`);
  });

  it(`draws one or two pictures at their own size and three or more filling the width, as the desktop captures show for one, two and four`, () => {
    expect(
      Object.keys(galleryArrangements).map((count) =>
        gallerySizing(Number(count))
      )
    ).toStrictEqual([
      `own`,
      `own`,
      `fill`,
      `fill`,
      `fill`,
      `fill`,
      `fill`,
      `fill`,
      `fill`,
      `fill`
    ]);
    expect(galleryArrangements[1].evidence).toBe(`desktop`);
    expect(galleryArrangements[2].evidence).toBe(`desktop`);
  });

  it(`says what part of an entry no capture has shown, so a reader does not take a choice for an observation`, () => {
    expect(galleryArrangements[2].unobserved).toMatch(/large/);
    expect(galleryArrangements[3].unobserved).toMatch(/desktop/);
    for (const count of [5, 6, 7, 8, 9, 10] as const) {
      expect(galleryArrangements[count].evidence).toBe(`stylesheet`);
    }
  });

  it(`puts what is left over from rows of three in a band on top, with the rest in the 3-column grid`, () => {
    const layouts = (count: number): string[] =>
      arrangeGallery(items(count)).map(
        (band) => `${band.layout}:${String(band.items.length)}`
      );
    expect(layouts(5)).toStrictEqual([`oneByTwo:2`, `threeByThree:3`]);
    expect(layouts(7)).toStrictEqual([`oneByOneMosaic:1`, `threeByThree:6`]);
    expect(layouts(9)).toStrictEqual([`threeByThree:9`]);
    expect(layouts(10)).toStrictEqual([`oneByOneMosaic:1`, `threeByThree:9`]);
  });

  it.each([0, 11])(
    `refuses a gallery of %i items, which Discord will not send, instead of inventing an arrangement`,
    (count) => {
      expect(() => arrangeGallery(items(count))).toThrow(
        /cannot draw a Media Gallery of \d+ items/
      );
      expect(() => gallerySizing(count)).toThrow(
        /cannot draw a Media Gallery of \d+ items/
      );
    }
  );
});

describe(`embed field columns`, () => {
  const inline = { inline: true };
  const block = { inline: false };

  it(`gives a field that is not inline the whole 12-column line`, () => {
    expect(embedFieldColumns([block, block], false)).toStrictEqual([
      `1 / 13`,
      `1 / 13`
    ]);
  });

  it(`puts up to three inline fields on a line, a third each, as Inbou's From, Target and Class sit`, () => {
    expect(
      embedFieldColumns([inline, inline, inline, inline], false)
    ).toStrictEqual([`1 / 5`, `5 / 9`, `9 / 13`, `1 / 13`]);
  });

  it(`puts only two on a line when a thumbnail takes the embed's right column`, () => {
    expect(embedFieldColumns([inline, inline, inline], true)).toStrictEqual([
      `1 / 7`,
      `7 / 13`,
      `1 / 13`
    ]);
  });

  it(`ends a line of inline fields at a field that is not inline`, () => {
    expect(
      embedFieldColumns([inline, block, inline, inline], false)
    ).toStrictEqual([`1 / 13`, `1 / 13`, `1 / 7`, `7 / 13`]);
  });
});
