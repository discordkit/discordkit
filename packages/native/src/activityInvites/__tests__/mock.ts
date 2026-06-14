import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";

/**
 * Mock behavior for the activity-invites domain — registered with the shared mock
 * backend, kept next to the activity-invites specs.
 *
 * Three concerns:
 * - **Outbound ops** (`SendActivityInvite`, `SendActivityJoinRequest`,
 *   `SendActivityJoinRequestReply`, `AcceptActivityInvite`) record their name and
 *   ack their result callback. `Accept` additionally fires a scripted join-secret
 *   string (the only action whose callback carries a value).
 * - **The `ActivityInvite` handle** round-trips: `buildActivityInvite` (setters)
 *   captures fields onto a record stashed on the handle; the inbound getters read
 *   the same record back. A test scripts an inbound invite with
 *   {@link scriptActivityInvite} and inspects a built one with
 *   {@link builtInviteOf}.
 * - **Event subscriptions** capture the registered callback so a test can deliver
 *   an invite on demand via {@link fireActivityInvite}.
 */

/** Raw field values for the mock's `ActivityInvite` getters / from its setters. */
export interface ScriptedInvite {
  type: number;
  senderId: bigint;
  channelId: bigint;
  messageId: bigint;
  applicationId: bigint;
  parentApplicationId: bigint;
  partyId: string;
  sessionId: string;
  valid: boolean;
}

interface InviteState {
  /** Names of the outbound ops invoked, in order. */
  actions: string[];
  /** The join secret `AcceptActivityInvite` resolves with. */
  joinSecret: string;
  /** Captured registered subscription callbacks, keyed by which setter took them. */
  subscriptions: Partial<Record<`created` | `updated`, unknown>>;
  /** The backend's raw-callback invoker (captured when a subscription registers). */
  invoke?: (cb: unknown, ...args: unknown[]) => void;
}

const store = new WeakMap<MockState, InviteState>();
const stateOf = (s: MockState): InviteState => {
  let v = store.get(s);
  if (!v) {
    v = { actions: [], joinSecret: `mock-join-secret`, subscriptions: {} };
    store.set(s, v);
  }
  return v;
};

/** A fully-populated scripted invite, overridable per field. */
export const makeInvite = (
  overrides: Partial<ScriptedInvite> = {}
): ScriptedInvite => ({
  type: 1, // join
  senderId: 555n,
  channelId: 777n,
  messageId: 888n,
  applicationId: 999n,
  parentApplicationId: 0n,
  partyId: `party-1`,
  sessionId: `session-1`,
  valid: true,
  ...overrides
});

/** Names of the outbound activity-invite ops invoked on this mock, in order. */
export const inviteActionsOf = (state: MockState): string[] =>
  stateOf(state).actions;

/** Set the join secret `acceptActivityInvite` resolves with. */
export const scriptJoinSecret = (state: MockState, secret: string): void => {
  stateOf(state).joinSecret = secret;
};

/** Read the invite a `buildActivityInvite` call captured from a handle. */
export const builtInviteOf = (handle: unknown): ScriptedInvite | undefined =>
  (handle as { __invite?: ScriptedInvite }).__invite;

/** Deliver an invite through a captured subscription callback (created/updated). */
export const fireActivityInvite = (
  state: MockState,
  kind: `created` | `updated`,
  invite: ScriptedInvite
): void => {
  const s = stateOf(state);
  // The real ActivityInviteCallback receives a native handle; mirror that by
  // passing a handle carrying the scripted invite for the getters to read.
  s.invoke?.(s.subscriptions[kind], { __invite: invite });
};

const inviteOf = (handle: unknown): ScriptedInvite | undefined =>
  (handle as { __invite?: ScriptedInvite }).__invite;

/** Ensure a built handle has a record to capture setters into. */
const recordOf = (handle: unknown): ScriptedInvite => {
  const h = handle as { __invite?: ScriptedInvite };
  h.__invite ??= makeInvite();
  return h.__invite;
};

