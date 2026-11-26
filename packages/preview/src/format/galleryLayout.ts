/**
 * How a Media Gallery arranges its items, by how many it has.
 *
 * Discord decides this in its JavaScript, not its stylesheet. The stylesheet (web client build 679963, the attachment mosaic rules) only says which arrangements exist: a lone item (`oneByOneGrid`, with a `Single` and a `Mosaic` variant), a pair side by side (`oneByTwoGrid`), one large item beside two stacked (`oneByTwoGrid` with `oneByTwoLayoutThreeGrid`, `oneByTwoSoloItem` and `oneByTwoDuoItem` over `twoByOneGrid`), a 2×2 grid (`twoByTwoGrid`) and a 3-column grid of squares (`threeByThreeGrid`). It also has a rule putting 4px between a lone item or a pair and a 3-column grid that follows it, which is how counts above four are built.
 *
 * Which count maps to which arrangement, and whether its pictures keep their own size or are scaled to fill the gallery, is the table below. Each entry names its evidence. Calibration corrects it here and nowhere else: the renderer reads only this table.
 *
 * The evidence was checked on 2026-11-25 against screenshots of the real desktop and iOS clients (spec §7b). Earlier entries rested on notes written while building Tome, and two of those were wrong: a lone picture is not scaled up, and a pair of small pictures is not shared across the width.
 */

/** One of the arrangements Discord's stylesheet defines, named after its class. */
export type GalleryLayout =
  /** A lone item, up to 350px tall: `oneByOneGrid` + `oneByOneGridSingle`. */
  | `oneByOne`
  /** A lone item spanning the gallery's width above a 3-column grid, up to 280px tall: `oneByOneGrid` + `oneByOneGridMosaic`. */
  | `oneByOneMosaic`
  /** Two items side by side, 4px apart, up to 280px tall: `oneByTwoGrid`. */
  | `oneByTwo`
  /** One item taking two thirds of the width beside two stacked in the last third, up to 350px tall: `oneByTwoGrid` + `oneByTwoLayoutThreeGrid`. */
  | `oneByTwoLayoutThree`
  /** Four items in two equal rows of two, up to 350px tall: `twoByTwoGrid`. */
  | `twoByTwo`
  /** Square items, three to a row: `threeByThreeGrid`. */
  | `threeByThree`;

/** A band of the gallery, top to bottom: which arrangement, and how many of the gallery's items it takes, in order. */
export interface GalleryRow {
  layout: GalleryLayout;
  items: number;
}

/**
 * How big the pictures are drawn.
 *
 * - `own`: each picture at its file's own size, never scaled up, and scaled down (keeping its shape) only to fit its slot. The gallery is as wide as its pictures, so a container holding it shrinks to it.
 * - `fill`: the gallery takes the full width (600px, or the column if narrower) and its pictures are scaled up or down to fill their slots, cropped rather than letterboxed.
 */
export type GallerySizing = `own` | `fill`;

/** What each count's arrangement rests on, so a reader can tell observation from inference. */
export type GalleryEvidence =
  /** Seen in screenshots of the real desktop client. */
  | `desktop`
  /** Seen only in screenshots of the iOS app, which lays galleries out differently from desktop (spec §7b), so the desktop drawing is a choice. */
  | `ios`
  /** Inferred from the shape of Discord's stylesheet; no screenshot shows it. */
  | `stylesheet`;

export interface GalleryArrangement {
  rows: readonly GalleryRow[];
  sizing: GallerySizing;
  evidence: GalleryEvidence;
  /** What the entry draws that no screenshot has shown, when part of it has been seen. */
  unobserved?: string;
}

