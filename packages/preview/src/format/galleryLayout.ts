/**
 * How a Media Gallery arranges its items, by how many it has.
 *
 * Discord decides this in its JavaScript, not its stylesheet. The stylesheet (web client build 679963, the attachment mosaic rules) only says which arrangements exist: a lone item (`oneByOneGrid`, with a `Single` and a `Mosaic` variant), a pair side by side (`oneByTwoGrid`), one large item beside two stacked (`oneByTwoGrid` with `oneByTwoLayoutThreeGrid`, `oneByTwoSoloItem` and `oneByTwoDuoItem` over `twoByOneGrid`), a 2×2 grid (`twoByTwoGrid`) and a 3-column grid of squares (`threeByThreeGrid`). It also has a rule putting 4px between a lone item or a pair and a 3-column grid that follows it, which is how counts above four are built.
 *
 * Which count maps to which arrangement is the table below. Each entry names its evidence. Calibration corrects it here and nowhere else: the renderer reads only this table.
 */

/** One of the arrangements Discord's stylesheet defines, named after its class. */
export type GalleryLayout =
  /** A lone item at its own aspect ratio, up to 350px tall: `oneByOneGrid` + `oneByOneGridSingle`. */
  | `oneByOne`
  /** A lone item spanning the gallery's width above a 3-column grid, up to 280px tall: `oneByOneGrid` + `oneByOneGridMosaic`. */
  | `oneByOneMosaic`
  /** Two items side by side, sharing the width, up to 280px tall: `oneByTwoGrid`. */
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

/** What each count's arrangement rests on, so a reader can tell observation from inference. */
export type GalleryEvidence =
  /** Seen in the real client and written down in Tome's docs/specs/name-redaction.md. */
  | `observed`
  /** Inferred from the shape of Discord's stylesheet; nobody has looked. */
  | `inferred`;

export interface GalleryArrangement {
  rows: readonly GalleryRow[];
  evidence: GalleryEvidence;
}

/** The arrangement for each item count Discord allows, 1 to 10. */
export const galleryArrangements = {
  // Inferred: the only arrangement for one item, and the stylesheet's `Single` variant. Tome observed that a lone item is upscaled to fill its slot rather than drawn at its file's size, which is how it is drawn here, but not the slot's exact size.
  1: { rows: [{ layout: `oneByOne`, items: 1 }], evidence: `inferred` },
  // Observed by Tome: "a pair of 128×128 ability icons renders as proper squares with nothing cut off".
  2: { rows: [{ layout: `oneByTwo`, items: 2 }], evidence: `observed` },
  // Observed by Tome: "three produce a mosaic — one large panel on the left with the other two stacked narrow on the right".
  3: {
    rows: [{ layout: `oneByTwoLayoutThree`, items: 3 }],
    evidence: `observed`
  },
  // Observed by Tome: "four tile evenly 2×2", square icons "stretched into wide tiles with the top and bottom lost".
  4: { rows: [{ layout: `twoByTwo`, items: 4 }], evidence: `observed` },
  // Inferred from here on. The stylesheet spaces a lone item or a pair from a 3-column grid below it, so a count is filled with rows of three, and what is left over (one or two) goes in a band on top.
  5: {
    rows: [
      { layout: `oneByTwo`, items: 2 },
      { layout: `threeByThree`, items: 3 }
    ],
    evidence: `inferred`
  },
  6: { rows: [{ layout: `threeByThree`, items: 6 }], evidence: `inferred` },
  7: {
    rows: [
      { layout: `oneByOneMosaic`, items: 1 },
      { layout: `threeByThree`, items: 6 }
    ],
    evidence: `inferred`
  },
  8: {
    rows: [
      { layout: `oneByTwo`, items: 2 },
      { layout: `threeByThree`, items: 6 }
    ],
    evidence: `inferred`
  },
  9: { rows: [{ layout: `threeByThree`, items: 9 }], evidence: `inferred` },
  10: {
    rows: [
      { layout: `oneByOneMosaic`, items: 1 },
      { layout: `threeByThree`, items: 9 }
    ],
    evidence: `inferred`
  }
} as const satisfies Record<number, GalleryArrangement>;

/** The fewest and most items a Media Gallery can hold. */
export const galleryItemLimits = { min: 1, max: 10 } as const;

/**
 * Splits a gallery's items into its bands, top to bottom, in the arrangement the table gives for their count.
 *
 * Throws for an empty gallery or one of more than ten, which Discord refuses to send, so a preview never invents an arrangement for one.
 */
export const arrangeGallery = <Item>(
  items: readonly Item[]
): Array<{ layout: GalleryLayout; items: Item[] }> => {
  const arrangement = (
    galleryArrangements as Partial<Record<number, GalleryArrangement>>
  )[items.length];
  if (!arrangement) {
    throw new RangeError(
      `@discordkit/preview cannot draw a Media Gallery of ${String(items.length)} items. Discord accepts ${String(galleryItemLimits.min)} to ${String(galleryItemLimits.max)} and refuses to send any other count, so there is no arrangement to show. Give the gallery between ${String(galleryItemLimits.min)} and ${String(galleryItemLimits.max)} items, or split it into several galleries.`
    );
  }
  let start = 0;
  return arrangement.rows.map(({ layout, items: count }) => {
    const band = items.slice(start, start + count);
    start += count;
    return { layout, items: band };
  });
};