const action =
  (afterResult: (ctx: MockContext) => unknown[]) =>
  (ctx: MockContext): undefined => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback(...afterResult(ctx));
    return undefined;
  };

registerMockHandlers({
  // --- outbound ops ---
  Discord_Client_SendActivityInvite: action(() => []),
  Discord_Client_SendActivityJoinRequest: action(() => []),
  Discord_Client_SendActivityJoinRequestReply: action(() => []),
  Discord_Client_AcceptActivityInvite: action((ctx) => [
    { __str: stateOf(ctx.state).joinSecret }
  ]),
  // --- event subscriptions: capture the registered callback symbol ---
  Discord_Client_SetActivityInviteCreatedCallback: (ctx) => {
    const s = stateOf(ctx.state);
    s.subscriptions.created = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  },
  Discord_Client_SetActivityInviteUpdatedCallback: (ctx) => {
    const s = stateOf(ctx.state);
    s.subscriptions.updated = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  },
  // --- ActivityInvite handle: setters capture, getters read back ---
  Discord_ActivityInvite_Init: () => undefined,
  Discord_ActivityInvite_Drop: () => undefined,
  Discord_ActivityInvite_SetType: (ctx) => {
    recordOf(ctx.args[0]).type = ctx.args[1] as number;
    return undefined;
  },
  Discord_ActivityInvite_SetSenderId: (ctx) => {
    recordOf(ctx.args[0]).senderId = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityInvite_SetChannelId: (ctx) => {
    recordOf(ctx.args[0]).channelId = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityInvite_SetMessageId: (ctx) => {
    recordOf(ctx.args[0]).messageId = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityInvite_SetApplicationId: (ctx) => {
    recordOf(ctx.args[0]).applicationId = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityInvite_SetParentApplicationId: (ctx) => {
    recordOf(ctx.args[0]).parentApplicationId = ctx.args[1] as bigint;
    return undefined;
  },
  Discord_ActivityInvite_SetIsValid: (ctx) => {
    recordOf(ctx.args[0]).valid = Boolean(ctx.args[1]);
    return undefined;
  },
  Discord_ActivityInvite_SetPartyId: (ctx) => {
    recordOf(ctx.args[0]).partyId = ctx.decodeString(ctx.args[1]);
    return undefined;
  },
  Discord_ActivityInvite_SetSessionId: (ctx) => {
    recordOf(ctx.args[0]).sessionId = ctx.decodeString(ctx.args[1]);
    return undefined;
  },
  Discord_ActivityInvite_Type: (ctx) => inviteOf(ctx.args[0])?.type ?? 0,
  Discord_ActivityInvite_SenderId: (ctx) =>
    inviteOf(ctx.args[0])?.senderId ?? 0n,
  Discord_ActivityInvite_ChannelId: (ctx) =>
    inviteOf(ctx.args[0])?.channelId ?? 0n,
  Discord_ActivityInvite_MessageId: (ctx) =>
    inviteOf(ctx.args[0])?.messageId ?? 0n,
  Discord_ActivityInvite_ApplicationId: (ctx) =>
    inviteOf(ctx.args[0])?.applicationId ?? 0n,
  Discord_ActivityInvite_ParentApplicationId: (ctx) =>
    inviteOf(ctx.args[0])?.parentApplicationId ?? 0n,
  Discord_ActivityInvite_IsValid: (ctx) =>
    Boolean(inviteOf(ctx.args[0])?.valid),
  Discord_ActivityInvite_PartyId: (ctx) => {
    ctx.writeString(ctx.args[1], inviteOf(ctx.args[0])?.partyId ?? ``);
    return undefined;
  },
  Discord_ActivityInvite_SessionId: (ctx) => {
    ctx.writeString(ctx.args[1], inviteOf(ctx.args[0])?.sessionId ?? ``);
    return undefined;
  }
});