/** The arrangement for each item count Discord allows, 1 to 10. */
export const galleryArrangements = {
  // Desktop: an 88×64, a 128×128 and a 256×144 file each drawn at exactly that size, never scaled up; a large wide picture scaled down to the container's content width, and a tall one to 350px tall, left-aligned. The container shrinks to the picture when nothing else in it is wider. Tome's note that a lone picture is upscaled was wrong.
  1: {
    rows: [{ layout: `oneByOne`, items: 1 }],
    sizing: `own`,
    evidence: `desktop`
  },
  // Desktop: two 256×144 files drawn at their own size 4px apart, the container shrinking to them (550px wide). Tome's note that a pair of square icons "renders as proper squares" had no capture behind it.
  2: {
    rows: [{ layout: `oneByTwo`, items: 2 }],
    sizing: `own`,
    evidence: `desktop`,
    unobserved: `Only a pair of small pictures of the same shape has been seen. A larger picture is scaled down to 280px tall (the stylesheet's cap for a pair), a pair wider than the column shrinks in proportion to the pictures' widths, and pictures of different shapes keep their own shapes, top-aligned, rather than being cropped to one height.`
  },
  // iOS only: one picture beside two stacked, in iOS's fixed 273×181 box. Never captured on desktop, where it is drawn at the full width with the stylesheet's 2:1 split and 350px cap.
  3: {
    rows: [{ layout: `oneByTwoLayoutThree`, items: 3 }],
    sizing: `fill`,
    evidence: `ios`,
    unobserved: `The desktop drawing: filling the full width, with the large picture taking two thirds.`
  },
  // Desktop: four 16:9 pictures as 281.6×158.4px tiles filling a 600px container, and four 32×32 icons scaled up into wide tiles 172.8px tall, the 350px cap. Tome's notes hold here.
  4: {
    rows: [{ layout: `twoByTwo`, items: 4 }],
    sizing: `fill`,
    evidence: `desktop`
  },
  // From here on, nothing has been captured on either client. The stylesheet spaces a lone item or a pair from a 3-column grid below it, so a count is filled with rows of three, and what is left over (one or two) goes in a band on top, at the full width as four are.
  5: {
    rows: [
      { layout: `oneByTwo`, items: 2 },
      { layout: `threeByThree`, items: 3 }
    ],
    sizing: `fill`,
    evidence: `stylesheet`
  },
  6: {
    rows: [{ layout: `threeByThree`, items: 6 }],
    sizing: `fill`,
    evidence: `stylesheet`
  },
  7: {
    rows: [
      { layout: `oneByOneMosaic`, items: 1 },
      { layout: `threeByThree`, items: 6 }
    ],
    sizing: `fill`,
    evidence: `stylesheet`
  },
  8: {
    rows: [
      { layout: `oneByTwo`, items: 2 },
      { layout: `threeByThree`, items: 6 }
    ],
    sizing: `fill`,
    evidence: `stylesheet`
  },
  9: {
    rows: [{ layout: `threeByThree`, items: 9 }],
    sizing: `fill`,
    evidence: `stylesheet`
  },
  10: {
    rows: [
      { layout: `oneByOneMosaic`, items: 1 },
      { layout: `threeByThree`, items: 9 }
    ],
    sizing: `fill`,
    evidence: `stylesheet`
  }
} as const satisfies Record<number, GalleryArrangement>;

/** The fewest and most items a Media Gallery can hold. */
export const galleryItemLimits = { min: 1, max: 10 } as const;

/** The table's entry for `count` items, or a RangeError for a count Discord refuses to send, so a preview never invents an arrangement for one. */
const arrangementFor = (count: number): GalleryArrangement => {
  const arrangement = (
    galleryArrangements as Partial<Record<number, GalleryArrangement>>
  )[count];
  if (!arrangement) {
    throw new RangeError(
      `@discordkit/preview cannot draw a Media Gallery of ${String(count)} items. Discord accepts ${String(galleryItemLimits.min)} to ${String(galleryItemLimits.max)} and refuses to send any other count, so there is no arrangement to show. Give the gallery between ${String(galleryItemLimits.min)} and ${String(galleryItemLimits.max)} items, or split it into several galleries.`
    );
  }
  return arrangement;
};

/** Whether a gallery of `count` items draws its pictures at their own size or fills the width. Throws as {@link arrangeGallery} does. */
export const gallerySizing = (count: number): GallerySizing =>
  arrangementFor(count).sizing;

/**
 * Splits a gallery's items into its bands, top to bottom, in the arrangement the table gives for their count.
 *
 * Throws for an empty gallery or one of more than ten, which Discord refuses to send, so a preview never invents an arrangement for one.
 */
export const arrangeGallery = <Item>(
  items: readonly Item[]
): Array<{ layout: GalleryLayout; items: Item[] }> => {
  const arrangement = arrangementFor(items.length);
  let start = 0;
  return arrangement.rows.map(({ layout, items: count }) => {
    const band = items.slice(start, start + count);
    start += count;
    return { layout, items: band };
  });
};
