import * as v from "valibot";
import type { ActivityInput } from "@discordkit/native/presence";

/**
 * The editor form, as a Valibot schema. The schema's INPUT is the editable form
 * shape; its OUTPUT (via `rawTransform`) is a ready-to-send `@discordkit/native`
 * `ActivityInput` — so there's no separate flat→activity mapping function.
 *
 * The schema is built by a factory that closes over the two session-stable,
 * non-editable values — a party `id` (Discord requires one when party size is
 * set) and the activity `start` timestamp — so the transform stays pure while
 * still producing a complete activity. Build it once (memoized) so those values
 * don't churn on every keystroke.
 *
 * (Lives here, not in `@discordkit/native`: the keystone is deliberately
 * valibot-free — an FFI binding shouldn't force a validation dep on headless
 * consumers. This is a small, intentional mirror of ActivityInput.)
 */
const url = v.union([v.literal(``), v.pipe(v.string(), v.url())]);

const FormShape = v.object({
  details: v.string(),
  state: v.string(),
  assets: v.object({
    largeImage: v.string(),
    largeText: v.string(),
    smallImage: v.string(),
    smallText: v.string()
  }),
  party: v.object({
    currentSize: v.pipe(v.number(), v.minValue(0)),
    maxSize: v.pipe(v.number(), v.minValue(0))
  }),
  useTimestamp: v.boolean(),
  // Discord shows at most two buttons; each needs a label + a valid URL.
  buttons: v.pipe(v.array(v.object({ label: v.string(), url })), v.maxLength(2))
});

/** Input (editable) form values — what RHF holds and the inputs bind to. */
export type FormValues = v.InferInput<typeof FormShape>;

export const createActivitySchema = (partyId: string, startedAt: number) =>
  // `transform` (not `rawTransform`): a pure value→value map. Validation already
  // happened in FormShape, so we don't need addIssue — and `transform` infers
  // its output (ActivityInput) straight from the returned value.
  v.pipe(
    FormShape,
    v.transform(
      (f): ActivityInput => ({
        type: `playing`,
        details: f.details,
        state: f.state,
        assets: f.assets,
        party: {
          id: partyId,
          currentSize: f.party.currentSize,
          maxSize: f.party.maxSize
        },
        ...(f.useTimestamp ? { timestamps: { start: startedAt } } : {}),
        buttons: f.buttons.filter((b) => b.label && b.url)
      })
    )
  );

export const DEFAULT_VALUES: FormValues = {
  details: `Competitive`,
  state: `Playing Solo`,
  assets: {
    largeImage: ``,
    largeText: `Numbani`,
    smallImage: ``,
    smallText: `Rogue - Level 100`
  },
  party: { currentSize: 1, maxSize: 5 },
  useTimestamp: true,
  buttons: [{ label: `Website`, url: `https://saeris.gg` }]
};
