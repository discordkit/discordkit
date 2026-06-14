import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptUser, type ScriptedUser } from "./mock.js";
import { getCurrentUser } from "../users.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

const FULL: ScriptedUser = {
  id: 42n,
  username: `ada`,
  displayName: `Ada L.`,
  globalName: `Ada Lovelace`,
  avatar: `abc123`,
  status: 0, // online
  provisional: false
};

describe(`getCurrentUser (mock backend)`, () => {
  it(`reads the current user into a snapshot`, () => {
    using client = createClient(config);
    scriptUser(mockStateOf(client.lib), FULL);
    const user = getCurrentUser({ client });
    // Why: getCurrentUser must read every field off the handle into a plain
    // snapshot — a missing field means a getter wasn't wired or marshaled right.
    expect(user).toEqual({
      id: 42n,
      username: `ada`,
      displayName: `Ada L.`,
      globalName: `Ada Lovelace`,
      avatar: `abc123`,
      status: `online`,
      provisional: false
    });
    expect(mockStateOf(client.lib).calls).toContain(
      `Discord_Client_GetCurrentUserV2`
    );
  });

  it(`returns undefined when there is no current user`, () => {
    using client = createClient(config);
    // No scripted user → the SDK reports an invalid handle.
    // Why: before auth/connect there's no current user; we must surface that as
    // undefined, not a zeroed-out snapshot.
    expect(getCurrentUser({ client })).toBeUndefined();
  });
});
