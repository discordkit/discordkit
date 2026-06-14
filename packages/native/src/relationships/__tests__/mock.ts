import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";
// Relationships embed a user, so readRelationship calls the users domain's
// readUser — which needs the users mock handlers registered. Import for that
// side effect (the `Discord_UserHandle_*` getters), plus the ScriptedUser type.
import "../../users/__tests__/mock.js";
import type { ScriptedUser } from "../../users/__tests__/mock.js";

/**
 * Mock behavior for the relationships domain — registered with the shared mock
 * backend, kept next to the relationships specs.
 *
 * `scriptRelationships` sets what `getRelationships`/`getRelationship` return;
 * the `RelationshipHandle` getters read them back (stashed as `__rel` on the
 * handle). Action ops (block, accept, …) record their name and auto-ack their
 * result callback as success.
 */

/** Raw field values a test scripts for the mock's `RelationshipHandle` getters. */
export interface ScriptedRelationship {
  userId: bigint;
  discordType: number;
  gameType: number;
  spamRequest: boolean;
  user?: ScriptedUser;
}

interface RelState {
  relationships: ScriptedRelationship[];
  /** Names of the relationship ACTION ops invoked, in order. */
  actions: string[];
}

const store = new WeakMap<MockState, RelState>();
const stateOf = (s: MockState): RelState => {
  let v = store.get(s);
  if (!v) {
    v = { relationships: [], actions: [] };
    store.set(s, v);
  }
  return v;
};

/** Make `getRelationships`/`getRelationship` report these relationships. */
export const scriptRelationships = (
  state: MockState,
  relationships: ScriptedRelationship[]
): void => {
  stateOf(state).relationships = relationships;
};

/** Names of the relationship action ops invoked on this mock, in order. */
export const relationshipActionsOf = (state: MockState): string[] =>
  stateOf(state).actions;

const relOf = (handle: unknown): ScriptedRelationship | undefined =>
  (handle as { __rel?: ScriptedRelationship }).__rel;

/** All relationship action ops — recorded + auto-acked as success. */
const ACTIONS = [
  `Discord_Client_AcceptDiscordFriendRequest`,
  `Discord_Client_AcceptGameFriendRequest`,
  `Discord_Client_RejectDiscordFriendRequest`,
  `Discord_Client_RejectGameFriendRequest`,
  `Discord_Client_CancelDiscordFriendRequest`,
  `Discord_Client_CancelGameFriendRequest`,
  `Discord_Client_RemoveDiscordAndGameFriend`,
  `Discord_Client_RemoveGameFriend`,
  `Discord_Client_BlockUser`,
  `Discord_Client_UnblockUser`,
  `Discord_Client_SendDiscordFriendRequest`,
  `Discord_Client_SendGameFriendRequest`,
  `Discord_Client_SendDiscordFriendRequestById`,
  `Discord_Client_SendGameFriendRequestById`
];

const action = (ctx: MockContext): undefined => {
  stateOf(ctx.state).actions.push(ctx.name);
  ctx.fireResultCallback();
  return undefined;
};

registerMockHandlers({
  Discord_Client_GetRelationships: (ctx) => {
    (ctx.args[1] as { __span?: unknown[] }).__span = stateOf(
      ctx.state
    ).relationships.map((rel) => ({ __rel: rel }));
    return undefined;
  },
  Discord_Client_GetRelationshipHandle: (ctx) => {
    const rel =
      stateOf(ctx.state).relationships.find((r) => r.userId === ctx.args[1]) ??
      null;
    (ctx.args[2] as { __rel?: ScriptedRelationship | null }).__rel = rel;
    return undefined;
  },
  Discord_RelationshipHandle_Id: (ctx) => relOf(ctx.args[0])?.userId ?? 0n,
  Discord_RelationshipHandle_DiscordRelationshipType: (ctx) =>
    relOf(ctx.args[0])?.discordType ?? 0,
  Discord_RelationshipHandle_GameRelationshipType: (ctx) =>
    relOf(ctx.args[0])?.gameType ?? 0,
  Discord_RelationshipHandle_IsSpamRequest: (ctx) =>
    Boolean(relOf(ctx.args[0])?.spamRequest),
  Discord_RelationshipHandle_User: (ctx) => {
    const rel = relOf(ctx.args[0]);
    if (!rel?.user) return false;
    (ctx.args[1] as { __user?: ScriptedUser }).__user = rel.user;
    return true;
  },
  ...Object.fromEntries(ACTIONS.map((name) => [name, action]))
});
