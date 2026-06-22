/* eslint-disable @typescript-eslint/explicit-function-return-type --
   The XState machine config is dense with inline guard/action/params arrows whose
   return types the framework infers; annotating each would add noise without value. */
import { setup, assign, fromPromise, fromCallback } from "xstate";
import type { Relationship } from "@discordkit/tauri/renderer/relationships";
import type { Status } from "@discordkit/tauri/renderer";
import { getDiscord, resetDiscord } from "./discord.js";

/**
 * The connection + friends lifecycle as a state machine. The app has enough states — booting, silently resuming a stored session, the user-driven connect flow (which can be cancelled or hit a Discord that isn't running), loading relationships, logging out — that modelling them explicitly is clearer and less bug-prone than ad-hoc flags.
 *
 * Shape: a long-lived `statusListener` actor feeds the live SDK connection status in as `STATUS` events (decoupling "what the SDK reports" from "what the user does"), while transient promise actors run the user-initiated operations (`connect`, `logout`) and the relationships read (`loadFriends`). Connectivity is driven by status (the SDK reaches `ready` after a user connect OR an automatic boot-resume in the sidecar), so both paths land in `connected` the same way.
 */

/** Why a connect attempt failed — drives which error UI to show. */
export type ConnectErrorKind =
  | `declined` // user cancelled the Discord authorization prompt
  | `discordDown` // the local Discord client didn't respond (not running)
  | `redirectUri` // the browser-fallback OAuth redirect URI isn't registered
  | `sdkMissing` // the sidecar couldn't load the Social SDK
  | `failed`; // any other failure

export interface ConnectError {
  kind: ConnectErrorKind;
  message: string;
  /** Sidecar stderr, for the `sdkMissing` case (the SDK's actionable guidance). */
  stderr?: string;
}

interface Context {
  friends: Relationship[];
  /** The last connect failure, shown by the `connectError` state. */
  error?: ConnectError;
  /** The last relationships-load failure message, shown in the connected view. */
  friendsError?: string;
}

type Events =
  | { type: `STATUS`; status: Status }
  | { type: `CONNECT` }
  | { type: `LOGOUT` }
  | { type: `REFRESH` }
  | { type: `RETRY` };

/** Read an own string property off an unknown value without asserting its shape. */
const prop = (value: unknown, key: string): string | undefined => {
  if (typeof value !== `object` || value === null) return undefined;
  const v: unknown = Reflect.get(value, key);
  return typeof v === `string` ? v : undefined;
};

/**
 * Classify a bridge/auth error. kkrpc reconstructs a plain `Error` on the webview
 * side (not the original class), but carries `name` + custom props through — so we
 * branch on `name` and the `reason`/`stderr` props, not `instanceof`.
 */
const classifyError = (error: unknown): ConnectError => {
  const message = prop(error, `message`) ?? `Unknown error.`;
  const name = prop(error, `name`);
  if (name === `SidecarStartupError`) {
    return { kind: `sdkMissing`, message, stderr: prop(error, `stderr`) };
  }
  if (name === `AuthorizeError`) {
    const reason = prop(error, `reason`);
    if (reason === `declined`) return { kind: `declined`, message };
    if (reason === `timeout`) return { kind: `discordDown`, message };
  }
  // The browser-fallback flow (Discord client not running) fails with an OAuth2
  // redirect error when `http://127.0.0.1/callback` isn't registered for the app.
  if (message.includes(`redirect`)) return { kind: `redirectUri`, message };
  return { kind: `failed`, message };
};

