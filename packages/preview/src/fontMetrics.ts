/**
 * The vertical metrics the bundled Noto Sans is given when it stands in for gg sans, as `@font-face` descriptors.
 *
 * Glyph shapes and widths differ between the two fonts and cannot be matched, but how much room a line of text takes above and below its baseline can. That room is what an inline box's background fills: Noto Sans's own metrics (ascent 1.069em, descent 0.293em) made a timestamp chip, a mention pill and a hidden spoiler 19px tall at 14px, where the desktop client draws them 18px tall with the baseline 14px below the top (spec §7b). Measured on two captures at 1 image pixel per CSS pixel and one at 1.25, where Chromium rounds the ascent and descent to whole device pixels separately: 14 and 4 at 14px, 18 and 6 at 17.5px. The values below are the middle of the range all three allow (ascent 1.000 to 1.036em, descent 0.314 to 0.321em), and Chromium rounds them the same way, to 14 and 4 at 14px.
 *
 * Only these two are set. The line gap matters only to `line-height: normal`, which no component uses.
 */
export const ggSansStandInMetrics = {
  "ascent-override": `101.8%`,
  "descent-override": `31.8%`
} as const;

/** {@link ggSansStandInMetrics} written as `@font-face` descriptors. */
export const ggSansStandInDescriptors = Object.entries(ggSansStandInMetrics)
  .map(([name, value]) => `${name}:${value};`)
  .join(``);
