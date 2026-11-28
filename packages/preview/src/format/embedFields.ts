/**
 * Where each field of an embed sits in its field grid.
 *
 * Discord's stylesheet makes the fields a grid with an 8px gap but gives it no columns (web client build 679963, `.embedFields_*`); the client's JavaScript places each field with an inline `grid-column` on a 12-column line. A field that is not inline takes the whole line. Consecutive inline fields share a line, up to three, or two when the embed has a thumbnail beside them, splitting the twelve columns evenly. That rule is from the client's behaviour as commonly seen, not from its stylesheet, and is to be confirmed against the live client.
 */

/** Columns in a field line. Three and two fields both divide it evenly. */
const lineColumns = 12;

/** How many inline fields share a line: three, or two beside a thumbnail. */
export const inlineFieldsPerLine = (hasThumbnail: boolean): number =>
  hasThumbnail ? 2 : 3;

/**
 * The `grid-column` value for each field, in order: `1 / 13` for a field alone on its line, `1 / 7` and `7 / 13` for two sharing one, `1 / 5`, `5 / 9` and `9 / 13` for three.
 */
export const embedFieldColumns = (
  fields: ReadonlyArray<{ inline?: boolean }>,
  hasThumbnail: boolean
): string[] => {
  const perLine = inlineFieldsPerLine(hasThumbnail);
  const columns: string[] = [];
  let index = 0;
  while (index < fields.length) {
    // A run of inline fields from here, cut at the line's capacity; a field that is not inline is a run of one.
    let run = 1;
    if (fields[index].inline === true) {
      while (
        run < perLine &&
        index + run < fields.length &&
        fields[index + run].inline === true
      ) {
        run++;
      }
    }
    const span = lineColumns / run;
    for (let position = 0; position < run; position++) {
      const start = position * span + 1;
      columns.push(`${String(start)} / ${String(start + span)}`);
    }
    index += run;
  }
  return columns;
};