export const discordMachine = setup({
  types: {
    // The `{} as T` form is XState v5's sanctioned way to declare context/event
    // types in `setup` (there's no runtime value, only the type).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    context: {} as Context,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    events: {} as Events
  },
  actors: {
    // Long-lived: pipe the SDK's live connection status into the machine as events.
    // Seeds the CURRENT status once (`getStatus`) before listening for changes — a
    // silent boot-resume can reach `ready` before we subscribe, so listening to
    // future events alone would miss it and leave us stuck in `initializing`.
    statusListener: fromCallback<Events>(({ sendBack }) => {
      let off: (() => void) | undefined;
      void (async (): Promise<void> => {
        const discord = await getDiscord();
        off = discord.onStatus((status) =>
          sendBack({ type: `STATUS`, status })
        );
        sendBack({ type: `STATUS`, status: await discord.getStatus() });
      })();
      return (): void => off?.();
    }),
    // User-initiated connect: runs the OAuth flow (or silent resume). Rejecting
    // with a typed error is how cancel / Discord-not-running surface.
    connect: fromPromise(async () => {
      const discord = await getDiscord();
      await discord.connect();
    }),
    logout: fromPromise(async () => {
      const discord = await getDiscord();
      await discord.logout();
    }),
    loadFriends: fromPromise<Relationship[]>(async () => {
      const discord = await getDiscord();
      return discord.relationships.list();
    })
  },
  guards: {
    isReady: (_, params: { status: Status }) => params.status === `ready`
  }
}).createMachine({
  id: `discord`,
  context: { friends: [] },
  // The status listener runs for the machine's whole life.
  invoke: { src: `statusListener` },
  // Until the first STATUS arrives we don't know if the sidecar boot-resumed a
  // stored session, so we wait (showing a spinner) rather than flashing the
  // connect button.
  initial: `initializing`,
  // A STATUS=ready at ANY point means we're connected (covers a silent boot-resume
  // that completes while we're sitting in disconnected/error).
  on: {
    STATUS: [
      {
        guard: {
          type: `isReady`,
          params: ({ event }) => ({ status: event.status })
        },
        target: `.connected`
      }
    ]
  },
  states: {
    initializing: {
      on: {
        // First non-ready status (or the resume failing to connect) → disconnected.
        STATUS: {
          guard: ({ event }) => event.status !== `ready`,
          target: `disconnected`
        }
      }
    },

    disconnected: {
      // Clear any stale data/errors so the connect screen is clean.
      entry: assign({ friends: [], error: undefined, friendsError: undefined }),
      on: { CONNECT: `connecting` }
    },

    connecting: {
      invoke: {
        src: `connect`,
        // Success just means the flow completed; the move to `connected` happens
        // when STATUS=ready arrives (handled by the top-level `on`).
        onError: {
          target: `connectError`,
          actions: assign({ error: ({ event }) => classifyError(event.error) })
        }
      }
    },

    connectError: {
      on: {
        // RETRY (error panel) and CONNECT (any stray connect affordance) both
        // re-attempt the connection.
        RETRY: [
          // An sdkMissing error means the sidecar process died — drop the cached
          // bridge so the retry re-spawns it.
          {
            guard: ({ context }) => context.error?.kind === `sdkMissing`,
            target: `connecting`,
            actions: () => resetDiscord()
          },
          { target: `connecting` }
        ],
        CONNECT: `connecting`
      }
    },

    connected: {
      initial: `loading`,
      on: {
        LOGOUT: `loggingOut`,
        // A drop to a non-ready status (disconnect / reconnecting) leaves connected.
        STATUS: {
          guard: ({ event }) => event.status !== `ready`,
          target: `disconnected`
        }
      },
      states: {
        loading: {
          invoke: {
            src: `loadFriends`,
            onDone: {
              target: `loaded`,
              actions: assign({
                friends: ({ event }) => event.output,
                friendsError: undefined
              })
            },
            onError: {
              target: `loaded`,
              actions: assign({
                friendsError: ({ event }) =>
                  event.error instanceof Error
                    ? `Couldn't load your friends. ${event.error.message}`
                    : `Couldn't load your friends.`
              })
            }
          }
        },
        loaded: {
          on: { REFRESH: `loading` }
        }
      }
    },

    loggingOut: {
      invoke: {
        src: `logout`,
        // Either way, end up disconnected (a failed logout still drops the UI).
        onDone: `disconnected`,
        onError: `disconnected`
      }
    }
  }
});
