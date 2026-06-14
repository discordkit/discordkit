import type {
  FfiBackend,
  FfiLibrary,
  FfiFunction,
  FfiOpaque,
  DiscordStringValue
} from "../ffi/backend.js";

/**
 * A pure-TypeScript {@link FfiBackend} for contract tests — no native code, no
 * compiler, runs anywhere. It fulfills the same seam the Koffi backend does, so
 * `createClient({ backend: mockBackend })` exercises ALL of our binding logic
 * (lifecycle, status-signal wiring, the presence call sequence, dispose) without
 * the redistribution-restricted real SDK.
 *
 * It scripts just enough SDK behavior to be meaningful: on `Discord_RunCallbacks`
 * it drives the status callback `Disconnected → Connecting → Ready` and emits a
 * log line; result-bearing async callbacks (rich presence, token) fire success
 * synchronously when their function is called. A {@link MockState} handle records
 * everything for assertions.
 *
 * NOTE: koffi's *marshaling* correctness (struct-by-value, pointer params,
 * cross-ABI callback delivery) is covered by the real-SDK smoke test, not here —
 * this verifies OUR code, which is where the bugs live.
 */

/** Records calls + scripted state for assertions. One per mock library. */
export interface MockState {
  /** Names of every C function invoked, in order. */
  readonly calls: string[];
  /** Activity fields captured by the last `Discord_*_Set*` sequence. */
  readonly activity: {
    type?: number;
    name?: string;
    state?: string | null;
    details?: string | null;
    stateUrl?: string | null;
    detailsUrl?: string | null;
    largeImage?: string | null;
    largeText?: string | null;
    smallImage?: string | null;
    smallText?: string | null;
    startTimestamp?: bigint;
    endTimestamp?: bigint;
    partyId?: string;
    partyCurrent?: number;
    partyMax?: number;
    buttons: { label?: string; url?: string }[];
    attached: string[];
  };
  /** Resolved application id passed to `SetApplicationId`. */
  applicationId?: bigint;
  /** Whether `Discord_Client_Drop` has been called. */
  dropped: boolean;
  /** Whether `Discord_Client_ClearRichPresence` has been called. */
  cleared: boolean;
  /** Count of registered-but-not-unregistered callbacks (leak check). */
  liveCallbacks: number;
  /**
   * Scripted user data for the users domain. Set this to make
   * `GetCurrentUserV2`/`GetUser` report a valid handle and the
   * `Discord_UserHandle_*` getters read these values back. Leave unset (or set
   * `null`) to make those ops report an invalid/absent user.
   */
  scriptedUser: ScriptedUser | null;
  /** Force the next pump to advance the scripted status by one step. */
  readonly pump: () => void;
}

/** Raw field values a test scripts for the mock's `UserHandle` getters to return. */
export interface ScriptedUser {
  id: bigint;
  username: string;
  displayName: string;
  globalName?: string;
  avatar?: string;
  status: number;
  provisional: boolean;
}

const states = new WeakMap<FfiLibrary, MockState>();

/** Retrieve the {@link MockState} for a mock-backed client's library. */
export const mockStateOf = (lib: FfiLibrary): MockState => {
  const s = states.get(lib);
  if (!s) throw new Error(`not a mock-backed library`);
  return s;
};

const STATUS_SEQUENCE = [1, 2, 3]; // Connecting, Connected, Ready

