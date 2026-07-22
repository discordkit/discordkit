import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";

/**
 * Mock behavior for the presence domain — registered with the shared mock
 * backend, kept next to the presence specs.
 *
 * The `Discord_Activity*` setters capture each field into a per-library
 * {@link ScriptedActivity} the tests assert against ({@link presenceOf}); the
 * sub-object attach calls record which sub-objects were attached;
 * `UpdateRichPresence` acks its callback; `ClearRichPresence` flips `cleared`.
 */

/** Captured activity fields from the last `setActivity` call sequence. */
export interface ScriptedActivity {
  type?: number;
  name?: string;
  state?: string;
  details?: string;
  stateUrl?: string;
  detailsUrl?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  startTimestamp?: bigint;
  endTimestamp?: bigint;
  partyId?: string;
  partyCurrent?: number;
  partyMax?: number;
  statusDisplayType?: number;
  buttons: { label?: string; url?: string }[];
  attached: string[];
  /** Whether `ClearRichPresence` was called. */
  cleared: boolean;
}

const store = new WeakMap<MockState, ScriptedActivity>();
/** The captured presence for a mock-backed client (created on first access). */
export const presenceOf = (state: MockState): ScriptedActivity => {
  let v = store.get(state);
  if (!v) {
    v = { buttons: [], attached: [], cleared: false };
    store.set(state, v);
  }
  return v;
};

/** Capture a decoded string field onto the activity. */
/** The string-valued fields of {@link ScriptedActivity} `setStr` can target. */
type StringField =
  | `name`
  | `state`
  | `details`
  | `stateUrl`
  | `detailsUrl`
  | `largeImage`
  | `largeText`
  | `smallImage`
  | `smallText`
  | `partyId`;

const setStr =
  (key: StringField) =>
  (ctx: MockContext): undefined => {
    presenceOf(ctx.state)[key] = ctx.decodeString(ctx.args[1]);
    return undefined;
  };

/** Record a sub-object attach. */
const attach =
  (kind: string) =>
  (ctx: MockContext): undefined => {
    presenceOf(ctx.state).attached.push(kind);
    return undefined;
  };

registerMockHandlers({
  Discord_Activity_SetType: (ctx) => {
    presenceOf(ctx.state).type = ctx.args[1] as number;
    return undefined;
  },
  Discord_Activity_SetStatusDisplayType: (ctx) => {
    // The setter takes an int pointer (`encodeInt32Ptr` → `{ __int32 }`).
    presenceOf(ctx.state).statusDisplayType = (
      ctx.args[1] as { __int32: number }
    ).__int32;
    return undefined;
  },
  Discord_Activity_SetName: (ctx) => {
    presenceOf(ctx.state).name = ctx.decodeString(ctx.args[1]);
    return undefined;
  },
  Discord_Activity_SetState: setStr(`state`),
  Discord_Activity_SetDetails: setStr(`details`),
  Discord_Activity_SetStateUrl: setStr(`stateUrl`),
  Discord_Activity_SetDetailsUrl: setStr(`detailsUrl`),
  Discord_ActivityAssets_SetLargeImage: setStr(`largeImage`),
  Discord_ActivityAssets_SetLargeText: setStr(`largeText`),
  Discord_ActivityAssets_SetSmallImage: setStr(`smallImage`),
  Discord_ActivityAssets_SetSmallText: setStr(`smallText`),
  Discord_ActivityTimestamps_SetStart: (ctx) => {
    presenceOf(ctx.state).startTimestamp = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityTimestamps_SetEnd: (ctx) => {
    presenceOf(ctx.state).endTimestamp = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityParty_SetId: setStr(`partyId`),
  Discord_ActivityParty_SetCurrentSize: (ctx) => {
    presenceOf(ctx.state).partyCurrent = ctx.args[1] as number;
    return undefined;
  },
  Discord_ActivityParty_SetMaxSize: (ctx) => {
    presenceOf(ctx.state).partyMax = ctx.args[1] as number;
    return undefined;
  },
  Discord_ActivityButton_SetLabel: (ctx) => {
    presenceOf(ctx.state).buttons.push({
      label: ctx.decodeString(ctx.args[1])
    });
    return undefined;
  },
  Discord_ActivityButton_SetUrl: (ctx) => {
    const last = presenceOf(ctx.state).buttons.at(-1);
    if (last) last.url = ctx.decodeString(ctx.args[1]);
    return undefined;
  },
  Discord_Activity_SetAssets: attach(`assets`),
  Discord_Activity_SetTimestamps: attach(`timestamps`),
  Discord_Activity_SetParty: attach(`party`),
  Discord_Activity_AddButton: attach(`button`),
  Discord_Client_UpdateRichPresence: (ctx) => {
    ctx.fireResultCallback(null);
    return undefined;
  },
  Discord_Client_ClearRichPresence: (ctx) => {
    presenceOf(ctx.state).cleared = true;
    return undefined;
  }
});
