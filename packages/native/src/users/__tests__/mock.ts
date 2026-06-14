import {
  registerMockHandlers,
  type MockContext,
  type MockState,
  type MockString
} from "../../__tests__/mockBackend.js";

/**
 * Mock behavior for the users domain — registered with the shared mock backend
 * and kept here, next to the users specs, rather than in a central switch.
 *
 * `scriptUser` sets what `getCurrentUser`/`getUser` return; the `UserHandle`
 * getters read those values back. Reads stash the scripted user on the out-param
 * handle object (`__user`) so the per-field getters can find it.
 */

/** Raw field values a test scripts for the mock's `UserHandle` getters. */
export interface ScriptedUser {
  id: bigint;
  username: string;
  displayName: string;
  globalName?: string;
  avatar?: string;
  status: number;
  provisional: boolean;
}

const scripted = new WeakMap<MockState, ScriptedUser | null>();

/** Make `getCurrentUser`/`getUser` report this user (or `null` for "absent"). */
export const scriptUser = (
  state: MockState,
  user: ScriptedUser | null
): void => {
  scripted.set(state, user);
};

const userOf = (handle: unknown): ScriptedUser | undefined =>
  (handle as { __user?: ScriptedUser }).__user;

/** Write a scripted string field into the out-param, returning the present-bool. */
const stringField =
  (key: `username` | `displayName` | `globalName` | `avatar`) =>
  (ctx: MockContext): boolean => {
    const value = userOf(ctx.args[0])?.[key];
    if (value === undefined) return false;
    ctx.writeString(ctx.args[1], value);
    return true;
  };

registerMockHandlers({
  // Entry ops: report validity from scripted state + stash the user on the out.
  Discord_Client_GetCurrentUserV2: (ctx) => {
    const user = scripted.get(ctx.state) ?? null;
    if (!user) return false;
    (ctx.args[1] as { __user?: ScriptedUser }).__user = user;
    return true;
  },
  Discord_Client_GetUser: (ctx) => {
    const user = scripted.get(ctx.state) ?? null;
    if (!user) return false;
    (ctx.args[2] as { __user?: ScriptedUser }).__user = user;
    return true;
  },
  // Handle getters: read the stashed user.
  Discord_UserHandle_Id: (ctx) => userOf(ctx.args[0])?.id ?? 0n,
  Discord_UserHandle_Status: (ctx) => userOf(ctx.args[0])?.status ?? 7,
  Discord_UserHandle_IsProvisional: (ctx) =>
    Boolean(userOf(ctx.args[0])?.provisional),
  Discord_UserHandle_Username: stringField(`username`),
  Discord_UserHandle_DisplayName: stringField(`displayName`),
  Discord_UserHandle_GlobalName: stringField(`globalName`),
  Discord_UserHandle_Avatar: stringField(`avatar`)
});

export type { MockString };
