import * as v from "valibot";
import type { ActivityInput } from "@discordkit/native/presence";
import { dicebear } from "./samples.js";

/**
 * The editor form, as a Valibot schema. Its INPUT is the editable form shape; its OUTPUT (via `transform`) is a ready-to-send `@discordkit/native` `ActivityInput` — so there's no separate flat→activity mapping function.
 *
 * The form shape deliberately carries BOTH:
 *  - presentation/form state — `enabled` (presence on/off) and per-section `on` toggles + image `source`/`seed` — which let sections be explicitly omitted (rather than inferring "off" from an empty string), and
 *  - the activity values themselves, grouped under `activity`.
 *
 * Keeping every value (including the toggles) IN the form means a single `reset(DEFAULT_VALUES)` restores the entire UI, and the transform decides what actually ships based on the `on` flags.
 *
 * Built by a factory closing over the two session-stable, non-editable values — a party `id` (Discord requires one when party size is set) and the `start` timestamp — so the transform stays pure. Build once (memoized) so they don't churn per keystroke.
 *
 * (Lives here, not in `@discordkit/native`: the keystone is deliberately valibot-free — an FFI binding shouldn't force a validation dep on headless consumers. This is a small, intentional mirror of ActivityInput.)
 */
const urlValue = v.union([v.literal(``), v.pipe(v.string(), v.url())]);

/** A toggleable image: source (sample seed vs. custom URL) + hover text. The resolved image string is derived in the transform, not stored. */
const ImageShape = v.object({
  on: v.boolean(),
  source: v.union([v.literal(`sample`), v.literal(`url`)]),
  seed: v.string(),
  url: urlValue,
  text: v.string()
});

const FormShape = v.object({
  /** Master presence on/off. When off, nothing is broadcast (presence cleared). */
  enabled: v.boolean(),
  activity: v.object({
    details: v.object({ on: v.boolean(), value: v.string() }),
    state: v.object({ on: v.boolean(), value: v.string() }),
    // Which field Discord surfaces in the user's status text. Always applies —
    // `name` (the app name) is the SDK default, so no on/off toggle; the
    // transform simply omits it when it's the default.
    statusDisplayType: v.picklist([`name`, `state`, `details`]),
    largeImage: ImageShape,
    smallImage: ImageShape,
    party: v.object({
      on: v.boolean(),
      currentSize: v.pipe(v.number(), v.minValue(0)),
      maxSize: v.pipe(v.number(), v.minValue(0))
    }),
    useTimestamp: v.boolean(),
    // Discord shows at most two buttons; each needs a label + a valid URL.
    buttons: v.pipe(
      v.array(v.object({ label: v.string(), url: urlValue })),
      v.maxLength(2)
    )
  })
});

/** Input (editable) form values — what RHF holds and the inputs bind to. */
export type FormValues = v.InferInput<typeof FormShape>;
/** One image sub-form (used by the ImageField component props). */
export type ImageValues = v.InferInput<typeof ImageShape>;

/** Resolve an image sub-form to its URL string (or "" when off/empty). */
const resolveImage = (img: ImageValues, style: string): string => {
  if (!img.on) return ``;
  return img.source === `sample` ? dicebear(style, img.seed) : img.url;
};

export const createActivitySchema = (
  partyId: string,
  startedAt: number
): v.GenericSchema<FormValues, ActivityInput> =>
  // `transform` (not `rawTransform`): a pure value→value map. Validation already happened in FormShape; `transform` infers its output (ActivityInput) from the returned value. The `on` flags decide what ships.
  v.pipe(
    FormShape,
    v.transform(({ activity: a }): ActivityInput => {
      const largeImage = resolveImage(a.largeImage, `shapes`);
      const smallImage = resolveImage(a.smallImage, `bottts`);
      // Build the optional containers first so they can be omitted entirely when empty — an empty `assets: {}` / `buttons: []` is noise in the Show Code output and isn't how you'd hand-write the call.
      const assets = {
        ...(largeImage ? { largeImage, largeText: a.largeImage.text } : {}),
        ...(smallImage ? { smallImage, smallText: a.smallImage.text } : {})
      };
      const buttons = a.buttons.filter((b) => b.label && b.url);
      return {
        type: `playing`,
        ...(a.details.on && a.details.value
          ? { details: a.details.value }
          : {}),
        ...(a.state.on && a.state.value ? { state: a.state.value } : {}),
        // `name` is the SDK default, so only ship the field when it differs —
        // keeps the "Show Code" output clean (omitting it == choosing name).
        ...(a.statusDisplayType !== `name`
          ? { statusDisplayType: a.statusDisplayType }
          : {}),
        ...(Object.keys(assets).length ? { assets } : {}),
        ...(a.party.on && (a.party.currentSize || a.party.maxSize)
          ? {
              party: {
                id: partyId,
                currentSize: a.party.currentSize,
                maxSize: a.party.maxSize
              }
            }
          : {}),
        ...(a.useTimestamp ? { timestamps: { start: startedAt } } : {}),
        ...(buttons.length ? { buttons } : {})
      };
    })
  );

export const DEFAULT_VALUES: FormValues = {
  enabled: true,
  activity: {
    // Defaults that explain themselves: a discordkit demo. "what / where".
    details: { on: true, value: `Building with discordkit` },
    state: { on: true, value: `Editing Rich Presence` },
    // `name` = the SDK default (shows the app name); switch to state/details to
    // surface those fields in the status text instead.
    statusDisplayType: `name`,
    // DiceBear samples so the card shows delightful art out of the box: an abstract "scene" large image + a robot "character" small badge.
    largeImage: {
      on: true,
      source: `sample`,
      seed: `discordkit`,
      url: ``,
      text: `discordkit`
    },
    smallImage: {
      on: true,
      source: `sample`,
      seed: `discordkit`,
      url: ``,
      text: `Online`
    },
    // Party off by default — not every presence has a player count.
    party: { on: false, currentSize: 1, maxSize: 5 },
    useTimestamp: true,
    buttons: [
      { label: `View on GitHub`, url: `https://github.com/saeris/discordkit` }
    ]
  }
};
