/**
 * DiceBear sample-image helpers. DiceBear is a free avatar/illustration API
 * whose `seed` randomizes the art — perfect for delightful, zero-setup samples
 * that fit Discord's playful tone (no Portal upload, no login). External image
 * URLs are accepted by the SDK.
 *
 * Convention: the large slot is a scene/cover (we use the abstract `shapes`
 * style) and the small slot is a corner avatar/character badge (we use the
 * robot `bottts` style) — matching real-world rich-presence usage.
 *
 * (Pure helpers live here, not in `imageField.tsx`, so non-JSX modules like the
 * schema can import them without pulling JSX into a `.ts` compile context.)
 */
export const dicebear = (style: string, seed: string): string =>
  `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&size=512`;

export const randomSeed = (): string => Math.random().toString(36).slice(2, 9);

/** Whether a URL is a DiceBear sample (so a field can pick its initial source). */
export const isDicebear = (value: string): boolean =>
  value.startsWith(`https://api.dicebear.com/`);

/** Pull the `seed` back out of a DiceBear URL, for seeding the editable seed
 * input from a stored value. Falls back to empty if not present. */
export const seedOf = (value: string): string => {
  try {
    return new URL(value).searchParams.get(`seed`) ?? ``;
  } catch {
    return ``;
  }
};