export const mockBackend: FfiBackend = (_libraryPath: string): FfiLibrary => {
  type Handler = (...args: any[]) => void;
  /** Mock string tag — what encodeString produces and decodeString reads. */
  interface MockString {
    __str: string;
  }
  const isMockString = (v: unknown): v is MockString =>
    typeof v === `object` &&
    v !== null &&
    typeof (v as MockString).__str === `string`;

  const calls: string[] = [];
  const registered = new Map<symbol, Handler>();
  let statusCb: Handler | undefined;
  let logCb: Handler | undefined;
  let statusStep = 0;
  const activity: MockState[`activity`] = { buttons: [], attached: [] };

  // Each "handle" is just a tagged object; the binding layer treats it as opaque.
  const handle = (): FfiOpaque => ({ __mock: `handle` });

  const decodeString = (value: unknown): string =>
    isMockString(value) ? value.__str : ``;
  const encodeString = (value: string): DiscordStringValue => {
    const tagged: MockString = { __str: value };
    return tagged as unknown as DiscordStringValue;
  };
  // The mock treats by-value and by-pointer strings the same (the tag carries
  // the value either way); the real backend distinguishes them.
  const encodeStringPtr = (value: string): unknown => ({ __str: value });

  const lib: FfiLibrary = {
    func: (declaration: string): FfiFunction => {
      const name = /\b(Discord_\w+)\s*\(/.exec(declaration)?.[1] ?? declaration;
      return (...args: any[]): unknown => {
        calls.push(name);
        switch (name) {
          case `Discord_Client_SetApplicationId`:
            state.applicationId = args[1] as bigint;
            return undefined;
          case `Discord_Client_Drop`:
            state.dropped = true;
            return undefined;
          case `Discord_RunCallbacks`:
            // Advance scripted status one step per pump; emit a log once.
            if (statusStep < STATUS_SEQUENCE.length && statusCb) {
              statusCb(STATUS_SEQUENCE[statusStep], 0, 0);
              statusStep++;
            }
            if (statusStep === 1) {
              logCb?.({ __str: `mock connecting` }, 2);
            }
            return undefined;
          case `Discord_Activity_SetType`:
            activity.type = args[1] as number;
            return undefined;
          case `Discord_Activity_SetName`:
            activity.name = decodeString(args[1]);
            return undefined;
          case `Discord_Activity_SetState`:
            activity.state = decodeString(args[1]);
            return undefined;
          case `Discord_Activity_SetDetails`:
            activity.details = decodeString(args[1]);
            return undefined;
          case `Discord_Activity_SetStateUrl`:
            activity.stateUrl = decodeString(args[1]);
            return undefined;
          case `Discord_Activity_SetDetailsUrl`:
            activity.detailsUrl = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityAssets_SetLargeImage`:
            activity.largeImage = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityAssets_SetLargeText`:
            activity.largeText = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityAssets_SetSmallImage`:
            activity.smallImage = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityAssets_SetSmallText`:
            activity.smallText = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityTimestamps_SetStart`:
            activity.startTimestamp = args[1] as bigint;
            return undefined;
          case `Discord_ActivityTimestamps_SetEnd`:
            activity.endTimestamp = args[1] as bigint;
            return undefined;
          case `Discord_ActivityParty_SetId`:
            activity.partyId = decodeString(args[1]);
            return undefined;
          case `Discord_ActivityParty_SetCurrentSize`:
            activity.partyCurrent = args[1] as number;
            return undefined;
          case `Discord_ActivityParty_SetMaxSize`:
            activity.partyMax = args[1] as number;
            return undefined;
          case `Discord_ActivityButton_SetLabel`:
            activity.buttons.push({ label: decodeString(args[1]) });
            return undefined;
          case `Discord_ActivityButton_SetUrl`:
            {
              const last = activity.buttons.at(-1);
              if (last) last.url = decodeString(args[1]);
            }
            return undefined;
          case `Discord_Activity_SetAssets`:
            activity.attached.push(`assets`);
            return undefined;
          case `Discord_Activity_SetTimestamps`:
            activity.attached.push(`timestamps`);
            return undefined;
          case `Discord_Activity_SetParty`:
            activity.attached.push(`party`);
            return undefined;
          case `Discord_Activity_AddButton`:
            activity.attached.push(`button`);
            return undefined;
          case `Discord_Client_UpdateRichPresence`: {
            // args: (self, activityHandle, cb, cbFree, cbUserData)
            const cb = args[2] as symbol;
            registered.get(cb)?.(null, null);
            return undefined;
          }
          case `Discord_Client_ClearRichPresence`:
            state.cleared = true;
            return undefined;
          // --- users: sync getters fill a UserHandle out-param + report valid.
          // GetCurrentUserV2(self, out) / GetUser(self, id, out) — the out-param
          // is the last arg. Stash the scripted user on it so the UserHandle_*
          // getters below read it back.
          case `Discord_Client_GetCurrentUserV2`:
          case `Discord_Client_GetUser`: {
            if (!state.scriptedUser) return false;
            const out = args[args.length - 1] as { __user?: ScriptedUser };
            out.__user = state.scriptedUser;
            return true;
          }
          case `Discord_UserHandle_Id`:
            return (args[0] as { __user?: ScriptedUser }).__user?.id ?? 0n;
          case `Discord_UserHandle_Status`:
            return (args[0] as { __user?: ScriptedUser }).__user?.status ?? 7;
          case `Discord_UserHandle_IsProvisional`:
            return Boolean(
              (args[0] as { __user?: ScriptedUser }).__user?.provisional
            );
          // String getters: write the field into the out-param (args[1]) and
          // return whether it's present (matching the real bool-gated getters).
          case `Discord_UserHandle_Username`:
          case `Discord_UserHandle_DisplayName`:
          case `Discord_UserHandle_GlobalName`:
          case `Discord_UserHandle_Avatar`: {
            const user = (args[0] as { __user?: ScriptedUser }).__user;
            const field = (
              {
                Discord_UserHandle_Username: `username`,
                Discord_UserHandle_DisplayName: `displayName`,
                Discord_UserHandle_GlobalName: `globalName`,
                Discord_UserHandle_Avatar: `avatar`
              } as const
            )[name];
            const value = user?.[field];
            if (value === undefined) return false;
            (args[1] as MockString).__str = value;
            return true;
          }
          case `Discord_ClientResult_Successful`:
            return true;
          default:
            return undefined;
        }
      };
    },
    defineCallback: (declaration: string): FfiOpaque => ({
      __proto: declaration
    }),
    registerCallback: (type, fn): FfiOpaque => {
      const key = Symbol(`cb`);
      registered.set(key, fn);
      const decl =
        typeof type === `object` && type !== null && `__proto` in type
          ? String((type as { __proto: unknown }).__proto)
          : ``;
      if (decl.includes(`OnStatusChanged`)) statusCb = fn;
      if (decl.includes(`LogCallback`)) logCb = fn;
      return key;
    },
    unregisterCallback: (h): void => {
      registered.delete(h as symbol);
    },
    allocHandle: handle,
    allocStringOut: handle,
    decodeString,
    encodeString,
    encodeStringPtr
  };

  const state: MockState = {
    calls,
    activity,
    dropped: false,
    cleared: false,
    scriptedUser: null,
    get liveCallbacks() {
      return registered.size;
    },
    pump: () => {
      lib.func(`void Discord_RunCallbacks()`)();
    }
  };
  states.set(lib, state);
  return lib;
};
